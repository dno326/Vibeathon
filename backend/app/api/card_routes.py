from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.flashcard_service import FlashcardService

card_bp = Blueprint('cards', __name__)
flashcard_service = FlashcardService()

@card_bp.route('/<card_id>', methods=['PATCH'])
@require_auth
def update_card(card_id):
    """Update a flashcard."""
    data = request.get_json()
    # TODO: Implement update card
    return jsonify({'message': 'Update card endpoint'}), 200

@card_bp.route('/<card_id>', methods=['DELETE'])
@require_auth
def delete_card(card_id):
    """Delete a flashcard."""
    # TODO: Implement delete card
    return jsonify({'message': 'Delete card endpoint'}), 204

