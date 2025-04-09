import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_models_controller.cohere_controller import CohereController
from ai_models_controller.ai_config.config_manager import ConfigManager
from utils.logger import AdvancedLogger

# Set up logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("test_cohere")

async def test_cohere_controller():
    # Load configuration with correct path
    config_path = Path(__file__).parent / "ai_config" / "config.yaml"
    config_manager = ConfigManager(str(config_path))
    config = config_manager.get_config()
    
    # Get API key from config
    api_key = None
    if config and 'ai' in config and 'cohere' in config['ai']:
        api_key = config['ai']['cohere'].get('api_key')
        if api_key:
            logger.info(f"Found API key in config: {api_key[:5]}...{api_key[-5:]}")
        else:
            logger.warning("No API key found in config for Cohere")
    
    if not api_key:
        logger.error("Cannot test Cohere controller without an API key")
        return False
    
    # Initialize the controller with the API key
    cohere_controller = CohereController(api_key=api_key)
    
    # Test with a simple prompt
    test_prompt = "Write a short paragraph about artificial intelligence."
    logger.info(f"Testing with prompt: '{test_prompt}'")
    
    try:
        # Process the prompt
        response = await cohere_controller.process_command(test_prompt)
        
        # Log and print the response
        logger.info(f"Response received, length: {len(response)}")
        print("\n--- Cohere Controller Response ---")
        print(response)
        print("-----------------------------------\n")
        
        return True
    except Exception as e:
        logger.error(f"Error testing Cohere controller: {e}")
        print(f"Error: {e}")
        
        # Check if it's an API key issue
        if "auth" in str(e).lower() or "key" in str(e).lower() or "token" in str(e).lower():
            logger.error("This appears to be an API key issue. Please check your Cohere API key.")
            print("API Key Issue: Please check your Cohere API key.")
        
        return False

if __name__ == "__main__":
    # Run the test
    print("Testing Cohere Controller...")
    result = asyncio.run(test_cohere_controller())
    
    if result:
        print("Test completed successfully")
    else:
        print("Test failed")


#  python test_cohere_controller.py 