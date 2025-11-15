from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.class_service import ClassService

class_bp = Blueprint('classes', __name__)
class_service = ClassService()

@class_bp.route('', methods=['POST'])
@require_auth
def create_class():
    """Create a new class."""
    data = request.get_json()
    # TODO: Implement class creation
    return jsonify({'message': 'Create class endpoint'}), 201

@class_bp.route('/join', methods=['POST'])
@require_auth
def join_class():
    """Join an existing class by code."""
    data = request.get_json()
    # TODO: Implement join class
    return jsonify({'message': 'Join class endpoint'}), 200

@class_bp.route('', methods=['GET'])
@require_auth
def list_classes():
    """List classes the user belongs to."""
    # TODO: Implement list classes
    return jsonify({'classes': []}), 200

@class_bp.route('/<class_id>', methods=['GET'])
@require_auth
def get_class(class_id):
    """Get class details, sessions, and decks summary."""
    # TODO: Implement get class
    return jsonify({'message': 'Get class endpoint'}), 200

@class_bp.route('/<class_id>/decks', methods=['GET'])
@require_auth
def list_class_decks(class_id):
    """List decks for a class."""
    # TODO: Implement list class decks
    return jsonify({'decks': []}), 200

