import pytest
from main import app, db
from models import User, RecentSearch
from werkzeug.security import generate_password_hash
import json
from flask_jwt_extended import create_access_token
from dotenv import load_dotenv

@pytest.fixture(scope='session')
def app_ctx():
    with app.app_context():
        yield

@pytest.fixture(scope='module')
def test_client(app_ctx):
    # Configure test app
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    # Create all tables
    with app.app_context():
        db.create_all()
    
    # Create test client
    testing_client = app.test_client()
    
    # Establish application context
    ctx = app.app_context()
    ctx.push()
    
    yield testing_client
    
    # Cleanup
    with app.app_context():
        db.session.remove()
        db.drop_all()
    ctx.pop()

@pytest.fixture
def init_database(test_client):
    # Create test user
    user = User(email='test@example.com', _password_hash=generate_password_hash('testpassword'))
    user.set_password('testpassword')
    db.session.add(user)
    db.session.commit()
    
    yield user
    
    # Clean up after each test
    with app.app_context():
        User.query.delete()
        RecentSearch.query.delete()
        db.session.commit()