"""
Web application for crop prediction service.
"""

import sys
import os
# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, render_template, request, jsonify
from models.crop_prediction_model import CropPredictionModel
from models.crop_database import CropDatabase
from utils.data_processor import DataProcessor
from utils.profit_calculator import ProfitCalculator
from api.weather_api import WeatherAPI
from api.market_api import MarketAPI
import numpy as np

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Initialize components
    model = CropPredictionModel()
    crop_db = CropDatabase()
    weather_api = WeatherAPI()
    market_api = MarketAPI()
    data_processor = DataProcessor()
    profit_calc = ProfitCalculator()

    @app.route('/')
    def home():
        """Render home page."""
        return render_template('index.html')

    @app.route('/predict', methods=['POST'])
    def predict():
        """Handle crop prediction requests."""
        try:
            data = request.get_json()
            print("Received prediction request with data:", data)
            
            # Extract soil data
            soil_data = data.get('soil_data', {})
            soil_type = soil_data.get('soil_type', 'loamy')
            # Simple crop recommendation based on soil type
            if soil_type == 'clay':
                recommended_crop = "Rice"
                suitability = 0.9
            elif soil_type == 'loamy':
                recommended_crop = "Wheat"
                suitability = 0.85
            elif soil_type == 'sandy':
                recommended_crop = "Corn"
                suitability = 0.8
            else:
                recommended_crop = "Wheat"
                suitability = 0.7
                
            # Calculate sample profitability
            area = float(data.get('area', 1.0))
            profitability = {
                'estimated_yield': 5.0 * area,
                'total_cost': 2000 * area,
                'expected_revenue': 3000 * area,
                'projected_profit': 1000 * area,
                'roi': 50.0
            }
            
            return jsonify({
                'recommended_crop': recommended_crop,
                'profitability_analysis': profitability
            })
            
            # Make prediction
            prediction = model.predict(features)
            
            # Calculate profitability for recommended crop
            profitability = profit_calc.analyze_profitability(
                prediction[0],
                float(data.get('area', 1.0)),
                market_data,
                {'weather_quality': 1.0, 'soil_quality': 1.0},
                data.get('input_costs', {})
            )
            
            return jsonify({
                'recommended_crop': prediction[0],
                'profitability_analysis': profitability
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/crops', methods=['GET'])
    def get_crops():
        """Get list of all available crops."""
        try:
            crops = crop_db.get_all_crops()
            return jsonify({'crops': crops})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/crop/<name>', methods=['GET'])
    def get_crop_info(name):
        """Get information about a specific crop."""
        try:
            crop_info = crop_db.get_crop_info(name)
            if crop_info is None:
                return jsonify({'error': 'Crop not found'}), 404
            return jsonify(crop_info)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)