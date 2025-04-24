import requests
import time
from typing import Dict, Any, Optional, List
import os
from dotenv import load_dotenv

load_dotenv("dev.env")

class OpenverseClient:
    
    BASE_URL = "https://api.openverse.org/v1"
    
    def __init__(self):
        self.access_token = None
        self.token_expiry = 0
        self.client_id = os.getenv("OPENVERSE_CLIENT_ID")
        self.client_secret = os.getenv("OPENVERSE_CLIENT_SECRET")
        self.rate_limit = {
            'remaining': 60,  # Default values
            'limit': 60,
            'reset': time.time() + 3600,
            'last_checked': 0
        }
    
    def _get_auth_token(self) -> str:
        current_time = time.time()
        
        if self.access_token and current_time < self.token_expiry:
            return self.access_token

        auth_url = f"{self.BASE_URL}/auth_tokens/token/"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        }
        try:
            response = requests.post(auth_url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            self.token_expiry = current_time + expires_in
            
            return self.access_token

        except requests.exceptions.RequestException as e:
            print(f"Error getting auth token: {e} {response.text}")
            return None
        
    def check_rate_limit(self) -> Dict[str, Any]:
        """Check current rate limit status"""
        try:
            response = requests.get(
                f"{self.BASE_URL}/rate_limit/",
                headers={"Authorization": f"Bearer {self._get_auth_token()}"}
            )
            response.raise_for_status()
            self.rate_limit = {
                'remaining': response.json().get('rate_limit_remaining', 60),
                'limit': response.json().get('rate_limit_total', 60),
                'reset': response.json().get('rate_limit_reset', time.time() + 3600),
                'last_checked': time.time()
            }
            return self.rate_limit
        except Exception as e:
            print(f"Error checking rate limit: {e}")
            return self.rate_limit
        
    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Centralized request handler with rate limit checking"""
        # Check rate limit if it's been more than 1 minute since last check
        if time.time() - self.rate_limit['last_checked'] > 60:
            self.check_rate_limit()

        if self.rate_limit['remaining'] <= 0:
            reset_in = max(0, self.rate_limit['reset'] - time.time())
            raise Exception(
                f"Rate limit exceeded. Try again in {reset_in:.0f} seconds"
            )

        token = self._get_auth_token()
        if not token:
            raise Exception("Failed to authenticate with Openverse API")

        response = requests.get(
            f"{self.BASE_URL}/{endpoint}/",
            headers={"Authorization": f"Bearer {token}"},
            params=params
        )
        
        # Update rate limit from response headers if available
        if 'X-RateLimit-Remaining' in response.headers:
            self.rate_limit = {
                'remaining': int(response.headers['X-RateLimit-Remaining']),
                'limit': int(response.headers['X-RateLimit-Limit']),
                'reset': int(response.headers['X-RateLimit-Reset']),
                'last_checked': time.time()
            }
        
        response.raise_for_status()
        return response.json()
    

    def search_images(
        self,
        query: str,
        page: int = 1,
        page_size: int = 20,
        license_type: Optional[str] = None,
        source: Optional[str] = None,
        filetype: Optional[str] = None
    ) -> Dict[str, Any]:
    
        params = {
            "q": query,
            "page": page,
            "page_size": page_size,
        }

        if license_type:
            params["license"] = license_type
        if source:
            params["source"] = source
        if filetype:
            params["filetype"] = filetype

        return self._make_request("images", params)


    def search_audio(
        self,
        query: str,
        page: int = 1,
        page_size: int = 20,
        license_type: Optional[str] = None,
        source: Optional[str] = None,
        filetype: Optional[str] = None,
        category: Optional[List[str]] = None
    ) -> Dict[str, Any]:
    
    
        params = {
            "q": query,
            "page": page,
            "page_size": page_size,
        }

        if license_type:
            params["license"] = license_type
        if source:
            params["source"] = source
        if filetype:
            params["filetype"] = filetype
        if category:
            params["category"] = category

        
        return self._make_request("audio", params)