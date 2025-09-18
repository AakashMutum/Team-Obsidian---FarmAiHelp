"""
Unit tests for API integrations.
"""

import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime
from api.weather_api import WeatherAPI
from api.market_api import MarketAPI
from api.team_apis import TeamAPI

class TestWeatherAPI(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test."""
        self.weather_api = WeatherAPI()
        self.test_lat = 40.7128
        self.test_lon = -74.0060

    @patch('requests.get')
    def test_get_current_weather(self, mock_get):
        """Test getting current weather data."""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'temperature': 25.0,
            'humidity': 60,
            'rainfall': 0
        }
        mock_get.return_value = mock_response

        # Test API call
        result = self.weather_api.get_current_weather(self.test_lat, self.test_lon)
        
        self.assertIsNotNone(result)
        self.assertEqual(result['temperature'], 25.0)
        mock_get.assert_called_once()

    @patch('requests.get')
    def test_get_forecast(self, mock_get):
        """Test getting weather forecast."""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'daily': [
                {'temp': 25, 'humidity': 60},
                {'temp': 26, 'humidity': 65}
            ]
        }
        mock_get.return_value = mock_response

        # Test API call
        result = self.weather_api.get_forecast(self.test_lat, self.test_lon)
        
        self.assertIsNotNone(result)
        self.assertIn('daily', result)
        mock_get.assert_called_once()

    @patch('requests.get')
    def test_request_failure(self, mock_get):
        """Test handling of request failures."""
        # Mock failed response
        mock_get.side_effect = Exception('API Error')

        # Test API call
        result = self.weather_api.get_current_weather(self.test_lat, self.test_lon)
        
        self.assertIsNone(result)
        mock_get.assert_called_once()

class TestMarketAPI(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test."""
        self.market_api = MarketAPI()
        self.test_crops = ['wheat', 'rice']

    @patch('requests.get')
    def test_get_current_prices(self, mock_get):
        """Test getting current market prices."""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'wheat': 300.0,
            'rice': 400.0
        }
        mock_get.return_value = mock_response

        # Test API call
        result = self.market_api.get_current_prices(self.test_crops)
        
        self.assertIsNotNone(result)
        self.assertEqual(result['wheat'], 300.0)
        self.assertEqual(result['rice'], 400.0)
        mock_get.assert_called_once()

    @patch('requests.get')
    def test_get_price_history(self, mock_get):
        """Test getting price history."""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'prices': [
                {'date': '2023-01-01', 'price': 300.0},
                {'date': '2023-01-02', 'price': 305.0}
            ]
        }
        mock_get.return_value = mock_response

        # Test API call
        result = self.market_api.get_price_history(
            'wheat',
            datetime(2023, 1, 1),
            datetime(2023, 1, 2)
        )
        
        self.assertIsNotNone(result)
        self.assertIn('prices', result)
        self.assertEqual(len(result['prices']), 2)
        mock_get.assert_called_once()

class TestTeamAPI(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test."""
        self.team_api = TeamAPI('http://api.example.com', 'test_key')

    @patch('requests.request')
    def test_get_soil_data(self, mock_request):
        """Test getting soil data."""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'ph': 6.5,
            'nitrogen': 50,
            'phosphorus': 30
        }
        mock_request.return_value = mock_response

        # Test API call
        result = self.team_api.get_soil_data('location123')
        
        self.assertIsNotNone(result)
        self.assertEqual(result['ph'], 6.5)
        mock_request.assert_called_once()

    @patch('requests.request')
    def test_submit_crop_data(self, mock_request):
        """Test submitting crop data."""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {'success': True}
        mock_request.return_value = mock_response

        # Test data
        crop_data = {
            'name': 'wheat',
            'planting_date': '2023-01-01'
        }

        # Test API call
        result = self.team_api.submit_crop_data(crop_data)
        
        self.assertTrue(result)
        mock_request.assert_called_once()

    @patch('requests.request')
    def test_api_error_handling(self, mock_request):
        """Test handling of API errors."""
        # Mock failed response
        mock_request.side_effect = Exception('API Error')

        # Test API call
        result = self.team_api.get_soil_data('location123')
        
        self.assertIsNone(result)
        mock_request.assert_called_once()

if __name__ == '__main__':
    unittest.main()