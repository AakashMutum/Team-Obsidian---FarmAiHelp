#!/usr/bin/env python3
"""
Crop Prediction AI System - Main Application
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.crop_prediction_model import CropPredictionModel
from api.team_apis import TeamAPIs
import config

def main():
    """Main application function"""
    print("=== CROP PREDICTION AI SYSTEM ===\n")
    
    # Initialize components
    model = CropPredictionModel()
    team_apis = TeamAPIs()
    
    try:
        # Get input method
        print("Choose input method:")
        print("1. Manual input")
        print("2. Use team APIs")
        
        choice = input("Enter choice (1 or 2): ")
        
        if choice == "1":
            # Manual input for testing
            location = input("Enter location (e.g., Chennai, Tamil Nadu): ")
            farm_size = float(input("Enter farm size in acres: "))
            soil_texture = input("Enter soil texture (clay/loamy/sandy): ")
        
        elif choice == "2":
            # Use team APIs
            print("Fetching data from team APIs...")
            api_data = team_apis.get_all_data()
            location = api_data['location']
            farm_size = api_data['farm_size']
            soil_texture = api_data['soil_texture']
            print(f"Got: {location}, {farm_size} acres, {soil_texture} soil")
        
        else:
            print("Invalid choice!")
            return
        
        # Get recommendations
        print("\nAnalyzing crop options...")
        results = model.get_recommendations(
            location=location,
            farm_size=farm_size,
            soil_texture=soil_texture,
            rapidapi_key=config.RAPIDAPI_KEY
        )
        
        # Display results
        display_results(results)
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

def display_results(results):
    """Display the crop recommendations"""
    print("\n" + "="*60)
    print("CROP RECOMMENDATION RESULTS")
    print("="*60)
    
    # Input summary
    data = results['input_data']
    print(f"\n📍 Location: {data['location']}")
    print(f"🏗️  Farm Size: {data['farm_size']} acres")
    print(f"🌱 Soil Type: {data['soil_texture']}")
    
    # Weather info
    weather = data['weather']
    print(f"\n🌤️  Current Weather:")
    print(f"   Temperature: {weather['current_temp']}°C")
    print(f"   Humidity: {weather['humidity']}%")
    print(f"   Condition: {weather['weather_condition']}")
    
    # Best recommendation
    best = results['best_crop']
    print(f"\n🏆 RECOMMENDED CROP: {best['crop'].upper()}")
    print(f"   💰 Expected Profit: ₹{best['profit_data']['profit']:,.0f}")
    print(f"   📊 ROI: {best['profit_data']['roi']:.1f}%")
    print(f"   🎯 Suitability Score: {best['suitability_score']}/100")
    print(f"   🌾 Estimated Yield: {best['profit_data']['estimated_yield']:.1f} quintals")
    
    # All options
    print(f"\n📈 ALL OPTIONS (Ranked by Profit Potential):")
    for i, rec in enumerate(results['recommendations'], 1):
        profit = rec['profit_data']['profit']
        roi = rec['profit_data']['roi']
        print(f"   {i}. {rec['crop'].title():12} - ₹{profit:>8,.0f} (ROI: {roi:>5.1f}%)")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    exit(main())