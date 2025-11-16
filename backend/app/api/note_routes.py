from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.note_service import NoteService
from app.utils.errors import ValidationError, NotFoundError, UnauthorizedError

note_bp = Blueprint('notes', __name__)
note_service = NoteService()

@note_bp.route('/<note_id>', methods=['GET'])
@require_auth
def get_note(note_id):
    """Get a specific note record."""
    # TODO: Implement get note
    return jsonify({'message': 'Get note endpoint'}), 200

@note_bp.route('/<note_id>', methods=['PUT'])
@require_auth
def update_note(note_id):
    """Replace the content of a note."""
    data = request.get_json()
    # TODO: Implement update note
    return jsonify({'message': 'Update note endpoint'}), 200

@note_bp.route('/<note_id>/merge', methods=['POST'])
@require_auth
def merge_notes(note_id):
    """Create or update a merged set of notes for a session."""
    data = request.get_json()
    # TODO: Implement merge notes
    return jsonify({'message': 'Merge notes endpoint'}), 200

@note_bp.route('/pdf', methods=['POST'])
@require_auth
def create_note_from_pdf():
    """Upload a PDF, summarize it, and create a note attached to a class session."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not file.content_type or not file.content_type.lower().endswith('pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        class_id = request.form.get('class_id', '').strip()
        if not class_id:
            return jsonify({'error': 'class_id is required'}), 400
        public_flag = request.form.get('public', 'true').lower() in ['true', '1', 'yes']
        
        user_id = request.current_user.id
        note = note_service.create_note_from_pdf(file, class_id, user_id, public_flag)
        return jsonify(note), 201
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('', methods=['GET'])
@require_auth
def list_my_notes():
    try:
        user_id = request.current_user.id
        notes = note_service.list_notes_for_user(user_id)
        return jsonify({'notes': notes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/class/<class_id>', methods=['GET'])
@require_auth
def list_class_notes(class_id):
    try:
        user_id = request.current_user.id
        # Ensure user is member; service will handle visibility
        notes = note_service.list_public_notes_for_class(class_id, user_id)
        return jsonify({'notes': notes}), 200
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

