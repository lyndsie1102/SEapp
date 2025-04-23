import pytest
from main import app, db
from models import User
from flask_jwt_extended import create_access_token



@pytest.fixture(scope='module')
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 🔥 Add secret keys for JWT
    app.config['SECRET_KEY'] = 'test-secret'
    app.config['JWT_SECRET_KEY'] = 'jwt-test-secret'

    with app.app_context():
        db.create_all()

    yield app.test_client()

    with app.app_context():
        db.drop_all()


@pytest.fixture
def client(test_client):
    return test_client

@pytest.fixture
def create_test_user():
    def _create():
        with app.app_context():
            user = User.query.filter_by(email='test@example.com').first()
            if not user:
                user = User(email='test@example.com')
                user.set_password('testpassword')
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
