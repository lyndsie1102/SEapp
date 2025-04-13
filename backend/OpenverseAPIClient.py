import requests
import time
from typing import Dict, Any, Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

class OpenverseClient:
    
    BASE_URL = "https://api.openverse.org/v1"
    
    def __init__(self):
        self.access_token = None
        self.token_expiry = 0
        self.client_id = os.getenv("OPENVERSE_CLIENT_ID")
        self.client_secret = os.getenv("OPENVERSE_CLIENT_SECRET")
    
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

    def search_images(
        self,
        query: str,
        page: int = 1,
        page_size: int = 20,
        license_type: Optional[str] = None,
        source: Optional[str] = None,
        filetype: Optional[str] = None
    ) -> Dict[str, Any]:
        
        token = self._get_auth_token()
        if not token:
            return {"error": "Failed to authenticate with Openverse API"}

        search_url = f"{self.BASE_URL}/images/"
        headers = {
            "Authorization": f"Bearer {token}"
        }

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

        try:
            response = requests.get(search_url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"error": f"Error searching images: {str(e)}"}

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
    
        token = self._get_auth_token()
        if not token:
            return {"error": "Failed to authenticate with Openverse API"}

        search_url = f"{self.BASE_URL}/audio/"
        headers = {
            "Authorization": f"Bearer {token}"
        }

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

        try:
            response = requests.get(search_url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"error": f"Error searching audio: {str(e)}"}
