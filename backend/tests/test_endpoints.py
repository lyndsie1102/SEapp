import pytest
from main import app, ov_client
from models import User, RecentSearch
from werkzeug.security import generate_password_hash
import json
from flask_jwt_extended import create_access_token
from datetime import timedelta, datetime
from config import Config, db



def test_register(test_client, init_database):
    # Test successful registration
    data = {'email': 'new@example.com', 'password': 'newpassword'}
    response = test_client.post('/register', json=data)
    assert response.status_code == 201
    assert response.json == {"message": "User registered successfully"}

    # Test missing fields
    response = test_client.post('/register', json={'email': 'new2@example.com'})
    assert response.status_code == 400
    assert "Email and password are required" in response.json['message']

    # Test duplicate email (should fail)
    response = test_client.post('/register', 
        json={'email': 'test@example.com', 'password': 'password'})
    assert response.status_code == 409
    assert "User already exists" in response.json['message']

def test_login(test_client, init_database):
    # Test successful login
    data = {'email': 'test@example.com', 'password': 'testpassword'}
    response = test_client.post('/login', json=data)
    assert response.status_code == 200
    assert 'access_token' in response.json

    # Test invalid credentials
    data = {'email': 'test@example.com', 'password': 'wrongpassword'}
    response = test_client.post('/login', json=data)
    assert response.status_code == 401
    assert response.json == {"msg": "Invalid credentials"}


def test_save_search(test_client, init_database):
    # Create a test user and get a token
    user = User.query.filter_by(email='test@example.com').first()
    token = create_access_token(identity=str(user.id))

    # Test successful save
    data = {
        "query": "test query",
        "media_type": "image",
        "results": [{"url": "http://example.com/image1.jpg", "media_type": "image"}]
    }
    headers = {'Authorization': f'Bearer {token}'}
    response = test_client.post('/save_search', json=data, headers=headers)
    assert response.status_code == 201
    assert "Search saved successfully" in response.json['message']

    # Test missing fields
    response = test_client.post('/save_search', json={}, headers=headers)
    assert response.status_code == 400
    assert "Query, media_type, and results are required" in response.json['error']

def test_get_recent_searches(test_client, init_database):
    # Create a test user and get a token
    user = User.query.filter_by(email='test@example.com').first()
    token = create_access_token(identity=str(user.id))

    # Create some test searches
    search1 = RecentSearch(
        user_id=user.id,
        search_query="query1",
        media_type="image",
        total_results=10,
        timestamp=datetime.now() - timedelta(minutes=1)
    )
    search2 = RecentSearch(
        user_id=user.id,
        search_query="query2",
        media_type="audio",
        total_results=5,
        timestamp=datetime.now()
    )
    db.session.add_all([search1, search2])
    db.session.commit()

    headers = {'Authorization': f'Bearer {token}'}
    response = test_client.get('/recent_searches', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 2
    assert response.json[0]['search_query'] == "query2"  # Should be ordered by timestamp desc

def test_delete_recent_search(test_client, init_database):
    # Create a test user and get a token
    user = User.query.filter_by(email='test@example.com').first()
    token = create_access_token(identity=str(user.id))

    # Create a test search
    search = RecentSearch(
        user_id=user.id,
        search_query="test query",
        media_type="image",
        total_results=5
    )
    db.session.add(search)
    db.session.commit()

    headers = {'Authorization': f'Bearer {token}'}
    response = test_client.delete(f'/recent_searches/{search.id}', headers=headers)
    assert response.status_code == 200
    assert "Search deleted successfully" in response.json['message']

    # Test deleting non-existent search
    response = test_client.delete('/recent_searches/999', headers=headers)
    assert response.status_code == 404
    assert "Search not found or unauthorized" in response.json['error']

def test_search_images(test_client, mocker):
    # Mock the OpenverseClient
    mock_results = {"results": [{"id": 1, "title": "Test Image"}]}
    mocker.patch('main.ov_client.search_images', return_value=mock_results)

    response = test_client.get('/search_images?q=test')
    assert response.status_code == 200
    assert response.json == mock_results

    # Test missing query
    response = test_client.get('/search_images')
    assert response.status_code == 400
    assert "Search query is required" in response.json['error']

def test_search_audio(test_client, mocker):
    # Mock the OpenverseClient
    mock_results = {"results": [{"id": 1, "title": "Test Audio"}]}
    mocker.patch('main.ov_client.search_audio', return_value=mock_results)

    response = test_client.get('/search_audio?q=test')
    assert response.status_code == 200
    assert response.json == mock_results

    # Test missing query
    response = test_client.get('/search_audio')
    assert response.status_code == 400
    assert "Search query is required" in response.json['error']
