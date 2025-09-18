"""
Database for storing and retrieving crop characteristics.
"""

from typing import Dict, List, Optional
import json
import os

class CropDatabase:
    def __init__(self, data_file: str = 'data/sample_data.json'):
        """
        Initialize the crop database.
        
        Args:
            data_file: Path to the JSON file containing crop data
        """
        self.data_file = data_file
        self.crops_data = self._load_data()

    def _load_data(self) -> Dict:
        """
        Load crop data from JSON file.
        
        Returns:
            Dictionary containing crop data
        """
        if not os.path.exists(self.data_file):
            return {}
        
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"Error reading {self.data_file}")
            return {}

    def get_crop_info(self, crop_name: str) -> Optional[Dict]:
        """
        Get information about a specific crop.
        
        Args:
            crop_name: Name of the crop
            
        Returns:
            Dictionary containing crop information or None if not found
        """
        return self.crops_data.get(crop_name)

    def get_all_crops(self) -> List[str]:
        """
        Get list of all available crops.
        
        Returns:
            List of crop names
        """
        return list(self.crops_data.keys())

    def add_crop(self, crop_name: str, crop_info: Dict) -> bool:
        """
        Add a new crop to the database.
        
        Args:
            crop_name: Name of the crop
            crop_info: Dictionary containing crop information
            
        Returns:
            True if successful, False otherwise
        """
        if crop_name in self.crops_data:
            return False
        
        self.crops_data[crop_name] = crop_info
        self._save_data()
        return True

    def update_crop(self, crop_name: str, crop_info: Dict) -> bool:
        """
        Update information for an existing crop.
        
        Args:
            crop_name: Name of the crop
            crop_info: Dictionary containing updated crop information
            
        Returns:
            True if successful, False if crop not found
        """
        if crop_name not in self.crops_data:
            return False
        
        self.crops_data[crop_name].update(crop_info)
        self._save_data()
        return True

    def _save_data(self) -> None:
        """Save current crop data to JSON file."""
        try:
            with open(self.data_file, 'w') as f:
                json.dump(self.crops_data, f, indent=4)
        except Exception as e:
            print(f"Error saving data: {str(e)}")