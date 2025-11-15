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
            
            # Verify token with Supabase using admin API
            # The service role key allows us to verify any token
            try:
                # Use admin API to get user from token
                user_response = supabase.auth.get_user(token)
                
                if not user_response or not user_response.user:
                    return jsonify({'error': 'Invalid token'}), 401
                
                # Add user to request context
                request.current_user = user_response.user
                return f(*args, **kwargs)
            except Exception as auth_error:
                # If get_user fails, try alternative method
                # Create a client with the token to verify
                from supabase import create_client
                from app.core.config import Config
                
                temp_client = create_client(Config.SUPABASE_URL, token)
                try:
                    user = temp_client.auth.get_user()
                    if user and user.user:
                        request.current_user = user.user
                        return f(*args, **kwargs)
                except:
                    pass
                
                return jsonify({'error': 'Invalid token', 'message': str(auth_error)}), 401
        except Exception as e:
            return jsonify({'error': 'Authentication failed', 'message': str(e)}), 401
    
    return decorated_function

