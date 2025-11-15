from flask import Blueprint, request, jsonify
from app.core.security import require_auth

study_bp = Blueprint('study', __name__)

@study_bp.route('/events', methods=['POST'])
@require_auth
def record_study_event():
    """Record a study event (card reviewed)."""
    data = request.get_json()
    # TODO: Implement record study event
    return jsonify({'status': 'ok'}), 201

