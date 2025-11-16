from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.flashcard_service import FlashcardService
from app.utils.errors import ValidationError

flashcard_bp = Blueprint('decks', __name__)
flashcard_service = FlashcardService()

@flashcard_bp.route('', methods=['POST'])
@require_auth
def create_deck():
    """Create a new deck."""
    # TODO: Implement create deck
    return jsonify({'message': 'Create deck endpoint'}), 201

@flashcard_bp.route('/<deck_id>/generate', methods=['POST'])
@require_auth
def generate_flashcards(deck_id):
    """Generate flashcards for a deck from a note."""
    # TODO: Implement generation
    return jsonify({'message': 'Generate flashcards endpoint'}), 200

@flashcard_bp.route('/<deck_id>', methods=['GET'])
@require_auth
def get_deck(deck_id):
    try:
        user_id = request.current_user.id
        deck = flashcard_service.get_deck(deck_id, user_id)
        return jsonify(deck), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@flashcard_bp.route('/<deck_id>/cards', methods=['POST'])
@require_auth
def create_card(deck_id):
    """Create a flashcard in a deck."""
    # TODO: Implement create card
    return jsonify({'message': 'Create card endpoint'}), 201

@flashcard_bp.route('/study/<deck_id>/start', methods=['POST'])
@require_auth
def start_study(deck_id):
    """Start a study session on a deck."""
    # TODO: Implement study start
    return jsonify({'message': 'Start study endpoint'}), 200

@flashcard_bp.route('/user/<user_id>', methods=['GET'])
@require_auth
def list_user_public_decks(user_id):
    try:
        viewer_id = request.current_user.id
        decks = flashcard_service.list_public_decks_by_user(user_id, viewer_id)
        return jsonify({'decks': decks}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('', methods=['GET'])
@require_auth
def list_my_decks():
    try:
        user_id = request.current_user.id
        decks = flashcard_service.list_user_decks(user_id)
        return jsonify({'decks': decks}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/class/<class_id>', methods=['GET'])
@require_auth
def list_class_decks(class_id):
    try:
        user_id = request.current_user.id
        decks = flashcard_service.list_class_decks(class_id, user_id)
        return jsonify({'decks': decks}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/from-pdfs', methods=['POST'])
@require_auth
def create_deck_from_pdfs():
    try:
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No files provided'}), 400
        class_id = (request.form.get('class_id') or '').strip()
        public = (request.form.get('public') or 'true').lower() in ['true', '1', 'yes']
        title = (request.form.get('title') or '').strip() or None
        deck = flashcard_service.create_deck_from_pdfs(files, class_id, request.current_user.id, public, title)
        return jsonify(deck), 201
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Votes for decks using upvotes table ---
@flashcard_bp.route('/<deck_id>/votes', methods=['GET'])
@require_auth
def deck_votes(deck_id):
    try:
        user_id = request.current_user.id
        res = flashcard_service.admin.table('upvotes').select('id', count='exact').eq('target_id', deck_id).eq('target_type', 'deck').execute()
        count = res.count or 0
        mine = flashcard_service.admin.table('upvotes').select('id').eq('target_id', deck_id).eq('target_type', 'deck').eq('user_id', user_id).execute()
        return jsonify({'count': count, 'user_has_voted': bool(mine.data)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/<deck_id>/votes', methods=['POST'])
@require_auth
def add_deck_vote(deck_id):
    try:
        user_id = request.current_user.id
        flashcard_service.admin.table('upvotes').upsert({'user_id': user_id, 'target_id': deck_id, 'target_type': 'deck'}).execute()
        return deck_votes(deck_id)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/<deck_id>/votes', methods=['DELETE'])
@require_auth
def remove_deck_vote(deck_id):
    try:
        user_id = request.current_user.id
        flashcard_service.admin.table('upvotes').delete().eq('user_id', user_id).eq('target_id', deck_id).eq('target_type', 'deck').execute()
        return deck_votes(deck_id)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Deck comments via generic comments table anchored to deck ---
@flashcard_bp.route('/<deck_id>/comments', methods=['GET'])
@require_auth
def list_deck_comments(deck_id):
    try:
        rows = flashcard_service.admin.table('comments').select('id, user_id, text, created_at').eq('anchor', f'deck:{deck_id}').order('created_at').execute()
        comments = rows.data or []
        for c in comments:
            u = flashcard_service.admin.table('users').select('first_name, last_name').eq('id', c['user_id']).single().execute()
            c['author'] = {'first_name': u.data.get('first_name','') if u.data else '', 'last_name': u.data.get('last_name','') if u.data else ''}
        return jsonify({'comments': comments}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/<deck_id>/comments', methods=['POST'])
@require_auth
def add_deck_comment(deck_id):
    try:
        txt = ((request.get_json() or {}).get('content') or '').strip()
        if not txt:
            return jsonify({'error': 'content required'}), 400
        # Find session_id via deck
        d = flashcard_service.admin.table('flashcard_decks').select('session_id').eq('id', deck_id).single().execute()
        session_id = d.data['session_id'] if d.data else None
        ins = flashcard_service.admin.table('comments').insert({'session_id': session_id, 'note_id': None, 'user_id': request.current_user.id, 'text': txt[:2000], 'anchor': f'deck:{deck_id}'}).execute()
        return jsonify(ins.data[0] if ins.data else {}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/<deck_id>/comments/<comment_id>', methods=['DELETE'])
@require_auth
def delete_deck_comment(deck_id, comment_id):
    try:
        user_id = request.current_user.id
        row = flashcard_service.admin.table('comments').select('id, user_id').eq('id', comment_id).single().execute()
        if not row.data:
            return jsonify({'error': 'Not found'}), 404
        if row.data['user_id'] != user_id:
            return jsonify({'error': 'Forbidden'}), 403
        flashcard_service.admin.table('comments').delete().eq('id', comment_id).execute()
        return jsonify({'status': 'deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

