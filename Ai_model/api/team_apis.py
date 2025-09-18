"""
Integration with internal team APIs.
"""

import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
from config import RAPIDAPI_COMMODITY_SOIL_KEY, SOIL_API_BASE_URL, CROP_RECOMMEND_API_BASE_URL

class TeamAPI:
    def __init__(self, api_type: str = 'soil'):
        """
        Initialize Team API client for soil or crop recommendation.
        Args:
            api_type: 'soil' or 'crop_recommend' (determines which endpoint to use)
        """
        if api_type == 'soil':
            self.api_url = SOIL_API_BASE_URL
        elif api_type == 'crop_recommend':
            self.api_url = CROP_RECOMMEND_API_BASE_URL
        else:
            raise ValueError("Invalid api_type. Use 'soil' or 'crop_recommend'.")
        self.api_key = RAPIDAPI_COMMODITY_SOIL_KEY

    def _make_request(self, endpoint: str, method: str = 'GET', 
                     params: Dict = None, data: Dict = None) -> Optional[Dict]:
        """
        Make an HTTP request to the team API.
        
        Args:
            endpoint: API endpoint
            method: HTTP method (GET, POST, etc.)
            params: Query parameters
            data: Request body data
            
        Returns:
            Response data or None if request fails
        """
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'X-RapidAPI-Key': self.api_key,  # For RapidAPI endpoints
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.request(
                method=method,
                url=f"{self.api_url}{endpoint}",
                headers=headers,
                params=params,
                json=data
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {str(e)}")
            return None

    def get_soil_data(self, location_id: str) -> Optional[Dict[str, Any]]:
        """
        Get soil analysis data for a location.
        
        Args:
            location_id: ID of the location
            
        Returns:
            Dictionary containing soil data or None if request fails
        """
        return self._make_request(f"/soil/{location_id}")

    def get_irrigation_data(self, field_id: str) -> Optional[Dict[str, Any]]:
        """
        Get irrigation system data for a field.
        
        Args:
            field_id: ID of the field
            
        Returns:
            Dictionary containing irrigation data or None if request fails
        """
        return self._make_request(f"/irrigation/{field_id}")

    def submit_crop_data(self, crop_data: Dict[str, Any]) -> bool:
        """
        Submit crop data to the team's database.
        
        Args:
            crop_data: Dictionary containing crop information
            
        Returns:
            True if successful, False otherwise
        """
        response = self._make_request(
            endpoint="/crops",
            method="POST",
            data=crop_data
        )
        return response is not None

    def get_equipment_schedule(self, date: datetime) -> Optional[Dict[str, Any]]:
        """
        Get equipment availability schedule.
        
        Args:
            date: Date to check equipment schedule
            
        Returns:
            Dictionary containing equipment schedule or None if request fails
        """
        params = {'date': date.strftime("%Y-%m-%d")}
        return self._make_request("/equipment/schedule", params=params)

    def report_issue(self, issue_data: Dict[str, Any]) -> bool:
        """
        Report an issue to the team.
        
        Args:
            issue_data: Dictionary containing issue information
            
        Returns:
            True if successfully reported, False otherwise
        """
        response = self._make_request(
            endpoint="/issues",
            method="POST",
            data=issue_data
        )
        return response is not None