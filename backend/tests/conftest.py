import pytest
from main import app, db
from models import User
from flask_jwt_extended import create_access_token

# Add pytest-mock for mocking support
pytest_plugins = ['pytest_mock']

@pytest.fixture(scope='module')
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

@pytest.fixture
def client(test_client):
    return test_client

@pytest.fixture
def create_test_user():
    def _create(email="test@example.com", password="testpassword"):
        with app.app_context():
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(email=email)
                user.set_password(password)
                db.session.add(user)
                db.session.commit()
            return user
    return _create

@pytest.fixture
def auth_headers(test_client, create_test_user):
    user = create_test_user()
    with app.app_context():
        token = create_access_token(identity=str(user.id))
        return {'Authorization': f'Bearer {token}'}
