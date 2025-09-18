"""
Advanced profit calculation and forecasting utilities for crop recommendations.
"""

from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, timedelta
import numpy as np
from scipy.stats import norm
import pandas as pd

class ProfitCalculator:
    def __init__(self):
        """Initialize the profit calculator with advanced cost modeling."""
        # Base cost factors
        self.cost_factors = {
            'seeds': 1.0,
            'fertilizer': 1.0,
            'irrigation': 1.0,
            'labor': 1.0,
            'equipment': 1.0,
            'storage': 1.0,
            'transport': 1.0,
            'insurance': 1.0
        }
        
        # Risk adjustment factors
        self.risk_factors = {
            'weather_risk': 0.1,
            'market_risk': 0.1,
            'pest_risk': 0.05,
            'storage_risk': 0.05
        }
        
        # Price trend weights for forecasting
        self.price_weights = {
            'historical_trend': 0.3,
            'seasonal_factor': 0.2,
            'market_sentiment': 0.2,
            'supply_demand': 0.3
        }

    def calculate_production_cost(self, crop_name: str, area: float, 
                               input_costs: Dict[str, float]) -> float:
        """
        Calculate the total production cost for a crop.
        
        Args:
            crop_name: Name of the crop
            area: Cultivation area in hectares
            input_costs: Dictionary of input costs
            
        Returns:
            Total production cost
        """
        base_cost = sum(cost * self.cost_factors[factor] 
                       for factor, cost in input_costs.items())
        return base_cost * area

    def estimate_yield(self, crop_name: str, area: float, 
                      conditions: Dict[str, Any]) -> float:
        """
        Estimate crop yield based on conditions.
        
        Args:
            crop_name: Name of the crop
            area: Cultivation area in hectares
            conditions: Dictionary of growing conditions
            
        Returns:
            Estimated yield in tons
        """
        # Base yield per hectare
        base_yield = conditions.get('base_yield', 0)
        
        # Apply condition modifiers
        weather_factor = conditions.get('weather_quality', 1.0)
        soil_factor = conditions.get('soil_quality', 1.0)
        management_factor = conditions.get('management_efficiency', 1.0)
        
        modified_yield = base_yield * weather_factor * soil_factor * management_factor
        return modified_yield * area

    def calculate_revenue(self, crop_name: str, yield_amount: float, 
                        market_price: float) -> float:
        """
        Calculate expected revenue from crop sale.
        
        Args:
            crop_name: Name of the crop
            yield_amount: Expected yield in tons
            market_price: Price per ton
            
        Returns:
            Expected revenue
        """
        return yield_amount * market_price

    def calculate_profit(self, revenue: float, total_cost: float, 
                       risk_factor: float = 0.1) -> float:
        """
        Calculate expected profit including risk adjustment.
        
        Args:
            revenue: Expected revenue
            total_cost: Total production cost
            risk_factor: Risk adjustment factor (0-1)
            
        Returns:
            Risk-adjusted profit
        """
        base_profit = revenue - total_cost
        risk_adjusted_profit = base_profit * (1 - risk_factor)
        return risk_adjusted_profit

    def analyze_profitability(self, crop_name: str, area: float,
                            market_data: Dict[str, Any],
                            conditions: Dict[str, Any],
                            input_costs: Dict[str, float]) -> Dict[str, float]:
        """
        Perform complete profitability analysis for a crop.
        
        Args:
            crop_name: Name of the crop
            area: Cultivation area in hectares
            market_data: Market price and trend data
            conditions: Growing conditions data
            input_costs: Production input costs
            
        Returns:
            Dictionary containing profitability metrics
        """
        # Calculate costs
        total_cost = self.calculate_production_cost(crop_name, area, input_costs)
        
        # Estimate yield
        estimated_yield = self.estimate_yield(crop_name, area, conditions)
        
        # Calculate revenue
        market_price = market_data.get('price_per_ton', 0)
        revenue = self.calculate_revenue(crop_name, estimated_yield, market_price)
        
        # Calculate profit
        risk_factor = market_data.get('risk_factor', 0.1)
        profit = self.calculate_profit(revenue, total_cost, risk_factor)
        
        # Return analysis
        return {
            'total_cost': total_cost,
            'estimated_yield': estimated_yield,
            'expected_revenue': revenue,
            'projected_profit': profit,
            'roi': (profit / total_cost) if total_cost > 0 else 0,
            'risk_factor': risk_factor
        }

    def calculate_break_even_price(self, total_cost: float, 
                                 estimated_yield: float) -> float:
        """
        Calculate break-even price per ton.
        
        Args:
            total_cost: Total production cost
            estimated_yield: Estimated yield in tons
            
        Returns:
            Break-even price per ton
        """
        return total_cost / estimated_yield if estimated_yield > 0 else float('inf')

    def forecast_price_trend(self, 
                           historical_prices: List[float], 
                           seasonal_factors: List[float],
                           market_indicators: Dict[str, float],
                           forecast_period: int = 12) -> List[float]:
        """
        Forecast price trends using weighted analysis of multiple factors.
        
        Args:
            historical_prices: List of historical prices
            seasonal_factors: List of seasonal adjustment factors
            market_indicators: Dictionary of market sentiment indicators
            forecast_period: Number of periods to forecast
            
        Returns:
            List of forecasted prices
        """
        # Calculate historical trend
        historical_trend = np.polyfit(range(len(historical_prices)), historical_prices, 1)[0]
        
        # Calculate seasonal component
        seasonal_component = np.mean(seasonal_factors)
        
        # Calculate market sentiment score
        sentiment_score = sum(score * weight for score, weight in market_indicators.items())
        
        # Generate forecast
        forecasts = []
        last_price = historical_prices[-1]
        
        for period in range(forecast_period):
            forecast = (
                last_price +
                (historical_trend * self.price_weights['historical_trend']) +
                (seasonal_component * self.price_weights['seasonal_factor']) +
                (sentiment_score * self.price_weights['market_sentiment'])
            )
            forecasts.append(max(0, forecast))  # Ensure non-negative prices
            last_price = forecast
            
        return forecasts

    def calculate_risk_adjusted_metrics(self,
                                     investment: float,
                                     revenue_forecast: List[float],
                                     risk_level: str = 'medium',
                                     confidence_level: float = 0.95) -> Dict[str, Any]:
        """
        Calculate risk-adjusted financial metrics.
        
        Args:
            investment: Total investment amount
            revenue_forecast: List of forecasted revenues
            risk_level: Risk level ('low', 'medium', 'high')
            confidence_level: Confidence level for VaR calculation
            
        Returns:
            Dictionary of risk-adjusted metrics
        """
        risk_multipliers = {
            'low': 0.9,
            'medium': 1.0,
            'high': 1.2
        }
        
        # Calculate basic metrics
        expected_revenue = np.mean(revenue_forecast)
        revenue_std = np.std(revenue_forecast)
        
        # Adjust for risk level
        risk_multiplier = risk_multipliers.get(risk_level.lower(), 1.0)
        total_risk = sum(self.risk_factors.values()) * risk_multiplier
        
        # Calculate Value at Risk (VaR)
        var = norm.ppf(1 - confidence_level) * revenue_std
        
        # Calculate risk-adjusted ROI
        base_roi = ((expected_revenue - investment) / investment) * 100 if investment > 0 else 0
        risk_adjusted_roi = max(0, base_roi - (total_risk * 100))
        
        # Calculate Sharpe-like ratio (risk-adjusted return metric)
        risk_free_rate = 0.02  # Assumed risk-free rate
        sharpe_ratio = ((expected_revenue - investment) / investment - risk_free_rate) / revenue_std if revenue_std > 0 else 0
        
        return {
            'expected_revenue': expected_revenue,
            'revenue_std': revenue_std,
            'value_at_risk': var,
            'risk_adjusted_roi': risk_adjusted_roi,
            'sharpe_ratio': sharpe_ratio,
            'risk_level': risk_level,
            'total_risk_factor': total_risk
        }