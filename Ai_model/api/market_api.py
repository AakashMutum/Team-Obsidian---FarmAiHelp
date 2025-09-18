"""
Market API integration for fetching agricultural market data from data.gov.in
"""

import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from dateutil.parser import parse
from config import RAPIDAPI_COMMODITY_SOIL_KEY

class MarketAPI:
    def __init__(self):
        """Initialize the Agricultural Market API client."""
        # Use the commodity/market API key for crop/commodity data
        self.api_key = RAPIDAPI_COMMODITY_SOIL_KEY
        self.base_url = "https://commodity-api-service-url-from-rapidapi.com"  # Replace with actual base URL from RapidAPI docs

    def get_market_data(self, state: str, district: str, commodity: str, 
                       start_date: Optional[datetime] = None,
                       end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Get market data for a specific commodity in a location.
        
        Args:
            state: State name
            district: District name
            commodity: Commodity name
            start_date: Start date for filtering (optional)
            end_date: End date for filtering (optional)
            
        Returns:
            Dictionary containing market data records
        """
        # Use sample data for development/testing
        try:
            # Read from our CSV file instead of calling the API
            import pandas as pd
            import os
            
            csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'crop_market_history.csv')
            df = pd.read_csv(csv_path)
            
            # Filter by crop (commodity)
            df = df[df['crop'].str.lower() == commodity.lower()]
            
            if start_date and end_date:
                df['date'] = pd.to_datetime(df['date'])
                df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
            
            records = df.to_dict('records')
            
            return {
                "total": len(records),
                "records": records
            }
            
        except Exception as e:
            print(f"Error reading market data: {str(e)}")
            return {"total": 0, "records": []}
        
        try:
            with open("data/sample_data.json", "r") as f:
                data = json.load(f)
            
            # Filter records based on criteria
            records = data.get("records", [])
            filtered_records = []
            
            for record in records:
                if all(record.get(key) == value for key, value in filters.items() 
                      if key != "Arrival_Date"):
                    if "Arrival_Date" in filters:
                        record_date = parse(record["Arrival_Date"].replace("/", "-"))
                        if start_date <= record_date <= end_date:
                            filtered_records.append(record)
                    else:
                        filtered_records.append(record)
            
            return {
                "total": len(filtered_records),
                "records": filtered_records
            }
            
        except Exception as e:
            print(f"Error fetching market data: {str(e)}")
            return {"total": 0, "records": []}

    def get_price_history(self, crop_name: str, 
                         start_date: datetime, 
                         end_date: datetime) -> Optional[Dict[str, Any]]:
        """
        Get historical price data for a crop.
        
        Args:
            crop_name: Name of the crop
            start_date: Start date for historical data
            end_date: End date for historical data
            
        Returns:
            Dictionary containing historical price data or None if request fails
        """
        endpoint = f"{self.base_url}/prices/history"
        params = {
            "crop": crop_name,
            "start": start_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d"),
        }
        headers = {
            "X-RapidAPI-Key": self.api_key
        }
        
        try:
            response = requests.get(endpoint, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching price history: {str(e)}")
            return None

    def get_market_trends(self, crop_name: str) -> Optional[Dict[str, Any]]:
        """
        Get market trends and analysis for a crop.
        
        Args:
            crop_name: Name of the crop
            
        Returns:
            Dictionary containing market trend data or None if request fails
        """
        endpoint = f"{self.base_url}/trends"
        params = {
            "crop": crop_name
        }
        headers = {
            "X-RapidAPI-Key": self.api_key
        }
        
        try:
            response = requests.get(endpoint, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching market trends: {str(e)}")
            return None

    def get_demand_forecast(self, crop_name: str) -> Optional[Dict[str, Any]]:
        """
        Get demand forecast for a crop.
        
        Args:
            crop_name: Name of the crop
            
        Returns:
            Dictionary containing demand forecast data or None if request fails
        """
        endpoint = f"{self.base_url}/demand/forecast"
        params = {
            "crop": crop_name
        }
        headers = {
            "X-RapidAPI-Key": self.api_key
        }
        
        try:
            response = requests.get(endpoint, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching demand forecast: {str(e)}")
            return None