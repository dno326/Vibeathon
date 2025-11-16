from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.flashcard_service import FlashcardService

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
    """Fetch a deck and its cards."""
    # TODO: Implement get deck
    return jsonify({'message': 'Get deck endpoint'}), 200

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

