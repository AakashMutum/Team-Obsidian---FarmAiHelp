"""
Data processing utilities for crop prediction and profit forecasting.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
import statsmodels.api as sm

class DataProcessor:
    def __init__(self):
        """Initialize data processor with scalers."""
        self.price_scaler = MinMaxScaler()
        self.feature_scalers = {}
    
    def clean_weather_data(self, weather_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Clean and process weather data from API.
        
        Args:
            weather_data: Raw weather data from API
            
        Returns:
            Processed weather data as DataFrame
        """
        # Convert to DataFrame
        df = pd.DataFrame(weather_data)
        
        # Handle missing values
        df = df.fillna({
            'temperature': df['temperature'].mean(),
            'humidity': df['humidity'].mean(),
            'rainfall': 0,
            'wind_speed': df['wind_speed'].mean() if 'wind_speed' in df else 0,
            'soil_moisture': df['soil_moisture'].mean() if 'soil_moisture' in df else 0
        })
        
        # Remove outliers
        for column in ['temperature', 'humidity', 'rainfall', 'wind_speed', 'soil_moisture']:
            if column in df.columns:
                mean = df[column].mean()
                std = df[column].std()
                df = df[np.abs(df[column] - mean) <= 3 * std]
        
        # Add derived features
        if 'temperature' in df and 'humidity' in df:
            df['heat_index'] = self._calculate_heat_index(df['temperature'], df['humidity'])
        
        return df

    def process_soil_data(self, soil_data: Dict[str, Any], farm_size: float = 1.0) -> Dict[str, float]:
        """
        Process soil analysis data from API.
        
        Args:
            soil_data: Raw soil analysis data
            farm_size: Size of the farm in hectares
            
        Returns:
            Processed soil metrics
        """
        # Only use soil type as input (one-hot encoding)
        soil_types = ['sandy', 'loamy', 'clay', 'silt', 'sandy_loam']
        soil_type = soil_data.get('soil_type', 'loamy')
        processed_data = {'farm_size': farm_size}
        for st in soil_types:
            processed_data[f'soil_type_{st}'] = 1.0 if soil_type == st else 0.0
        processed_data['soil_type'] = soil_type
        return processed_data
        
    def _calculate_texture_score(self, composition: Dict[str, float]) -> float:
        """
        Calculate soil texture score based on composition.
        
        Args:
            composition: Dictionary with sand, silt, and clay percentages
            
        Returns:
            Soil texture score (0-1)
        """
        # Ideal ranges for different soil components
        ideal_ranges = {
            'sand': (20, 60),
            'silt': (30, 50),
            'clay': (10, 30)
        }
        
        score = 0
        for component, (min_val, max_val) in ideal_ranges.items():
            value = composition.get(component, 0) * 100  # Convert to percentage
            if min_val <= value <= max_val:
                score += 1
            else:
                score += max(0, 1 - abs(value - (min_val + max_val) / 2) / (max_val - min_val))
                
        return score / len(ideal_ranges)
        
    def _calculate_drainage_score(self, composition: Dict[str, float]) -> float:
        """
        Calculate soil drainage score based on composition.
        
        Args:
            composition: Dictionary with sand, silt, and clay percentages
            
        Returns:
            Drainage score (0-1)
        """
        # Sand has best drainage, clay has worst
        return (composition['sand'] * 1.0 + 
                composition['silt'] * 0.5 + 
                composition['clay'] * 0.2)
        
    def _calculate_soil_quality_score(self, soil_data: Dict[str, float]) -> float:
        """Calculate overall soil quality score."""
        weights = {
            'ph': 0.15,
            'organic_matter': 0.2,
            'fertility_index': 0.25,
            'texture_score': 0.2,
            'drainage_score': 0.2
        }
        
        score = 0
        for metric, weight in weights.items():
            if metric in soil_data:
                normalized_value = min(1.0, max(0.0, soil_data[metric] / 10.0))
                score += normalized_value * weight
                
        return score

    def prepare_prediction_features(self, 
                                weather_data: pd.DataFrame,
                                soil_data: Dict[str, float],
                                market_data: Dict[str, Any],
                                historical_prices: Optional[pd.DataFrame] = None) -> Dict[str, np.ndarray]:
        """
        Prepare features for both crop selection and price prediction.
        
        Args:
            weather_data: Processed weather data
            soil_data: Processed soil data
            market_data: Current market data
            historical_prices: Historical price data (optional)
            
        Returns:
            Dictionary containing feature matrices for both models
        """
        # Weather features with advanced metrics
        weather_features = {
            'temperature': weather_data['temperature'].mean(),
            'humidity': weather_data['humidity'].mean(),
            'rainfall': weather_data['rainfall'].mean(),
            'heat_index': weather_data['heat_index'].mean() if 'heat_index' in weather_data else 0,
            'soil_moisture': weather_data['soil_moisture'].mean() if 'soil_moisture' in weather_data else 0
        }
        
        # Market features with trend analysis
        market_features = {
            'current_price': float(market_data.get('current_price', 0)),
            'demand_index': float(market_data.get('demand_index', 0)),
            'supply_index': float(market_data.get('supply_index', 0)),
            'market_trend': self._calculate_market_trend(market_data),
            'seasonal_factor': self._get_seasonal_factor(datetime.now())
        }
        
        # Combine all features for crop selection (soil_data now only contains soil type one-hot)
        crop_features = {
            **weather_features,
            **soil_data,
            **market_features
        }
        
        # Prepare price prediction features if historical data is available
        price_features = None
        if historical_prices is not None:
            price_features = self._prepare_price_features(historical_prices, market_features)
        
        return {
            'crop_features': np.array(list(crop_features.values())).reshape(1, -1),
            'price_features': price_features
        }
        
    def _calculate_market_trend(self, market_data: Dict[str, Any]) -> float:
        """Calculate market trend indicator."""
        if 'price_history' not in market_data:
            return 0.0
            
        prices = market_data['price_history']
        if len(prices) < 2:
            return 0.0
            
        # Calculate trend using simple linear regression
        x = np.arange(len(prices))
        y = np.array(prices)
        slope = np.polyfit(x, y, 1)[0]
        
        # Normalize trend to [-1, 1] range
        return np.tanh(slope)
        
    def _get_seasonal_factor(self, date: datetime) -> float:
        """Calculate seasonal factor for crop suitability."""
        # Convert month to seasonal factor using sine wave
        return np.sin(2 * np.pi * (date.month / 12.0))
        
    def _prepare_price_features(self, historical_prices: pd.DataFrame, 
                              market_features: Dict[str, float]) -> np.ndarray:
        """Prepare features for price prediction."""
        # Calculate technical indicators
        prices = historical_prices['price'].values
        
        features = []
        
        # Moving averages
        ma_7 = pd.Series(prices).rolling(7).mean().fillna(method='bfill')
        ma_30 = pd.Series(prices).rolling(30).mean().fillna(method='bfill')
        
        # Price momentum
        momentum = prices - np.roll(prices, 7)
        momentum[0:7] = 0
        
        # Volatility
        volatility = pd.Series(prices).rolling(14).std().fillna(method='bfill')
        
        # Combine all features
        features = np.column_stack([
            prices,
            ma_7,
            ma_30,
            momentum,
            volatility,
            np.full_like(prices, market_features['demand_index']),
            np.full_like(prices, market_features['supply_index'])
        ])
        
        return features

    @staticmethod
    def normalize_features(features: np.ndarray) -> np.ndarray:
        """
        Normalize feature values to [0,1] range.
        
        Args:
            features: Raw feature matrix
            
        Returns:
            Normalized feature matrix
        """
        min_vals = features.min(axis=0)
        max_vals = features.max(axis=0)
        normalized = (features - min_vals) / (max_vals - min_vals + 1e-10)
        return normalized

    @staticmethod
    def validate_data(data: pd.DataFrame, required_columns: List[str]) -> bool:
        """
        Validate that data contains required columns and no invalid values.
        
        Args:
            data: DataFrame to validate
            required_columns: List of required column names
            
        Returns:
            True if data is valid, False otherwise
        """
        # Check required columns
        if not all(col in data.columns for col in required_columns):
            return False
        
        # Check for invalid values
        if data.isnull().any().any():
            return False
        
        return True

    def prepare_historical_data(self, historical_data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare historical data for model training.
        
        Args:
            historical_data: DataFrame with historical crop and market data
            
        Returns:
            Tuple of (features, target_prices)
        """
        # Sort by date
        historical_data = historical_data.sort_values('date')
        
        # Calculate technical indicators
        features = []
        for crop in historical_data['crop'].unique():
            crop_data = historical_data[historical_data['crop'] == crop]
            
            # Calculate features for this crop
            crop_features = self._prepare_price_features(
                crop_data[['price']],
                {
                    'demand_index': crop_data['demand_index'].mean(),
                    'supply_index': crop_data['supply_index'].mean()
                }
            )
            
            features.append(crop_features)
        
        # Combine all features
        X = np.concatenate(features, axis=0)
        y = historical_data['price'].values
        
        return X, y
        
    def _calculate_heat_index(self, temperature: pd.Series, humidity: pd.Series) -> pd.Series:
        """
        Calculate heat index from temperature and humidity.
        
        Args:
            temperature: Temperature in Celsius
            humidity: Relative humidity (%)
            
        Returns:
            Heat index values
        """
        # Convert Celsius to Fahrenheit for the standard heat index formula
        temp_f = temperature * 9/5 + 32
        
        # Simple heat index formula
        hi = 0.5 * (temp_f + 61.0 + ((temp_f - 68.0) * 1.2) + (humidity * 0.094))
        
        # Convert back to Celsius
        return (hi - 32) * 5/9

    def extract_seasonal_features(self, date: datetime) -> Dict[str, float]:
        """
        Extract advanced seasonal features from a date.
        
        Args:
            date: Date to extract features from
            
        Returns:
            Dictionary of seasonal features
        """
        # Basic seasonal features
        features = {
            'day_of_year': date.timetuple().tm_yday / 365.0,
            'month': date.month / 12.0,
            'season': (date.month % 12 + 3) // 3 / 4.0
        }
        
        # Add cyclical features
        features.update({
            'month_sin': np.sin(2 * np.pi * date.month / 12.0),
            'month_cos': np.cos(2 * np.pi * date.month / 12.0),
            'day_sin': np.sin(2 * np.pi * date.day / 31.0),
            'day_cos': np.cos(2 * np.pi * date.day / 31.0)
        })
        
        return features