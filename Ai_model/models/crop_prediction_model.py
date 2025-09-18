"""
Advanced crop prediction model with integrated weather and market data analysis.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta

from api.weather_api import WeatherAPI
from api.market_api import MarketAPI
from utils.data_processor import DataProcessor
from utils.profit_calculator import ProfitCalculator

class CropPredictionModel:
    def __init__(self):
        """Initialize the crop prediction model with integrated APIs and advanced analytics."""
        # Initialize API clients
        self.weather_api = WeatherAPI()
        self.market_api = MarketAPI()
        self.data_processor = DataProcessor()
        self.profit_calculator = ProfitCalculator()
        
        # Crop selection model
        self.crop_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # Price prediction model (for each crop)
        self.price_models = {}
        
        # Feature scaling
        self.crop_scaler = StandardScaler()
        self.price_scalers = {}
        
        # Training status
        self.is_crop_model_trained = False
        self.trained_crops = set()
        
        # Cache for API data
        self.weather_cache = {}
        self.market_cache = {}

    def preprocess_crop_data(self, data: np.ndarray) -> np.ndarray:
        """
        Preprocess data for crop selection model.
        
        Args:
            data: Raw input features
            
        Returns:
            Preprocessed features
        """
        return self.crop_scaler.transform(data)

    def preprocess_price_data(self, data: np.ndarray, crop: str) -> np.ndarray:
        """
        Preprocess data for price prediction model.
        
        Args:
            data: Raw input features
            crop: Crop name
            
        Returns:
            Preprocessed features
        """
        if crop not in self.price_scalers:
            raise ValueError(f"No price model trained for crop: {crop}")
        return self.price_scalers[crop].transform(data)

    def train_crop_model(self, X: np.ndarray, y: np.ndarray) -> None:
        """
        Train the crop selection model.
        
        Args:
            X: Training features (weather, soil, current market conditions)
            y: Target labels (optimal crops)
        """
        # Scale the features
        X_scaled = self.crop_scaler.fit_transform(X)
        
        # Train the model
        self.crop_model.fit(X_scaled, y)
        self.is_crop_model_trained = True

    def train_price_model(self, X: np.ndarray, y: np.ndarray, crop: str) -> None:
        """
        Train price prediction model for a specific crop.
        
        Args:
            X: Training features (time series features)
            y: Target values (future prices)
            crop: Crop name
        """
        if crop not in self.price_models:
            self.price_models[crop] = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.price_scalers[crop] = StandardScaler()

        # Scale the features
        X_scaled = self.price_scalers[crop].fit_transform(X)
        
        # Train the model
        self.price_models[crop].fit(X_scaled, y)
        self.trained_crops.add(crop)

    def predict_best_crops(self, features: np.ndarray, n_recommendations: int = 3) -> List[str]:
        """
        Predict the best crops for given conditions.
        
        Args:
            features: Input features for prediction
            n_recommendations: Number of crop recommendations to return
            
        Returns:
            List of recommended crop names
        """
        if not self.is_crop_model_trained:
            raise ValueError("Crop model must be trained before making predictions")
        
        # Preprocess features
        X_scaled = self.preprocess_crop_data(features)
        
        # Get probability scores for each crop
        crop_probabilities = self.crop_model.predict_proba(X_scaled)
        
        # Get top N crop recommendations
        top_indices = np.argsort(crop_probabilities[0])[-n_recommendations:][::-1]
        recommended_crops = [self.crop_model.classes_[i] for i in top_indices]
        
        return recommended_crops

    def predict_future_price(self, features: np.ndarray, crop: str, 
                           forecast_periods: int = 12) -> Tuple[np.ndarray, float]:
        """
        Predict future prices for a crop.
        
        Args:
            features: Input features for prediction
            crop: Crop name
            forecast_periods: Number of future time periods to predict
            
        Returns:
            Tuple of (predicted prices, confidence score)
        """
        if crop not in self.trained_crops:
            raise ValueError(f"No price model trained for crop: {crop}")
        
        # Preprocess features
        X_scaled = self.preprocess_price_data(features, crop)
        
        # Make predictions for future periods
        future_prices = []
        current_features = X_scaled.copy()
        
        for _ in range(forecast_periods):
            price = self.price_models[crop].predict(current_features.reshape(1, -1))[0]
            future_prices.append(price)
            
            # Update features for next prediction (assuming last feature is the price)
            current_features[-1] = price
        
        # Calculate prediction confidence (using R² of the model)
        confidence = self.price_models[crop].score(X_scaled, 
                                                 self.price_scalers[crop].inverse_transform(features)[:, -1])
        
        return np.array(future_prices), confidence

    def analyze_profit_potential(self, current_features: np.ndarray, 
                               crop: str, time_horizon: int = 6) -> Dict[str, Any]:
        """
        Analyze profit potential for a crop.
        
        Args:
            current_features: Current market and growing conditions
            crop: Crop name
            time_horizon: Number of months to forecast
            
        Returns:
            Dictionary containing profit analysis
        """
        if not (self.is_crop_model_trained and crop in self.trained_crops):
            raise ValueError("Both crop and price models must be trained")
        
        # Predict future prices
        future_prices, confidence = self.predict_future_price(current_features, crop, time_horizon)
        
        # Calculate statistics
        mean_price = np.mean(future_prices)
        price_trend = np.polyfit(range(len(future_prices)), future_prices, 1)[0]
        price_volatility = np.std(future_prices)
        
        return {
            'crop': crop,
            'predicted_prices': future_prices.tolist(),
            'mean_price': float(mean_price),
            'price_trend': float(price_trend),
            'price_volatility': float(price_volatility),
            'confidence_score': float(confidence),
            'best_selling_month': int(np.argmax(future_prices))
        }

    def get_feature_importance(self, model_type: str = 'crop', crop: str = None) -> Dict[str, float]:
        """
        Get feature importance scores.
        
        Args:
            model_type: Either 'crop' or 'price'
            crop: Required if model_type is 'price'
            
        Returns:
            Dictionary mapping feature names to their importance scores
        """
        if model_type == 'crop' and not self.is_crop_model_trained:
            raise ValueError("Crop model must be trained first")
        
        if model_type == 'price':
            if crop not in self.trained_crops:
                raise ValueError(f"No price model trained for crop: {crop}")
            feature_importance = self.price_models[crop].feature_importances_
        else:
            feature_importance = self.crop_model.feature_importances_
        
        return feature_importance

    def get_weather_data(self, city: str) -> Dict[str, Any]:
        """
        Get current weather data for a location.
        
        Args:
            city: City name
            
        Returns:
            Processed weather data
        """
        # Check cache first
        if city in self.weather_cache:
            cache_time, cache_data = self.weather_cache[city]
            if datetime.now() - cache_time < timedelta(hours=1):
                return cache_data
        
        # Fetch fresh data
        weather_data = self.weather_api.get_current_weather(city)
        
        if weather_data:
            # Process weather data
            processed_data = self.data_processor.process_weather_data(weather_data)
            
            # Update cache
            self.weather_cache[city] = (datetime.now(), processed_data)
            return processed_data
        
        return {}

    def get_market_analysis(self, state: str, district: str, 
                          commodity: str) -> Dict[str, Any]:
        """
        Get comprehensive market analysis for a crop.
        
        Args:
            state: State name
            district: District name
            commodity: Commodity name
            
        Returns:
            Market analysis data
        """
        # Get historical market data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)  # Last 1 year
        
        market_data = self.market_api.get_market_data(
            state=state,
            district=district,
            commodity=commodity,
            start_date=start_date,
            end_date=end_date
        )
        
        if not market_data['records']:
            return {}
        
        # Process market data
        df = pd.DataFrame(market_data['records'])
        df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'], format='%d/%m/%Y')
        df['Modal_Price'] = df['Modal_Price'].astype(float)
        
        # Calculate market trends
        analysis = {
            'current_price': float(df.iloc[-1]['Modal_Price']),
            'avg_price': float(df['Modal_Price'].mean()),
            'min_price': float(df['Modal_Price'].min()),
            'max_price': float(df['Modal_Price'].max()),
            'price_volatility': float(df['Modal_Price'].std()),
            'price_trend': float(np.polyfit(range(len(df)), df['Modal_Price'], 1)[0])
        }
        
        # Add seasonal patterns
        df['month'] = df['Arrival_Date'].dt.month
        monthly_avg = df.groupby('month')['Modal_Price'].mean().to_dict()
        analysis['seasonal_patterns'] = monthly_avg
        
        return analysis

    def get_comprehensive_prediction(self, 
                                  city: str, 
                                  state: str, 
                                  district: str,
                                  crops: List[str],
                                  farm_size: float = 1.0,
                                  soil_type: str = 'loamy') -> Dict[str, Any]:
        """
        Get comprehensive prediction including weather, market, and profit analysis.
        
        Args:
            city: City name for weather data
            state: State name for market data
            district: District name for market data
            crops: List of crops to analyze
            farm_size: Size of the farm in hectares (default: 1.0)
            soil_type: Type of soil ('sandy', 'loamy', 'clay', 'silt', 'sandy_loam')
            
        Returns:
            Comprehensive analysis and predictions
        """
        # Get weather data
        weather_data = self.get_weather_data(city)
        
        results = {
            'weather_conditions': weather_data,
            'crop_analysis': []
        }
        
        for crop in crops:
            # Get market analysis
            market_analysis = self.get_market_analysis(state, district, crop)
            
            if not market_analysis:
                continue
            
            # Prepare features for prediction
            features = self.data_processor.combine_features(weather_data, market_analysis)
            
            # Get crop suitability score
            if self.is_crop_model_trained:
                suitability_score = self.crop_model.predict_proba(
                    self.preprocess_crop_data(features.reshape(1, -1))
                )[0]
            else:
                suitability_score = None
            
            # Get price predictions
            if crop in self.trained_crops:
                future_prices, confidence = self.predict_future_price(
                    features, crop, forecast_periods=12
                )
            else:
                future_prices, confidence = None, None
            
            # Get soil quality score for the specific soil type
            soil_data = {
                'soil_type': soil_type
            }
            processed_soil = self.data_processor.process_soil_data(soil_data, farm_size)
            soil_quality = processed_soil.get('texture_score', 0.8)
            
            # Calculate profit potential
            profit_analysis = self.profit_calculator.analyze_profitability(
                crop,
                area=farm_size,  # Use actual farm size
                market_data={
                    'price_per_ton': market_analysis['current_price'],
                    'risk_factor': 0.1
                },
                conditions={
                    'weather_quality': weather_data.get('weather_score', 0.8),
                    'soil_quality': soil_quality,
                    'management_efficiency': 0.9,
                    'base_yield': 1.0  # Base yield per hectare
                },
                input_costs={
                    'seeds': 100,
                    'fertilizer': 200,
                    'irrigation': 150,
                    'labor': 300,
                    'equipment': 250
                }
            )
            
            crop_analysis = {
                'crop': crop,
                'suitability_score': float(max(suitability_score)) if suitability_score is not None else None,
                'market_analysis': market_analysis,
                'future_price_prediction': {
                    'prices': future_prices.tolist() if future_prices is not None else None,
                    'confidence': confidence
                },
                'profit_analysis': profit_analysis
            }
            
            results['crop_analysis'].append(crop_analysis)
        
        # Sort crops by profitability
        results['crop_analysis'].sort(key=lambda x: x['profit_analysis']['projected_profit'], reverse=True)
        
        return results