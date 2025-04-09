import os
import yaml
import logging

logger = logging.getLogger("ConfigManager")

class ConfigManager:
    def __init__(self, config_path=None):
        self.config = {}
        
        # Define possible config file locations
        if config_path is None:
            possible_paths = [
                "./config.yaml",  # Current directory
                os.path.join(os.path.dirname(__file__), "config.yaml"),  # ai_config directory
                os.path.join(os.path.dirname(os.path.dirname(__file__)), "config.yaml"),  # ai_models_controller directory
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "config", "config.yaml"),  # python_components/config directory
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "config", "config.yaml")  # project root/config directory
            ]
            
            # Try each path until we find a valid config file
            for path in possible_paths:
                if os.path.exists(path):
                    config_path = path
                    break
        
        self.config_path = config_path
        self.load_config()
    
    def load_config(self):
        """Load configuration from YAML file"""
        try:
            if self.config_path and os.path.exists(self.config_path):
                with open(self.config_path, 'r') as file:
                    self.config = yaml.safe_load(file)
                logger.info(f"Configuration loaded successfully from {self.config_path}")
            else:
                logger.warning(f"Config file not found at {self.config_path}")
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
    
    def get_config(self):
        """Get the loaded configuration"""
        return self.config
    
    def get_value(self, key_path, default=None):
        """Get a value from the configuration using dot notation"""
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value