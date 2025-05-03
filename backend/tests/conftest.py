import pytest
from main import app, db
from models import User, RecentSearch

@pytest.fixture(scope='session')
def app_ctx():
    """Application context for the entire test session"""
    with app.app_context():
        yield

@pytest.fixture(scope='module')
def test_client(app_ctx):
    # Configure test app
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Create fresh tables
    db.drop_all()
    db.create_all()
    
    yield app.test_client()
    
    # Cleanup
    db.session.remove()
    db.drop_all()

@pytest.fixture
def init_database(test_client):
    # Start fresh
    db.session.rollback()
    
    # Clear all data respecting relationships
    for table in reversed(db.metadata.sorted_tables):
        db.session.execute(table.delete())
    db.session.commit()

    # Create test user
    user = User(email='test@example.com')
    user.set_password('testpassword')
    db.session.add(user)
    db.session.commit()
    
    # Refresh the user object
    user = db.session.merge(user)
    
    yield user
    
    # Cleanup respecting cascades
    db.session.rollback()
    User.query.delete()  # Will cascade to RecentSearch
    db.session.commit()
    db.session.remove()