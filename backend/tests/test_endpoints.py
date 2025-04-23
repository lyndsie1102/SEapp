import pytest
from models import User, RecentSearch, SavedSearchResult
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta
from main import app, db

def test_register(client):
    # Successful registration
    data = {'email': 'new@example.com', 'password': 'newpassword'}
    response = client.post('/register', json=data)
    assert response.status_code == 201
    assert response.json == {"message": "User registered successfully"}

    # Missing fields
    response = client.post('/register', json={'email': 'new2@example.com'})
    assert response.status_code == 400
    assert "Email and password are required" in response.json['message']

    # Duplicate email
    response = client.post('/register', json={'email': 'test@example.com', 'password': 'password'})
    assert response.status_code == 409
    assert "User already exists" in response.json['message']

def test_login(client, create_test_user):
    create_test_user()

    # Valid login
    data = {'email': 'test@example.com', 'password': 'testpassword'}
    response = client.post('/login', json=data)
    assert response.status_code == 200
    assert 'access_token' in response.json

    # Invalid login
    data = {'email': 'test@example.com', 'password': 'wrongpassword'}
    response = client.post('/login', json=data)
    assert response.status_code == 401
    assert response.json == {"msg": "Invalid credentials"}

def test_save_search(client, auth_headers):
    # Valid save
    data = {
        "query": "test query",
        "media_type": "image",
        "results": [{"url": "http://example.com/image1.jpg", "media_type": "image"}]
    }
    response = client.post('/save_search', json=data, headers=auth_headers)
    assert response.status_code == 201
    assert "Search saved successfully" in response.json['message']

    # Missing fields
    response = client.post('/save_search', json={}, headers=auth_headers)
    assert response.status_code == 400
    assert "Query, media_type, and results are required" in response.json['error']

def test_get_recent_searches(client, auth_headers, create_test_user):
    user = create_test_user()

    # Add test searches
    with client.application.app_context():
        search1 = RecentSearch(
            user_id=user.id,
            search_query="query1",
            media_type="image",
            total_results=10,
            timestamp=datetime.utcnow() - timedelta(seconds=5)
        )
        search2 = RecentSearch(
            user_id=user.id,
            search_query="query2",
            media_type="audio",
            total_results=5,
            timestamp=datetime.utcnow()
        )
        db.session.add_all([search1, search2])
        db.session.commit()

    response = client.get('/recent_searches', headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json) == 2
    assert response.json[0]['search_query'] == "query2"

def test_delete_recent_search(client, auth_headers, create_test_user):
    user = create_test_user()
    with client.application.app_context():
        search = RecentSearch(
            user_id=user.id,
            search_query="delete me",
            media_type="image",
            total_results=3
        )
        db.session.add(search)
        db.session.commit()
        search_id = search.id

    response = client.delete(f'/recent_searches/{search_id}', headers=auth_headers)
    assert response.status_code == 200
    assert "Search deleted successfully" in response.json['message']

    # Try deleting again
    response = client.delete(f'/recent_searches/{search_id}', headers=auth_headers)
    assert response.status_code == 404
    assert "Search not found or unauthorized" in response.json['error']

def test_search_images(client, mocker):
    mock_results = {"results": [{"id": 1, "title": "Test Image"}]}
    mocker.patch('main.ov_client.search_images', return_value=mock_results)

    response = client.get('/search_images?q=test')
    assert response.status_code == 200
    assert response.json == mock_results

    # Missing query
    response = client.get('/search_images')
    assert response.status_code == 400
    assert "Search query is required" in response.json['error']

def test_search_audio(client, mocker):
    mock_results = {"results": [{"id": 1, "title": "Test Audio"}]}
    mocker.patch('main.ov_client.search_audio', return_value=mock_results)

    response = client.get('/search_audio?q=test')
    assert response.status_code == 200
    assert response.json == mock_results

    # Missing query
    response = client.get('/search_audio')
    assert response.status_code == 400
    assert "Search query is required" in response.json['error']
