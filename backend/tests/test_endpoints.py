import pytest
from main import app, db
from models import User
from werkzeug.security import generate_password_hash
import json
from flask_jwt_extended import create_access_token



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