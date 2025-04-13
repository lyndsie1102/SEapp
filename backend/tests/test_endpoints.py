import json
import pytest



def test_search_images(client, monkeypatch):
    """Test the search_images endpoint with a mocked OpenverseClient."""
    # Mock the OpenverseClient.search_images method
    from OpenverseAPIClient import OpenverseClient
    
    mock_results = {
        "results": [
            {"title": "Test Image", "url": "http://example.com/image.jpg"}
        ]
    }
    
    def mock_search_images(*args, **kwargs):
        return mock_results
    
    # Apply the monkeypatch
    monkeypatch.setattr(OpenverseClient, "search_images", mock_search_images)
    
    # Test the endpoint
    response = client.get('/search_images?q=test')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data == mock_results
