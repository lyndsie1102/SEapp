from config import db
from main import app
from models import User

with app.app_context():
    users = User.query.all()

# Convert to JSON (optional)
    users_json = [user.to_json() for user in users]

# Print or return
    print(users_json)