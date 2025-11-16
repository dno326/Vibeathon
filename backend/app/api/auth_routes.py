from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.core.security import require_auth
from app.utils.errors import ValidationError, UnauthorizedError, NotFoundError

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        
        if not email or not password or not first_name or not last_name:
            return jsonify({'error': 'Email, password, first name, and last name are required'}), 400
        
        result = auth_service.signup(email, password, first_name, last_name)
        return jsonify(result), 201
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate an existing user."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = auth_service.login(email, password)
        return jsonify(result), 200
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), e.status_code
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """Return the currently authenticated user."""
    try:
        user_id = request.current_user.id
        user = auth_service.get_current_user(user_id)
        return jsonify(user), 200
    except NotFoundError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PATCH'])
@require_auth
def update_profile():
    """Update user profile."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        user_id = request.current_user.id
        updated_user = auth_service.update_user_profile(user_id, data)
        return jsonify(updated_user), 200
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile/picture', methods=['POST'])
@require_auth
def upload_profile_picture():
    """Upload profile picture."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            return jsonify({'error': 'File must be an image'}), 400
        
        user_id = request.current_user.id
        picture_url = auth_service.upload_profile_picture(user_id, file)
        return jsonify({'profile_picture_url': picture_url}), 200
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/user/<user_id>', methods=['GET'])
@require_auth
def get_user_public(user_id):
    try:
      user = auth_service.get_current_user(user_id)
      return jsonify(user), 200
    except NotFoundError as e:
      return jsonify({'error': e.message}), e.status_code
    except Exception as e:
      return jsonify({'error': str(e)}), 500

