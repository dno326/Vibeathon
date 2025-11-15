from app.core.supabase_client import supabase
from app.core.config import Config
from app.utils.errors import ValidationError, UnauthorizedError, NotFoundError
from supabase import create_client
import time

class AuthService:
    def __init__(self):
        self.supabase = supabase
    
    def signup(self, email: str, password: str, first_name: str, last_name: str):
        """Register a new user and create their profile immediately."""
        if not email or not password or not first_name or not last_name:
            raise ValidationError("Email, password, first name, and last name are required")
        
        # Create admin client (service role key bypasses RLS)
        if not Config.SUPABASE_SERVICE_KEY:
            raise ValidationError("Service role key not configured. Please set SUPABASE_SERVICE_KEY in your .env file.")
        
        admin_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
        print(f"Using service role key (first 10 chars): {Config.SUPABASE_SERVICE_KEY[:10]}...")
        
        try:
            # Step 1: Create user in Supabase Auth
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
                raise ValidationError("Failed to create user account")
            
            user_id = auth_response.user.id
            
            # Step 2: Auto-confirm email (for development)
            # Retry a few times since user might not be immediately available in admin API
            email_confirmed = False
            for attempt in range(3):
                try:
                    admin_client.auth.admin.update_user_by_id(
                        user_id,
                        {"email_confirm": True}
                    )
                    email_confirmed = True
                    break
                except Exception as e:
                    if attempt < 2:
                        # Wait a bit and retry
                        time.sleep(0.3)
                    else:
                        # Last attempt failed - log but don't fail signup
                        print(f"Warning: Could not auto-confirm email (user can still confirm via email link): {str(e)}")
            
            # Step 3: Create profile in public.users table immediately
            # Use admin client to bypass RLS
            # Wait a tiny bit to ensure user is committed in auth.users (for foreign key constraint)
            time.sleep(0.2)
            
            try:
                admin_client.table('users').insert({
                    'id': user_id,
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name
                }).execute()
                print(f"Successfully created profile for user {user_id}")
            except Exception as e:
                error_msg = str(e)
                print(f"Error creating profile: {error_msg}")
                
                # If profile already exists (trigger created it), that's fine - fetch it
                if '23505' in error_msg or 'unique constraint' in error_msg.lower() or 'duplicate key' in error_msg.lower():
                    print("Profile already exists (likely created by trigger)")
                    pass  # Profile exists, will fetch below
                # If foreign key error, user might not be ready yet - wait and retry once
                elif '23503' in error_msg or 'foreign key' in error_msg.lower():
                    print("Foreign key error - waiting and retrying...")
                    time.sleep(0.5)
                    try:
                        admin_client.table('users').insert({
                            'id': user_id,
                            'email': email,
                            'first_name': first_name,
                            'last_name': last_name
                        }).execute()
                        print(f"Successfully created profile on retry for user {user_id}")
                    except Exception as retry_error:
                        error_msg_retry = str(retry_error)
                        print(f"Retry also failed: {error_msg_retry}")
                        raise ValidationError(f"Failed to create user profile: {error_msg_retry}")
                else:
                    # Real error - raise it with full details
                    print(f"Raising validation error: {error_msg}")
                    raise ValidationError(f"Failed to create user profile: {error_msg}")
            
            # Step 4: Fetch the created profile
            profile_result = admin_client.table('users').select('*').eq('id', user_id).execute()
            
            if not profile_result.data or len(profile_result.data) == 0:
                raise ValidationError("User profile was not created")
            
            profile = profile_result.data[0]
            
            # Step 5: Get access token
            access_token = None
            if auth_response.session:
                access_token = auth_response.session.access_token
            else:
                # Try to sign in to get token
                try:
                    session_response = self.supabase.auth.sign_in_with_password({
                        "email": email,
                        "password": password
                    })
                    if session_response.session:
                        access_token = session_response.session.access_token
                except Exception as e:
                    print(f"Warning: Could not get access token: {str(e)}")
            
            return {
                'user': {
                    'id': profile['id'],
                    'email': profile['email'],
                    'first_name': profile.get('first_name', ''),
                    'last_name': profile.get('last_name', ''),
                    'grade': profile.get('grade'),
                    'major': profile.get('major'),
                    'created_at': profile.get('created_at')
                },
                'access_token': access_token
            }
            
        except ValidationError:
            raise
        except Exception as e:
            error_msg = str(e)
            if 'already registered' in error_msg.lower() or 'user already exists' in error_msg.lower() or 'already been registered' in error_msg.lower():
                raise ValidationError("An account with this email already exists", status_code=409)
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
            
            # Get user profile - create if it doesn't exist
            admin_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
            
            try:
                user_profile = admin_client.table('users').select('*').eq('id', user_id).execute()
                
                if not user_profile.data or len(user_profile.data) == 0:
                    # Profile doesn't exist - create it
                    admin_user = admin_client.auth.admin.get_user_by_id(user_id)
                    if admin_user and admin_user.user:
                        user_metadata = admin_user.user.user_metadata or {}
                        admin_client.table('users').insert({
                            'id': user_id,
                            'email': admin_user.user.email,
                            'first_name': user_metadata.get('first_name', ''),
                            'last_name': user_metadata.get('last_name', '')
                        }).execute()
                        user_profile = admin_client.table('users').select('*').eq('id', user_id).execute()
                    else:
                        raise NotFoundError("User profile not found")
                
                user_profile_data = user_profile.data[0]
            except Exception as e:
                error_msg = str(e)
                if 'not found' in error_msg.lower() or 'PGRST116' in error_msg:
                    raise NotFoundError("User profile not found")
                raise UnauthorizedError(f"Login failed: {str(e)}")
            
            return {
                'user': {
                    'id': user_profile_data['id'],
                    'email': user_profile_data['email'],
                    'first_name': user_profile_data.get('first_name', ''),
                    'last_name': user_profile_data.get('last_name', ''),
                    'grade': user_profile_data.get('grade'),
                    'major': user_profile_data.get('major'),
                    'created_at': user_profile_data.get('created_at')
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
                'first_name': user_profile.data.get('first_name', ''),
                'last_name': user_profile.data.get('last_name', ''),
                'grade': user_profile.data.get('grade'),
                'major': user_profile.data.get('major'),
                'created_at': user_profile.data.get('created_at')
            }
        except Exception as e:
            raise NotFoundError(f"Failed to get user: {str(e)}")
    
    def update_user_profile(self, user_id: str, data: dict):
        """Update user profile information."""
        try:
            # Only allow updating specific fields
            allowed_fields = ['first_name', 'last_name', 'email', 'grade', 'major']
            update_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
            
            if not update_data:
                raise ValidationError("No valid fields to update")
            
            # Validate required fields if they're being updated
            if 'email' in update_data and not update_data['email'].strip():
                raise ValidationError("Email cannot be empty")
            if 'first_name' in update_data and not update_data['first_name'].strip():
                raise ValidationError("First name cannot be empty")
            if 'last_name' in update_data and not update_data['last_name'].strip():
                raise ValidationError("Last name cannot be empty")
            
            # Update user profile
            from app.core.config import Config
            from supabase import create_client
            
            admin_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
            result = admin_client.table('users').update(update_data).eq('id', user_id).execute()
            
            if not result.data or len(result.data) == 0:
                raise NotFoundError("User not found")
            
            updated_user = result.data[0]
            return {
                'id': updated_user['id'],
                'email': updated_user['email'],
                'first_name': updated_user.get('first_name', ''),
                'last_name': updated_user.get('last_name', ''),
                'grade': updated_user.get('grade'),
                'major': updated_user.get('major'),
                'created_at': updated_user.get('created_at')
            }
        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError(f"Failed to update profile: {str(e)}")
