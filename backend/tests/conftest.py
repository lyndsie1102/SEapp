import pytest
from main import app, db
from models import User
from werkzeug.security import generate_password_hash

pytest_plugins = ['pytest_mock']

@pytest.fixture(scope='module')
def client():
    # Configure test app
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Create all tables
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

@pytest.fixture
def auth_client(client):
    # Create test user
    with app.app_context():
        # Create test user if not exists
        user = User.query.filter_by(email='test@example.com').first()
        if not user:
            user = User(email='test@example.com')
            user.set_password('testpassword')
            db.session.add(user)
            db.session.commit()
        
        # Generate token
        from flask_jwt_extended import create_access_token
        token = create_access_token(identity=str(user.id))
        
        # Set auth header
        client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {token}'
    
    yield client
    
    # Cleanup
    with app.app_context():
        client.environ_base.pop('HTTP_AUTHORIZATION', None)