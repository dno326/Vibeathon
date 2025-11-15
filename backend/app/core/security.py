from functools import wraps
from flask import request, jsonify
from app.core.supabase_client import supabase

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Missing authorization token'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Verify token with Supabase
            user = supabase.auth.get_user(token)
            if not user:
                return jsonify({'error': 'Invalid token'}), 401
            
            # Add user to request context
            request.current_user = user
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Authentication failed', 'message': str(e)}), 401
    
    return decorated_function

