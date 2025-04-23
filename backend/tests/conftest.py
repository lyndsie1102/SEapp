import pytest
from main import app, db
from models import User, RecentSearch
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token

# Core fixtures
@pytest.fixture(scope='module')
def app_ctx():
    """Application context"""
    with app.app_context():
        yield app

@pytest.fixture
def client(app_ctx):
    """Test client fixture"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret'  # Needed for JWT
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

# Database fixtures
@pytest.fixture(autouse=True)
def clean_db(client):
    """Auto-clean database between tests"""
    yield
    with app.app_context():
        db.session.rollback()
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()

# User fixtures
@pytest.fixture
def test_user():
    """Create a test user"""
    with app.app_context():
        user = User(email='test@example.com')
        user.set_password('testpassword')
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture
def auth_headers(test_user):
    """Generate auth headers for test user"""
    user_id = str(test_user.id)
    with app.app_context():
        token = create_access_token(identity=str(test_user.id))
        return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def auth_client(client, auth_headers):
    """Authenticated test client"""
    client.environ_base.update(auth_headers)
    return client

# Test data fixtures
@pytest.fixture
def test_search(test_user):
    """Create test search record"""
    with app.app_context():
        search = RecentSearch(
            user_id=test_user.id,
            search_query="test query",
            media_type="image",
            total_results=5
        )
        db.session.add(search)
        db.session.commit()
        return search