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
    query = db.Column(db.String(120), nullable=False)
    media_type = db.Column(db.String(50), nullable=False)  # Add this line
    filters = db.Column(db.JSON, nullable=True)  # Add this line
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), index=True)

    # Update your unique constraint to include media_type
    __table_args__ = (
        db.UniqueConstraint('user_id', 'query', 'media_type', name='unique_user_query_media'),
    )

    def to_json(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "query": self.query,
            "media_type": self.media_type,  # Add this
            "filters": self.filters,  # Add this
            "timestamp": self.timestamp.isoformat()
        }