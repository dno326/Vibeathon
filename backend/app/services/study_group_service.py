from app.core.config import Config
from app.core.supabase_client import supabase
from supabase import create_client
from app.utils.errors import ValidationError, UnauthorizedError

class StudyGroupService:
    def __init__(self):
        self.supabase = supabase
        self.admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)

    def set_status(self, user_id: str, class_id: str, looking: bool):
        if not user_id or not class_id:
            raise ValidationError('user_id and class_id are required')
        # Ensure membership
        mem = self.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
        if not mem.data:
            raise UnauthorizedError('Not a member of this class')
        # Upsert status into study_groups (create if missing)
        # We assume a unique constraint on (user_id, class_id); if not, this still inserts a duplicate-free-ish latest row.
        existing = self.admin.table('study_groups').select('id').eq('user_id', user_id).eq('class_id', class_id).execute()
        payload = {'user_id': user_id, 'class_id': class_id, 'looking': bool(looking)}
        if existing.data:
            self.admin.table('study_groups').update(payload).eq('user_id', user_id).eq('class_id', class_id).execute()
        else:
            self.admin.table('study_groups').insert(payload).execute()
        return {'status': 'ok', 'looking': bool(looking)}

    def list_for_user_classes(self, user_id: str):
        if not user_id:
            raise ValidationError('user_id is required')
        # Get user's classes
        mems = self.admin.table('class_members').select('class_id').eq('user_id', user_id).execute()
        class_ids = [m['class_id'] for m in (mems.data or [])]
        if not class_ids:
            return []
        # Fetch classmates with looking=true in those classes, excluding current user
        sres = self.admin.table('study_groups').select('user_id, class_id, looking').in_('class_id', class_ids).eq('looking', True).neq('user_id', user_id).execute()
        rows = sres.data or []
        if not rows:
            return []
        # Map users
        user_ids = list({r['user_id'] for r in rows})
        ures = self.admin.table('users').select('id, first_name, last_name').in_('id', user_ids).execute()
        users_map = {u['id']: {'id': u['id'], 'first_name': u.get('first_name',''), 'last_name': u.get('last_name','')} for u in (ures.data or [])}
        # Classes map
        cres = self.admin.table('classes').select('id, name').in_('id', class_ids).execute()
        classes_map = {c['id']: {'id': c['id'], 'name': c.get('name','')} for c in (cres.data or [])}
        # Group by class
        grouped = {}
        for r in rows:
            cid = r['class_id']
            grouped.setdefault(cid, {'class': classes_map.get(cid, {'id': cid, 'name': ''}), 'students': []})
            u = users_map.get(r['user_id'])
            if u:
                grouped[cid]['students'].append(u)
        # Sort students by name
        for g in grouped.values():
            g['students'].sort(key=lambda x: (x.get('first_name',''), x.get('last_name','')))
        # Return as list
        return list(grouped.values())


