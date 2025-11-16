from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.note_service import NoteService
from app.utils.errors import ValidationError, NotFoundError, UnauthorizedError
import os

note_bp = Blueprint('notes', __name__)
note_service = NoteService()

@note_bp.route('/<note_id>', methods=['GET'])
@require_auth
def get_note(note_id):
    try:
        user_id = request.current_user.id
        note = note_service.get_note_detail(note_id, user_id)
        return jsonify(note), 200
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>/votes', methods=['GET'])
@require_auth
def get_votes(note_id):
    try:
        user_id = request.current_user.id
        data = note_service.get_note_votes_count(note_id, user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>/votes', methods=['POST'])
@require_auth
def add_vote(note_id):
    try:
        user_id = request.current_user.id
        data = note_service.upsert_vote(note_id, user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>/votes', methods=['DELETE'])
@require_auth
def remove_vote(note_id):
    try:
        user_id = request.current_user.id
        data = note_service.remove_vote(note_id, user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>/comments', methods=['GET'])
@require_auth
def list_comments(note_id):
    try:
        user_id = request.current_user.id
        comments = note_service.list_comments(note_id, user_id)
        return jsonify({'comments': comments}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>/comments', methods=['POST'])
@require_auth
def add_comment(note_id):
    try:
        user_id = request.current_user.id
        body = request.get_json() or {}
        content = (body.get('content') or '').strip()
        parent_id = body.get('parent_id') or None
        comment = note_service.add_comment(note_id, user_id, content, parent_id=parent_id)
        return jsonify(comment), 201
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>/comments/<comment_id>', methods=['DELETE'])
@require_auth
def delete_comment(note_id, comment_id):
    try:
        user_id = request.current_user.id
        note_service.delete_comment(note_id, comment_id, user_id)
        return jsonify({'status': 'deleted'}), 200
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>', methods=['PUT'])
@require_auth
def update_note(note_id):
    data = request.get_json()
    # TODO: Implement update note
    return jsonify({'message': 'Update note endpoint'}), 200

@note_bp.route('/<note_id>/merge', methods=['POST'])
@require_auth
def merge_notes(note_id):
    data = request.get_json()
    # TODO: Implement merge notes
    return jsonify({'message': 'Merge notes endpoint'}), 200

@note_bp.route('/pdf', methods=['POST'])
@require_auth
def create_note_from_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        content_type = (file.content_type or '').lower()
        _, ext = os.path.splitext(file.filename.lower())
        if not (content_type in ['application/pdf', 'application/octet-stream'] or ext == '.pdf'):
            return jsonify({'error': f'Unsupported file type: {content_type}. Please upload a PDF.'}), 400
        
        class_id = request.form.get('class_id', '').strip()
        if not class_id:
            return jsonify({'error': 'class_id is required'}), 400
        public_flag = request.form.get('public', 'true').lower() in ['true', '1', 'yes']
        title = request.form.get('title', '').strip()
        
        user_id = request.current_user.id
        note = note_service.create_note_from_pdf(file, class_id, user_id, public_flag, title=title or None)
        return jsonify(note), 201
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 500

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
        notes = note_service.list_public_notes_for_class(class_id, user_id)
        return jsonify({'notes': notes}), 200
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/<note_id>', methods=['DELETE'])
@require_auth
def delete_note(note_id):
    try:
        user_id = request.current_user.id
        note_service.delete_note(note_id, user_id)
        return jsonify({'status': 'deleted'}), 200
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), 403
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

