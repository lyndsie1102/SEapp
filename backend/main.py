from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from config import Config, db
from models import Contact, User, RecentSearch
from OpenverseAPIClient import OpenverseClient
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)

jwt = JWTManager(app)
jwt.init_app(app)

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
    email = request.json.get("email")
    password = request.json.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token, "user": user.to_json()}), 200

@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({"user": user.to_json()})

@app.route("/recent_search", methods=["POST"])
@jwt_required()
def save_recent_search():
    user_id = get_jwt_identity()
    query = request.json.get("query")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    # Check for existing (user_id, query) combo
    existing = RecentSearch.query.filter_by(user_id=user_id, query=query).first()
    if existing:
        return jsonify({"message": "Search already exists"}), 200
        
    new_search = RecentSearch(user_id=user_id, query=query)
    db.session.add(new_search)
    db.session.commit()

    return jsonify({"message": "Search saved"}), 201

@app.route("/recent_searches", methods=["GET"])
@jwt_required()
def get_recent_searches():
    user_id = get_jwt_identity()
    searches = RecentSearch.query.filter_by(user_id=user_id)\
                                 .order_by(RecentSearch.timestamp.desc())\
                                 .limit(5).all()
    return jsonify([search.to_json() for search in searches]), 200

@app.route("/recent_search/<int:search_id>", methods=["DELETE"])
@jwt_required()
def delete_recent_search(search_id):
    user_id = get_jwt_identity()
    search = RecentSearch.query.get(search_id)

    if not search or search.user_id != user_id:
        return jsonify({"error": "Search not found or unauthorized"}), 404

    db.session.delete(search)
    db.session.commit()
    return jsonify({"message": "Search deleted"}), 200


@app.route("/contacts", methods=["GET"])
def get_contacts():
    contacts = Contact.query.all()
    json_contacts = list(map(lambda x: x.to_json(), contacts))
    return jsonify({"contacts": json_contacts})


@app.route("/create_contact", methods=["POST"])
def create_contact():
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")

    if not first_name or not last_name or not email:
        return (
            jsonify({"message": "You must include the first name, last name and email"}),
            400,
        )

    new_contact = Contact(first_name=first_name, last_name=last_name, email=email)
    try:
        db.session.add(new_contact)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User created!"}), 201


@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    contact = Contact.query.get(user_id)
    if not contact:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    contact.first_name = data.get("firstName", contact.first_name)
    contact.last_name = data.get("lastName", contact.last_name)
    contact.email = data.get("email", contact.email)

    db.session.commit()

    return jsonify({"message": "User updated"}), 200


@app.route("/delete_contact/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200

ov_client = OpenverseClient()

@app.route("/search_images", methods=["GET"])
def search_images():
    """
    Endpoint to search for images using the OpenVerse API
    Query parameters:
    - q: Search query (required)
    - page: Page number (default: 1)
    - page_size: Results per page (default: 20)
    - license: Filter by license type
    - creator: Filter by creator
    - tags: Comma-separated list of tags
    """
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 20, type=int)
    license_type = request.args.get("license")
    creator = request.args.get("creator")
    
    # Handle tags as a comma-separated list
    tags = request.args.get("tags")
    if tags:
        tags = tags.split(",")
    
    results = ov_client.search_images(
        query=query,
        page=page,
        page_size=page_size,
        license_type=license_type,
        creator=creator,
        tags=tags
    )
    
    return jsonify(results)



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)