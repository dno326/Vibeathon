from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user."""
    data = request.get_json()
    # TODO: Implement signup
    return jsonify({'message': 'Signup endpoint'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate an existing user."""
    data = request.get_json()
    # TODO: Implement login
    return jsonify({'message': 'Login endpoint'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Return the currently authenticated user."""
    # TODO: Implement get current user
    return jsonify({'message': 'Get current user endpoint'}), 200

