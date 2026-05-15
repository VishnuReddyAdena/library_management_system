from flask import Flask, jsonify
from config import Config
from extensions import db, migrate, jwt, ma, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    
    # Configure CORS exactly like Django corsheaders
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config['CORS_ALLOWED_ORIGINS']}},
        supports_credentials=True
    )

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.library import lib_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(lib_bp, url_prefix='/api')

    # Root / API Health check matching DRF api_root
    @app.route('/')
    def api_root():
        return jsonify({
            'message': 'LibraryOS Backend API is running ✅ (Flask Version)',
            'frontend': 'http://localhost:3005',
            'api': '/api/',
        })

    # Error handlers for JWT
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({"success": False, "message": "Missing Authorization Header", "code": "INVALID_CREDENTIALS"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({"success": False, "message": "Invalid Token", "code": "INVALID_CREDENTIALS"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token has expired", "code": "TOKEN_EXPIRED"}), 401

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=8000)
