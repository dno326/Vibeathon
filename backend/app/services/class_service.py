from app.core.supabase_client import supabase
from app.core.config import Config
from app.utils.errors import ValidationError, NotFoundError, UnauthorizedError
from supabase import create_client
import secrets
import string

class ClassService:
    def __init__(self):
        self.supabase = supabase
        if not Config.SUPABASE_SERVICE_KEY:
            raise ValueError("Service role key not configured. Please set SUPABASE_SERVICE_KEY in your .env file.")
        self.admin_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
        print(f"ClassService initialized with service role key (first 10 chars): {Config.SUPABASE_SERVICE_KEY[:10]}...")
    
    def _generate_class_code(self) -> str:
        """Generate a unique 6-character class code."""
        alphabet = string.ascii_uppercase + string.digits
        # Exclude confusing characters: 0, O, I, 1
        alphabet = alphabet.replace('0', '').replace('O', '').replace('I', '').replace('1', '')
        
        max_attempts = 10
        for _ in range(max_attempts):
            code = ''.join(secrets.choice(alphabet) for _ in range(6))
            # Check if code already exists
            existing = self.admin_client.table('classes').select('id').eq('code', code).execute()
            if not existing.data or len(existing.data) == 0:
                return code
        
        # Fallback: use a longer code if we can't find a unique 6-char one
        return ''.join(secrets.choice(alphabet) for _ in range(8))
    
    def create_class(self, name: str, owner_id: str):
        """Create a new class."""
        if not name or not name.strip():
            raise ValidationError("Class name is required")
        
        if not owner_id:
            raise ValidationError("Owner ID is required")
        
        # Generate unique class code
        code = self._generate_class_code()
        
        try:
            # Create class
            print(f"Creating class '{name}' for owner {owner_id} with code {code}")
            class_result = self.admin_client.table('classes').insert({
                'name': name.strip(),
                'code': code,
                'owner_id': owner_id
            }).execute()
            
            print(f"Class insert result: {class_result}")
            
            if not class_result.data or len(class_result.data) == 0:
                raise ValidationError("Failed to create class - no data returned")
            
            class_data = class_result.data[0]
            class_id = class_data['id']
            
            print(f"Class created with ID: {class_id}, adding owner as member...")
            
            # Add owner as class member with 'owner' role
            member_result = self.admin_client.table('class_members').insert({
                'user_id': owner_id,
                'class_id': class_id,
                'role': 'owner'
            }).execute()
            
            print(f"Member insert result: {member_result}")
            
            return class_data
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error creating class: {error_msg}")
            print(f"Error type: {type(e)}")
            # Check for RLS recursion error
            if 'recursion' in error_msg.lower() or '42P17' in error_msg:
                raise ValidationError("Database policy error detected. Please run the fix_class_members_rls_recursion.sql script in Supabase SQL Editor.")
            if 'unique constraint' in error_msg.lower() or 'duplicate key' in error_msg.lower():
                # Code collision - try again with a new code
                code = self._generate_class_code()
                try:
                    class_result = self.admin_client.table('classes').insert({
                        'name': name.strip(),
                        'code': code,
                        'owner_id': owner_id
                    }).execute()
                    if class_result.data and len(class_result.data) > 0:
                        class_data = class_result.data[0]
                        class_id = class_data['id']
                        self.admin_client.table('class_members').insert({
                            'user_id': owner_id,
                            'class_id': class_id,
                            'role': 'owner'
                        }).execute()
                        return class_data
                except Exception:
                    pass
            
            raise ValidationError(f"Failed to create class: {error_msg}")
    
    def join_class(self, code: str, user_id: str):
        """Join a class by code."""
        if not code or not code.strip():
            raise ValidationError("Class code is required")
        
        if not user_id:
            raise ValidationError("User ID is required")
        
        code = code.strip().upper()
        
        try:
            # Find class by code
            class_result = self.admin_client.table('classes').select('*').eq('code', code).execute()
            
            if not class_result.data or len(class_result.data) == 0:
                raise NotFoundError("Class not found with that code")
            
            class_data = class_result.data[0]
            class_id = class_data['id']
            
            # Check if user is already a member
            member_check = self.admin_client.table('class_members').select('*').eq('class_id', class_id).eq('user_id', user_id).execute()
            
            if member_check.data and len(member_check.data) > 0:
                # User is already a member
                return class_data
            
            # Add user as member
            self.admin_client.table('class_members').insert({
                'user_id': user_id,
                'class_id': class_id,
                'role': 'member'
            }).execute()
            
            return class_data
            
        except NotFoundError:
            raise
        except Exception as e:
            error_msg = str(e)
            if 'not found' in error_msg.lower():
                raise NotFoundError("Class not found with that code")
            raise ValidationError(f"Failed to join class: {error_msg}")
    
    def get_user_classes(self, user_id: str):
        """Get all classes for a user."""
        if not user_id:
            raise ValidationError("User ID is required")
        
        try:
            # Get all class memberships for the user
            # Using admin_client should bypass RLS, but if there are policy issues, they'll surface here
            memberships = self.admin_client.table('class_members').select('*, classes(*)').eq('user_id', user_id).execute()
            
            if not memberships.data:
                return []
            
            # Extract classes from memberships
            classes = []
            for membership in memberships.data:
                if membership.get('classes'):
                    class_data = membership['classes']
                    # Add role from membership
                    class_data['user_role'] = membership.get('role', 'member')
                    classes.append(class_data)
            
            return classes
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error getting user classes: {error_msg}")
            print(f"Error type: {type(e)}")
            # If it's a recursion error, provide a helpful message
            if 'recursion' in error_msg.lower() or '42P17' in error_msg:
                raise ValidationError("Database policy error detected. Please run the fix_class_members_rls_recursion.sql script in Supabase SQL Editor.")
            raise ValidationError(f"Failed to get user classes: {error_msg}")
    
    def get_class(self, class_id: str, user_id: str):
        """Get class details with membership check."""
        if not class_id:
            raise ValidationError("Class ID is required")
        
        if not user_id:
            raise ValidationError("User ID is required")
        
        try:
            # Get class
            class_result = self.admin_client.table('classes').select('*').eq('id', class_id).execute()
            
            if not class_result.data or len(class_result.data) == 0:
                raise NotFoundError("Class not found")
            
            class_data = class_result.data[0]
            
            # Check if user is a member
            membership = self.admin_client.table('class_members').select('*').eq('class_id', class_id).eq('user_id', user_id).execute()
            
            if not membership.data or len(membership.data) == 0:
                raise UnauthorizedError("You are not a member of this class")
            
            # Add user's role
            class_data['user_role'] = membership.data[0].get('role', 'member')
            
            return class_data
            
        except NotFoundError:
            raise
        except UnauthorizedError:
            raise
        except Exception as e:
            raise ValidationError(f"Failed to get class: {str(e)}")
