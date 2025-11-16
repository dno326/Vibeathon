from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.class_service import ClassService
from app.utils.errors import ValidationError, NotFoundError, UnauthorizedError

class_bp = Blueprint('classes', __name__)
class_service = ClassService()

@class_bp.route('', methods=['POST'])
@require_auth
def create_class():
    """Create a new class."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': 'Class name is required'}), 400
        
        user_id = request.current_user.id
        class_data = class_service.create_class(name, user_id)
        return jsonify(class_data), 201
        
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@class_bp.route('/join', methods=['POST'])
@require_auth
def join_class():
    """Join an existing class by id."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        class_id = data.get('class_id', '').strip()
        if not class_id:
            return jsonify({'error': 'Class ID is required'}), 400
        
        user_id = request.current_user.id
        class_data = class_service.join_class_by_id(class_id, user_id)
        return jsonify(class_data), 200
        
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@class_bp.route('', methods=['GET'])
@require_auth
def list_classes():
    """List classes the user belongs to."""
    try:
        user_id = request.current_user.id
        classes = class_service.get_user_classes(user_id)
        return jsonify({'classes': classes}), 200
        
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@class_bp.route('/all', methods=['GET'])
@require_auth
def list_all_classes():
    """List all classes in catalog (public listing)."""
    try:
        classes = class_service.list_all_classes()
        return jsonify({'classes': classes}), 200
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@class_bp.route('/<class_id>', methods=['GET'])
@require_auth
def get_class(class_id):
    """Get class details, sessions, and decks summary."""
    try:
        user_id = request.current_user.id
        class_data = class_service.get_class(class_id, user_id)
        return jsonify(class_data), 200
        
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@class_bp.route('/<class_id>/leave', methods=['DELETE'])
@require_auth
def leave_class(class_id):
    """Leave a class (remove current user's membership). If no members remain, class is deleted."""
    try:
        user_id = request.current_user.id
        result = class_service.leave_class(class_id, user_id)
        return jsonify(result), 200
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500
