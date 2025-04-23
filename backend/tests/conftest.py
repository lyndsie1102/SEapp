import pytest
from main import app as flask_app, db
from models import User, RecentSearch, SavedSearchResult

@pytest.fixture
def app():
    # Create a test app instance with test configuration
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    return flask_app

@pytest.fixture
def client(app):
    # Create a test client for the app
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # Create a test user
            test_user = User(email='test@example.com')
            test_user.set_password('testpassword')
            db.session.add(test_user)
            db.session.commit()
        yield client
        with app.app_context():
            db.drop_all()