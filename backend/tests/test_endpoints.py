import pytest
from main import app, db
from models import User, RecentSearch, SavedSearchResult
from werkzeug.security import generate_password_hash
import json

def test_register(client, test_user):
    # Test successful registration
    data = {'email': 'new@example.com', 'password': 'newpassword'}
    response = client.post('/register', json=data)
    assert response.status_code == 201
    assert response.json == {"message": "User registered successfully"}

    # Test missing fields
    response = client.post('/register', json={'email': 'new2@example.com'})
    assert response.status_code == 400
    assert "Email and password are required" in response.json['message']

    # Test duplicate email
    response = client.post('/register', 
        json={'email': 'test@example.com', 'password': 'password'})
    assert response.status_code == 409
    assert "User already exists" in response.json['message']

def test_login(client, test_user):
    # Test successful login
    data = {'email': 'test@example.com', 'password': 'testpassword'}
    response = client.post('/login', json=data)
    assert response.status_code == 200
    assert 'access_token' in response.json

    # Test invalid credentials
    data = {'email': 'test@example.com', 'password': 'wrongpassword'}
    response = client.post('/login', json=data)
    assert response.status_code == 401
    assert response.json == {"msg": "Invalid credentials"}

def test_save_search(auth_client, test_user):
    # Test successful save
    data = {
        "query": "test query",
        "media_type": "image",
        "results": [{"url": "http://example.com/image1.jpg", "media_type": "image"}]
    }
    response = auth_client.post('/save_search', json=data)
    assert response.status_code == 201
    assert "Search saved successfully" in response.json['message']

    # Test missing fields
    response = auth_client.post('/save_search', json={})
    assert response.status_code == 400
    assert "Query, media_type, and results are required" in response.json['error']

def test_get_recent_searches(auth_client, test_user):
    # Create fresh test searches
    search1 = RecentSearch(
        user_id=test_user.id,
        search_query="query1",
        media_type="image",
        total_results=10
    )
    search2 = RecentSearch(
        user_id=test_user.id,
        search_query="query2",
        media_type="audio",
        total_results=5
    )
    db.session.add_all([search1, search2])
    db.session.commit()

    response = auth_client.get('/recent_searches')
    assert response.status_code == 200
    assert len(response.json) == 2
    assert {s['search_query'] for s in response.json} == {'query1', 'query2'}

def test_delete_recent_search(auth_client, test_user):
    # Create a test search
    search = RecentSearch(
        user_id=test_user.id,
        search_query="test query",
        media_type="image",
        total_results=5
    )
    db.session.add(search)
    db.session.commit()

    response = auth_client.delete(f'/recent_searches/{search.id}')
    assert response.status_code == 200
    assert "Search deleted successfully" in response.json['message']

    # Test deleting non-existent search
    response = auth_client.delete('/recent_searches/999')
    assert response.status_code == 404
    assert "Search not found or unauthorized" in response.json['error']

def test_search_images(client, mocker):
    # Mock the OpenverseClient
    mock_results = {"results": [{"id": 1, "title": "Test Image"}]}
    mocker.patch('main.ov_client.search_images', return_value=mock_results)

    response = client.get('/search_images?q=test')
    assert response.status_code == 200
    assert response.json == mock_results

    # Test missing query
    response = client.get('/search_images')
    assert response.status_code == 400
    assert "Search query is required" in response.json['error']

def test_search_audio(client, mocker):
    # Mock the OpenverseClient
    mock_results = {"results": [{"id": 1, "title": "Test Audio"}]}
    mocker.patch('main.ov_client.search_audio', return_value=mock_results)

    response = client.get('/search_audio?q=test')
    assert response.status_code == 200
    assert response.json == mock_results

    # Test missing query
    response = client.get('/search_audio')
    assert response.status_code == 400
    assert "Search query is required" in response.json['error']