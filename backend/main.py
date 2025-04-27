from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from config import Config, db
from werkzeug.security import check_password_hash
from models import User, RecentSearch
from OpenverseAPIClient import OpenverseClient
import os
import datetime

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

db.init_app(app)

jwt = JWTManager(app)
jwt.init_app(app)

ov_client = OpenverseClient()

@app.route('/')
def index():
    return "Welcome to the Backend!"

@app.route('/api/test')
def test_api():
    return {"message": "Backend is working!"}


@app.route("/register", methods=["POST"])
def register():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 409

    new_user = User(email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "token_type": "Bearer"
        })
    return jsonify({"msg": "Invalid credentials"}), 401


@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    # Instruct client to delete the token
    return jsonify({"message": "Successfully logged out. Please delete the token on client side."}), 200


@app.route("/save_search", methods=["POST"])
@jwt_required()
def save_search():
    user_id = get_jwt_identity()
    data = request.get_json()

    name = data.get("name")
    query = data.get("query")
    media_type = data.get("media_type")

    if not name or not query or not media_type:
        return jsonify({"error": "Name, query, and media_type are required"}), 400
    
    existing_search = RecentSearch.query.filter_by(user_id=user_id, name=name).first()
    if existing_search:
        return jsonify({"error": "Name already exists. Please choose another name."}), 409

    # Create new saved search
    saved_search = RecentSearch(
        user_id=user_id,
        name=name,
        search_query=query,
        media_type=media_type,
        total_results=len(data.get('results', [])),
        filters=data.get('filters', {})
    )
    db.session.add(saved_search)
    db.session.commit()

    return jsonify({"message": "Search saved successfully", "search_id": saved_search.id}), 201

@app.route("/recent_searches", methods=["GET"])
@jwt_required()
def get_recent_searches():
    user_id = get_jwt_identity()
    
    # Calculate date 30 days ago
    thirty_days_ago = datetime.datetime.now() - datetime.timedelta(days=30)
    
    # Fetch recent searches for the user from last 30 days
    recent_searches = RecentSearch.query.filter(
        RecentSearch.user_id == user_id,
        RecentSearch.timestamp >= thirty_days_ago
    ).order_by(RecentSearch.timestamp.desc()).all()

    # Return a list of recent searches in JSON format
    return jsonify([{
        'id': s.id,
        'media_type': s.media_type,
        'search_query': s.search_query,
        'timestamp': s.timestamp.isoformat(),
        'total_results': s.total_results,
        'filters': s.filters
    } for s in recent_searches]), 200


@app.route("/recent_searches/<int:search_id>", methods=["DELETE"])
@jwt_required()
def delete_recent_search(search_id):
    user_id = get_jwt_identity()
    
    # Secure query: Only fetch searches belonging to the current user
    search = RecentSearch.query.filter_by(id=search_id, user_id=user_id).first()

    if not search:
        return jsonify({"error": "Search not found or unauthorized"}), 404

    try:
        db.session.delete(search)
        db.session.commit()
        return jsonify({"message": "Search deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500



@app.route("/search_images", methods=["GET"])
def search_images():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    
    try:
        results = ov_client.search_images(
            query=query,
            page=request.args.get('page', 1, type=int),
            page_size=request.args.get('page_size', 20, type=int),
            license_type=request.args.get("license"),
            source=request.args.get("source"),
            filetype=request.args.get("filetype")
        )
        return jsonify(results)
    except Exception as e:
        if "Rate limit exceeded" in str(e):
            return jsonify({
                "error": str(e),
                "code": "rate_limit_exceeded"
            }), 429
        print(f"Error calling Openverse API: {e}")
        return jsonify({"error": "Failed to fetch results"}), 500

@app.route("/search_audio", methods=["GET"])
def search_audio():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    
    try:
        results = ov_client.search_audio(
            query=query,
            page=request.args.get('page', 1, type=int),
            page_size=request.args.get('page_size', 20, type=int),
            license_type=request.args.get("license"),
            source=request.args.get("source"),
            filetype=request.args.get("filetype"),
            category=request.args.get("category")
        )
        return jsonify(results)
    except Exception as e:
        if "Rate limit exceeded" in str(e):
            return jsonify({
                "error": str(e),
                "code": "rate_limit_exceeded"
            }), 429
        print(f"Error calling Openverse API: {e}")
        return jsonify({"error": "Failed to fetch audio results"}), 500

@app.route("/rate_limit", methods=["GET"])
def get_rate_limit():
    try:
        limits = ov_client.check_rate_limit()
        return jsonify({
            "remaining": limits['remaining'],
            "limit": limits['limit'],
            "reset_in": max(0, limits['reset'] - datetime.datetime.now().timestamp())
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)