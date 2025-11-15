from app.core.supabase_client import supabase
from app.utils.errors import ValidationError, UnauthorizedError, NotFoundError

class AuthService:
    def __init__(self):
        self.supabase = supabase
    
    def signup(self, email: str, password: str, first_name: str, last_name: str):
        """Register a new user."""
        if not email or not password or not first_name or not last_name:
            raise ValidationError("Email, password, first name, and last name are required")
        
        try:
            # Sign up with Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "first_name": first_name,
                        "last_name": last_name
                    }
                }
            })
            
            if not auth_response.user:
                raise ValidationError("Failed to create user")
            
            user_id = auth_response.user.id
            access_token = auth_response.session.access_token if auth_response.session else None
            
            # The trigger should create the user profile, but let's ensure it exists
            # Check if user profile exists, if not create it
            try:
                profile = self.supabase.table('users').select('*').eq('id', user_id).execute()
                if not profile.data:
                    # Create user profile
                    self.supabase.table('users').insert({
                        'id': user_id,
                        'email': email,
                        'first_name': first_name,
                        'last_name': last_name
                    }).execute()
                else:
                    # Update names if they changed
                    self.supabase.table('users').update({
                        'first_name': first_name,
                        'last_name': last_name
                    }).eq('id', user_id).execute()
            except Exception as e:
                # If profile creation fails, user still exists in auth
                # Log the error for debugging
                print(f"Warning: Could not create/update user profile: {str(e)}")
            
            # Get the user profile
            user_profile = self.supabase.table('users').select('*').eq('id', user_id).single().execute()
            
            return {
                'user': {
                    'id': user_profile.data['id'],
                    'email': user_profile.data['email'],
                    'first_name': user_profile.data['first_name'],
                    'last_name': user_profile.data['last_name'],
                    'created_at': user_profile.data['created_at']
                },
                'access_token': access_token
            }
        except Exception as e:
            error_msg = str(e)
            if 'already registered' in error_msg.lower() or 'user already exists' in error_msg.lower():
                raise ValidationError("Email already exists", status_code=409)
            raise ValidationError(f"Signup failed: {error_msg}")
    
    def login(self, email: str, password: str):
        """Authenticate a user."""
        if not email or not password:
            raise ValidationError("Email and password are required")
        
        try:
            # Sign in with Supabase Auth
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                raise UnauthorizedError("Invalid credentials")
            
            user_id = auth_response.user.id
            access_token = auth_response.session.access_token
            
            # Get user profile
            user_profile = self.supabase.table('users').select('*').eq('id', user_id).single().execute()
            
            if not user_profile.data:
                raise NotFoundError("User profile not found")
            
            return {
                'user': {
                    'id': user_profile.data['id'],
                    'email': user_profile.data['email'],
                    'first_name': user_profile.data['first_name'],
                    'last_name': user_profile.data['last_name'],
                    'created_at': user_profile.data['created_at']
                },
                'access_token': access_token
            }
        except Exception as e:
            error_msg = str(e)
            if 'invalid' in error_msg.lower() or 'credentials' in error_msg.lower():
                raise UnauthorizedError("Invalid email or password")
            raise UnauthorizedError(f"Login failed: {error_msg}")
    
    def get_current_user(self, user_id: str):
        """Get current user details."""
        try:
            user_profile = self.supabase.table('users').select('*').eq('id', user_id).single().execute()
            
            if not user_profile.data:
                raise NotFoundError("User not found")
            
            return {
                'id': user_profile.data['id'],
                'email': user_profile.data['email'],
                'first_name': user_profile.data['first_name'],
                'last_name': user_profile.data['last_name'],
                'created_at': user_profile.data['created_at']
            }
        except Exception as e:
            raise NotFoundError(f"Failed to get user: {str(e)}")

