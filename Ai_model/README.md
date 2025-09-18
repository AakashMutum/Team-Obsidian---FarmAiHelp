# Crop Prediction Project

## Overview
This project is designed to predict optimal crop choices based on various environmental, weather, and market factors. It uses machine learning models to provide recommendations for farmers and agricultural businesses.

## Features
- Weather data integration
- Market price analysis
- Crop characteristics database
- Profit calculation
- Web interface for easy access

## Installation
1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage
Run the main application:
```
python main.py
```

Access the web interface at http://localhost:5000

## Project Structure
- `models/`: ML model and crop database
- `api/`: External API integrations
- `utils/`: Utility functions
- `tests/`: Unit tests
- `data/`: Sample and historical data
- `web_app/`: Web interface
- `notebooks/`: Jupyter notebooks for analysis

## Testing
Run tests with:
```
pytest tests/
```

## License
MIT