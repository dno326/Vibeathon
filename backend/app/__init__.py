from flask import Flask
from flask_cors import CORS
from app.core.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS with proper configuration
    CORS(app, 
         origins=Config.CORS_ORIGINS,
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'])
    
    # Register blueprints
    from app.api.auth_routes import auth_bp
    from app.api.class_routes import class_bp
    from app.api.session_routes import session_bp
    from app.api.note_routes import note_bp
    from app.api.flashcard_routes import flashcard_bp
    from app.api.card_routes import card_bp
    from app.api.comment_routes import comment_bp
    from app.api.vote_routes import vote_bp
    from app.api.study_routes import study_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(class_bp, url_prefix='/api/classes')
    app.register_blueprint(session_bp, url_prefix='/api/sessions')
    app.register_blueprint(note_bp, url_prefix='/api/notes')
    app.register_blueprint(flashcard_bp, url_prefix='/api/decks')
    app.register_blueprint(card_bp, url_prefix='/api/cards')
    app.register_blueprint(comment_bp, url_prefix='/api')
    app.register_blueprint(vote_bp, url_prefix='/api/upvotes')
    app.register_blueprint(study_bp, url_prefix='/api/study')
    
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'time': '2025-11-15T13:30:00Z'}, 200
    
    return app

