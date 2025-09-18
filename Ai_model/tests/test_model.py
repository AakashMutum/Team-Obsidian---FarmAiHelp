"""
Unit tests for crop prediction model.
"""

import unittest
import numpy as np
from models.crop_prediction_model import CropPredictionModel
from models.crop_database import CropDatabase

class TestCropPredictionModel(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test."""
        self.model = CropPredictionModel()
        self.sample_features = np.array([
            [25.0, 60.0, 100.0, 6.5, 50.0, 30.0, 40.0, 2.5],
            [28.0, 70.0, 150.0, 7.0, 45.0, 35.0, 35.0, 3.0]
        ])
        self.sample_labels = np.array(['rice', 'wheat'])

    def test_model_initialization(self):
        """Test model initialization."""
        self.assertIsNotNone(self.model)
        self.assertFalse(self.model.is_trained)

    def test_model_training(self):
        """Test model training."""
        self.model.train(self.sample_features, self.sample_labels)
        self.assertTrue(self.model.is_trained)

    def test_prediction(self):
        """Test model prediction."""
        # Train the model
        self.model.train(self.sample_features, self.sample_labels)
        
        # Make prediction
        test_features = np.array([[26.0, 65.0, 120.0, 6.8, 48.0, 32.0, 38.0, 2.8]])
        predictions = self.model.predict(test_features)
        
        self.assertIsNotNone(predictions)
        self.assertEqual(len(predictions), 1)
        self.assertIn(predictions[0], ['rice', 'wheat'])

    def test_feature_importance(self):
        """Test feature importance calculation."""
        # Train the model
        self.model.train(self.sample_features, self.sample_labels)
        
        # Get feature importance
        importance = self.model.get_feature_importance()
        
        self.assertIsNotNone(importance)
        self.assertEqual(len(importance), self.sample_features.shape[1])

    def test_predict_without_training(self):
        """Test prediction without training."""
        test_features = np.array([[26.0, 65.0, 120.0, 6.8, 48.0, 32.0, 38.0, 2.8]])
        
        with self.assertRaises(ValueError):
            self.model.predict(test_features)

    def test_feature_importance_without_training(self):
        """Test feature importance without training."""
        with self.assertRaises(ValueError):
            self.model.get_feature_importance()

class TestCropDatabase(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test."""
        self.db = CropDatabase()
        self.test_crop = {
            'name': 'test_crop',
            'growing_season': 'summer',
            'water_needs': 'medium',
            'soil_type': 'loamy'
        }

    def test_add_crop(self):
        """Test adding a new crop."""
        result = self.db.add_crop('test_crop', self.test_crop)
        self.assertTrue(result)
        
        # Verify crop was added
        crop_info = self.db.get_crop_info('test_crop')
        self.assertEqual(crop_info, self.test_crop)

    def test_add_existing_crop(self):
        """Test adding an already existing crop."""
        # Add crop first time
        self.db.add_crop('test_crop', self.test_crop)
        
        # Try to add same crop again
        result = self.db.add_crop('test_crop', self.test_crop)
        self.assertFalse(result)

    def test_update_crop(self):
        """Test updating crop information."""
        # Add initial crop
        self.db.add_crop('test_crop', self.test_crop)
        
        # Update crop
        updated_info = self.test_crop.copy()
        updated_info['water_needs'] = 'high'
        
        result = self.db.update_crop('test_crop', updated_info)
        self.assertTrue(result)
        
        # Verify update
        crop_info = self.db.get_crop_info('test_crop')
        self.assertEqual(crop_info['water_needs'], 'high')

    def test_get_all_crops(self):
        """Test getting all crops."""
        # Add multiple crops
        self.db.add_crop('crop1', {'name': 'crop1'})
        self.db.add_crop('crop2', {'name': 'crop2'})
        
        crops = self.db.get_all_crops()
        self.assertIsInstance(crops, list)
        self.assertIn('crop1', crops)
        self.assertIn('crop2', crops)

if __name__ == '__main__':
    unittest.main()