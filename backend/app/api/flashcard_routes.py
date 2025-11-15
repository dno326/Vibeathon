from flask import Blueprint, request, jsonify
from app.core.security import require_auth
from app.services.flashcard_service import FlashcardService

flashcard_bp = Blueprint('flashcards', __name__)
flashcard_service = FlashcardService()

@flashcard_bp.route('', methods=['POST'])
@require_auth
def create_deck():
    """Create a new deck."""
    data = request.get_json()
    # TODO: Implement create deck
    return jsonify({'message': 'Create deck endpoint'}), 201

@flashcard_bp.route('/<deck_id>/generate', methods=['POST'])
@require_auth
def generate_flashcards(deck_id):
    """Generate flashcards from a note using AI."""
    data = request.get_json()
    # TODO: Implement generate flashcards
    return jsonify({'message': 'Generate flashcards endpoint'}), 201

@flashcard_bp.route('/<deck_id>', methods=['GET'])
@require_auth
def get_deck(deck_id):
    """Fetch a deck and its cards."""
    # TODO: Implement get deck
    return jsonify({'message': 'Get deck endpoint'}), 200

@flashcard_bp.route('/<deck_id>/cards', methods=['POST'])
@require_auth
def create_card(deck_id):
    """Create a card manually."""
    data = request.get_json()
    # TODO: Implement create card
    return jsonify({'message': 'Create card endpoint'}), 201

@flashcard_bp.route('/study/<deck_id>/start', methods=['POST'])
@require_auth
def start_study(deck_id):
    """Start or resume a study session."""
    data = request.get_json()
    # TODO: Implement start study
    return jsonify({'message': 'Start study endpoint'}), 200

