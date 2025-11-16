from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.study_group_service import StudyGroupService
from app.utils.errors import ValidationError, UnauthorizedError

study_bp = Blueprint('study', __name__)
sg_service = StudyGroupService()

@study_bp.route('/groups/status', methods=['POST'])
@require_auth
def set_study_group_status():
    """Set current user's 'looking for study group' status for a class."""
    try:
        body = request.get_json() or {}
        class_id = (body.get('class_id') or '').strip()
        looking = bool(body.get('looking', True))
        if not class_id:
            return jsonify({'error': 'class_id is required'}), 400
        user_id = request.current_user.id
        res = sg_service.set_status(user_id, class_id, looking)
        return jsonify(res), 200
    except UnauthorizedError as e:
        return jsonify({'error': e.message}), 403
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/groups', methods=['GET'])
@require_auth
def list_study_groups():
    """List students looking for study groups within the current user's classes."""
    try:
        user_id = request.current_user.id
        res = sg_service.list_for_user_classes(user_id)
        return jsonify({'groups': res}), 200
    except ValidationError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/groups/status', methods=['GET'])
@require_auth
def get_status():
    """Get current user's status for a specific class: ?class_id=..."""
    try:
        class_id = (request.args.get('class_id') or '').strip()
        if not class_id:
            return jsonify({'error': 'class_id is required'}), 400
        user_id = request.current_user.id
        # Ensure membership
        # Using service admin client directly
        mem = sg_service.admin.table('class_members').select('user_id').eq('class_id', class_id).eq('user_id', user_id).execute()
        if not mem.data:
            return jsonify({'error': 'Not a member of this class'}), 403
        row = sg_service.admin.table('study_groups').select('looking').eq('user_id', user_id).eq('class_id', class_id).execute()
        looking = bool(row.data and row.data[0].get('looking'))
        return jsonify({'looking': looking}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

