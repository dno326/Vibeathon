from app.core.supabase_client import supabase
from app.core.config import Config
from app.utils.errors import ValidationError, NotFoundError, UnauthorizedError
from supabase import create_client

class ClassService:
    def __init__(self):
        self.supabase = supabase
        if not Config.SUPABASE_SERVICE_KEY:
            raise ValueError("Service role key not configured. Please set SUPABASE_SERVICE_KEY in your .env file.")
        self.admin_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
        print(f"ClassService initialized with service role key (first 10 chars): {Config.SUPABASE_SERVICE_KEY[:10]}...")
    
    def create_class(self, name: str, creator_user_id: str):
        """Create a new class and add creator as a member."""
        if not name or not name.strip():
            raise ValidationError("Class name is required")
        if not creator_user_id:
            raise ValidationError("User ID is required")
        
        try:
            # Create class (no code, no owner)
            result = self.admin_client.table('classes').insert({
                'name': name.strip()
            }).execute()
            if not result.data:
                raise ValidationError("Failed to create class")
            class_data = result.data[0]
            class_id = class_data['id']
            
            # Add creator as member (role member)
            self.admin_client.table('class_members').insert({
                'user_id': creator_user_id,
                'class_id': class_id,
                'role': 'member'
            }).execute()
            
            return class_data
        except Exception as e:
            raise ValidationError(f"Failed to create class: {str(e)}")
    
    def list_all_classes(self):
        """List all classes (public catalog)."""
        try:
            res = self.admin_client.table('classes').select('*').order('name').execute()
            return res.data or []
        except Exception as e:
            raise ValidationError(f"Failed to list classes: {str(e)}")
    
    def join_class_by_id(self, class_id: str, user_id: str):
        """Join a class by class_id."""
        if not class_id:
            raise ValidationError("Class ID is required")
        if not user_id:
            raise ValidationError("User ID is required")
        try:
            # Verify class exists
            cls = self.admin_client.table('classes').select('*').eq('id', class_id).single().execute()
            if not cls.data:
                raise NotFoundError("Class not found")
            
            # Check if already member
            existing = self.admin_client.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
            if existing.data:
                return cls.data
            
            # Add member
            self.admin_client.table('class_members').insert({
                'user_id': user_id,
                'class_id': class_id,
                'role': 'member'
            }).execute()
            return cls.data
        except NotFoundError:
            raise
        except Exception as e:
            raise ValidationError(f"Failed to join class: {str(e)}")
    
    def get_user_classes(self, user_id: str):
        """Get all classes for a user via memberships."""
        if not user_id:
            raise ValidationError("User ID is required")
        try:
            memberships = self.admin_client.table('class_members').select('*, classes(*)').eq('user_id', user_id).execute()
            if not memberships.data:
                return []
            classes = []
            for membership in memberships.data:
                if membership.get('classes'):
                    class_data = membership['classes']
                    class_data['user_role'] = membership.get('role', 'member')
                    classes.append(class_data)
            return classes
        except Exception as e:
            raise ValidationError(f"Failed to get user classes: {str(e)}")
    
    def get_class(self, class_id: str, user_id: str):
        """Get class details with membership check."""
        if not class_id:
            raise ValidationError("Class ID is required")
        if not user_id:
            raise ValidationError("User ID is required")
        try:
            class_result = self.admin_client.table('classes').select('*').eq('id', class_id).execute()
            if not class_result.data:
                raise NotFoundError("Class not found")
            class_data = class_result.data[0]
            membership = self.admin_client.table('class_members').select('*').eq('class_id', class_id).eq('user_id', user_id).execute()
            if not membership.data:
                raise UnauthorizedError("You are not a member of this class")
            class_data['user_role'] = membership.data[0].get('role', 'member')
            return class_data
        except NotFoundError:
            raise
        except UnauthorizedError:
            raise
        except Exception as e:
            raise ValidationError(f"Failed to get class: {str(e)}")

    def leave_class(self, class_id: str, user_id: str):
        """Remove the user's membership from a class. If the class becomes empty, delete it."""
        if not class_id:
            raise ValidationError("Class ID is required")
        if not user_id:
            raise ValidationError("User ID is required")
        try:
            # Ensure membership exists
            membership = self.admin_client.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
            if not membership.data:
                raise NotFoundError("You are not a member of this class")
 
            # Remove membership
            self.admin_client.table('class_members').delete().eq('class_id', class_id).eq('user_id', user_id).execute()
            # Do not delete the class even if it becomes empty.
            return {'status': 'left'}
        except NotFoundError:
            raise
        except Exception as e:
            raise ValidationError(f"Failed to leave class: {str(e)}")
