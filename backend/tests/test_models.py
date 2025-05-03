import pytest
from datetime import datetime
from models import User, RecentSearch
from werkzeug.security import check_password_hash
from config import db

def test_user_model_basic_operations(init_database):
    # Test retrieving the user created by init_database fixture
    user = User.query.filter_by(email='test@example.com').first()
    assert user is not None
    assert user.check_password('testpassword') is True
    assert user.check_password('wrongpassword') is False

    # Test JSON serialization
    user_json = user.to_json()
    assert user_json["email"] == "test@example.com"
    assert "password_hash" not in user_json

def test_recent_search_model_operations(init_database):
    user = User.query.filter_by(email='test@example.com').first()
    
    # Create and test a new search
    search = RecentSearch(
        user_id=user.id,
        name="test search",
        search_query="nature photos",
        media_type="image",
        total_results=15,
        filters={"license": "cc0", "source": "flickr"}
    )
    db.session.add(search)
    db.session.commit()

    # Test attributes
    assert search.name == "test search"
    assert search.search_query == "nature photos"
    assert isinstance(search.timestamp, datetime)
    
    # Test JSON serialization
    search_json = search.to_json()
    assert search_json["name"] == "test search"
    assert "timestamp" in search_json

def test_user_email_uniqueness(init_database):
    # Attempt to create duplicate user
    duplicate_user = User(email='test@example.com')  # Same as fixture user
    duplicate_user.set_password('anotherpassword')
    db.session.add(duplicate_user)
    
    with pytest.raises(Exception) as exc_info:
        db.session.commit()
    
    assert "UNIQUE constraint failed" in str(exc_info.value)
    db.session.rollback()

def test_recent_search_required_fields(init_database):
    user = User.query.first()
    
    # Test missing required fields
    with pytest.raises(Exception):
        search = RecentSearch(
            user_id=user.id,
            # Missing name
            search_query="test",
            media_type="image",
            total_results=0
        )
        db.session.add(search)
        db.session.commit()
    db.session.rollback()

def test_model_relationships(init_database):
    user = User.query.filter_by(email='test@example.com').first()
    
    # Create a search for the user
    search = RecentSearch(
        user_id=user.id,
        name="relationship test",
        search_query="test query",
        media_type="image",
        total_results=10
    )
    db.session.add(search)
    db.session.commit()
    
    # Test relationship
    assert search in user.recent_searches
    assert search.user == user