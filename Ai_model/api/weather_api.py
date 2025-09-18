"""
Weather API integration using RapidAPI's OpenWeather service.
"""

import http.client
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from config import RAPIDAPI_KEY

class WeatherAPI:
    def __init__(self):
        """Initialize the RapidAPI OpenWeather client."""
        self.headers = {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': "open-weather13.p.rapidapi.com"
        }
        self.conn = None

    def _get_connection(self):
        """Get or create HTTPS connection."""
        if not self.conn:
            self.conn = http.client.HTTPSConnection("open-weather13.p.rapidapi.com")
        return self.conn

    def get_current_weather(self, city: str = None, lang: str = "EN") -> Optional[Dict[str, Any]]:
        """
        Get current weather conditions from OpenWeather API via RapidAPI.
        Args:
            city: Name of the city
            lang: Language code (default: EN)
        Returns:
            Dictionary containing weather data or None if request fails
        """
        if not city:
            raise ValueError("City name must be provided for real weather data.")
        conn = self._get_connection()
        endpoint = f"/weather?city={city}&lang={lang}"
        try:
            conn.request("GET", endpoint, headers=self.headers)
            res = conn.getresponse()
            if res.status != 200:
                return None
            data = res.read()
            weather_json = json.loads(data)
            # Map OpenWeather API response to expected fields
            return {
                "temperature": weather_json.get("main", {}).get("temp"),
                "humidity": weather_json.get("main", {}).get("humidity"),
                "rainfall": weather_json.get("rain", {}).get("1h", 0.0),
                "weather_score": None,  # You can define your own logic for this
                "weather_condition": weather_json.get("weather", [{}])[0].get("main"),
                "wind_speed": weather_json.get("wind", {}).get("speed"),
                "soil_moisture": None  # Not available from OpenWeather
            }
        except Exception as e:
            print(f"Weather API error: {e}")
            return None

    def get_forecast(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Get weather forecast for a location.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            
        Returns:
            Dictionary containing forecast data or None if request fails
        """
        endpoint = f"{self.base_url}/forecast"
        params = {
            "lat": latitude,
            "lon": longitude,
            "days": FORECAST_DAYS,
            "api_key": self.api_key
        }
        
        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching forecast: {str(e)}")
            return None

    def get_historical_data(self, latitude: float, longitude: float, 
                          start_date: datetime, end_date: datetime) -> Optional[Dict[str, Any]]:
        """
        Get historical weather data for a location.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            start_date: Start date for historical data
            end_date: End date for historical data
            
        Returns:
            Dictionary containing historical weather data or None if request fails
        """
        endpoint = f"{self.base_url}/history"
        params = {
            "lat": latitude,
            "lon": longitude,
            "start": start_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d"),
            "api_key": self.api_key
        }
        
        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching historical data: {str(e)}")
            return None