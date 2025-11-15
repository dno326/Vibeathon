from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.note_service import NoteService

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

