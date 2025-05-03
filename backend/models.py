from config import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    recent_searches = db.relationship(
        'RecentSearch', 
        backref='user', 
        lazy=True,
        cascade='all, delete-orphan'
    )

    def to_json(self):
        return {
            "id": self.id,
            "email": self.email
        }
    
class RecentSearch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)  # Add this new field
    search_query = db.Column(db.String(120), nullable=False)
    media_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    total_results = db.Column(db.Integer, nullable=False)
    filters = db.Column(db.JSON)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,  # Include name in the JSON output
            "media_type": self.media_type,
            "search_query": self.search_query,
            "timestamp": self.timestamp.isoformat(),
            "total_results": self.total_results,
            "filters": self.filters
        }