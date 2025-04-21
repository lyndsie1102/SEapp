from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from config import Config, db
from werkzeug.security import check_password_hash
from models import User, RecentSearch, SavedSearchResult
from OpenverseAPIClient import OpenverseClient
import os

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


@app.route("/save_search", methods=["POST"])
@jwt_required()
def save_search():
    user_id = get_jwt_identity()
    data = request.get_json()

    query = data.get("query")
    media_type = data.get("media_type")
    results = data.get("results")

    if not query or not media_type or not results:
        return jsonify({"error": "Query, media_type, and results are required"}), 400

    total_results = len(results)

    # Check how many saved searches this user has
    saved_count = db.session.query(RecentSearch).filter_by(user_id=user_id).count()
    if saved_count >= 10:
        # Delete the oldest one
        oldest_search = db.session.query(RecentSearch).filter_by(user_id=user_id).order_by(RecentSearch.timestamp.asc()).first()
        db.session.delete(oldest_search)
        db.session.commit()

    # Create new saved search
    saved_search = RecentSearch(
        user_id=user_id,
        search_query=query,
        media_type=media_type,
        total_results=total_results
    )
    db.session.add(saved_search)
    db.session.flush()  # to get saved_search.id

    # Save results URLs
    for result in results:
        search_result = SavedSearchResult(
            search_id=saved_search.id,
            media_url=result['url'],  # Ensure this key matches your result structure
            media_type=result.get('media_type', media_type)  # Assuming you also have media_type in your result
        )
        db.session.add(search_result)

    db.session.commit()

    return jsonify({"message": "Search saved successfully", "search_id": saved_search.id}), 201



@app.route("/recent_searches", methods=["GET"])
@jwt_required()
def get_recent_searches():
    user_id = get_jwt_identity()

    # Fetch recent searches for the user
    recent_searches = RecentSearch.query.filter_by(user_id=user_id).order_by(RecentSearch.timestamp.desc()).all()

    # If no searches found, return an empty list
    if not recent_searches:
        return jsonify([]), 200

    # Return a list of recent searches in JSON format
    return jsonify([search.to_json() for search in recent_searches]), 200



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
    
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 20, type=int)
    license_type = request.args.get("license")
    source = request.args.get("source")
    filetype = request.args.get("filetype")
    
    try:
        results = ov_client.search_images(
            query=query,
            page=page,
            page_size=page_size,
            license_type=license_type,
            source=source,
            filetype=filetype
        )
    except Exception as e:
        print(f"Error calling Openverse API: {e}")
        return jsonify({"error": "Failed to fetch results from Openverse"}), 500

    return jsonify(results)

@app.route("/search_audio", methods=["GET"])
def search_audio():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400

    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 20, type=int)
    license_type = request.args.get("license")
    source = request.args.get("source")
    category = request.args.get("category")
    filetype = request.args.get("filetype")

    try:
        results = ov_client.search_audio(
            query=query,
            page=page,
            page_size=page_size,
            license_type=license_type,
            category=category,
            source=source,
            filetype=filetype
        )
    except Exception as e:
        print(f"Error calling Openverse API: {e}")
        return jsonify({"error": "Failed to fetch audio results"}), 500
    
    return jsonify(results)
    



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)