from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.comment_service import CommentService

comment_bp = Blueprint('comments', __name__)
comment_service = CommentService()

@comment_bp.route('/sessions/<session_id>', methods=['GET'])
@require_auth
def get_comments(session_id):
    """Get comments for a session."""
    # TODO: Implement get comments
    return jsonify({'comments': []}), 200

@comment_bp.route('/sessions/<session_id>', methods=['POST'])
@require_auth
def create_comment(session_id):
    """Create a comment."""
    data = request.get_json()
    # TODO: Implement create comment
    return jsonify({'message': 'Create comment endpoint'}), 201

