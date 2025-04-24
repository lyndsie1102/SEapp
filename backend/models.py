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
    
    def to_json(self):
        return {
            "id": self.id,
            "email": self.email
        }
    
class RecentSearch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    search_query = db.Column(db.String(120), nullable=False)
    media_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    total_results = db.Column(db.Integer, nullable=False)
    filters = db.Column(db.JSON)

    search_results = db.relationship('SavedSearchResult', backref='recent_search', cascade="all, delete-orphan", lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "search_query": self.search_query,
            "media_type": self.media_type,
            "timestamp": self.timestamp.isoformat(),
            "total_results": self.total_results
        }

class SavedSearchResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    search_id = db.Column(db.Integer, db.ForeignKey('recent_search.id'), nullable=False)
    media_url = db.Column(db.String(255), nullable=False)
    media_type = db.Column(db.String(50), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "media_url": self.media_url,
            "media_type": self.media_type
        }
