import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_models_controller.deepseek_controller import DeepSeekController
from ai_models_controller.ai_config.config_manager import ConfigManager
from utils.logger import AdvancedLogger

# Set up logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("test_deepseek")

async def test_deepseek_controller():
    # Load configuration with correct path
    config_path = Path(__file__).parent / "ai_config" / "config.yaml"
    config_manager = ConfigManager(str(config_path))
    config = config_manager.get_config()
    
    # Get model name from config if available
    model_name = "deepseek-coder:1.3b"  # Default model name
    if config and 'ai' in config and 'local' in config['ai'] and 'deepseek' in config['ai']['local']:
        deepseek_config = config['ai']['local']['deepseek']
        if deepseek_config.get('enabled', False) and deepseek_config.get('path'):
            # The path in config might be a model name for Ollama
            config_model = deepseek_config.get('path')
            if ':' in config_model:  # Looks like an Ollama model name
                model_name = config_model
                logger.info(f"Using model name from config: {model_name}")
    
    logger.info(f"Using model name: {model_name}")
    
    # Initialize the controller with the model name
    deepseek_controller = DeepSeekController(model_name=model_name)
    
    # Check if initialized
    if deepseek_controller.initialized:
        logger.info("DeepSeek controller initialized successfully")
    else:
        logger.warning("DeepSeek controller initialization failed")
        logger.info("Will use simulated responses")
        
        # Check if Ollama is running
        try:
            import requests
            response = requests.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                logger.info(f"Available Ollama models: {[m.get('name') for m in models]}")
                logger.info("Ollama is running but the model might not be available")
                logger.info("Try running: ollama pull deepseek-coder:1.3b")
            else:
                logger.warning("Ollama server is not responding")
                logger.info("Make sure Ollama is running with: ollama serve")
        except Exception as e:
            logger.error(f"Error checking Ollama: {e}")
            logger.info("Make sure Ollama is installed and running")
    
    # Test with a simple prompt
    test_prompt = "Write a Python function to calculate the factorial of a number."
    logger.info(f"Testing with prompt: '{test_prompt}'")
    
    try:
        # Process the prompt
        response = await deepseek_controller.process_command(test_prompt)
        
        # Log and print the response
        logger.info(f"Response received, length: {len(response)}")
        print("\n--- DeepSeek Controller Response ---")
        print(response)
        print("---------------------------------------\n")
        
        return True
    except Exception as e:
        logger.error(f"Error testing DeepSeek controller: {e}")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # Run the test
    print("Testing DeepSeek Controller...")
    result = asyncio.run(test_deepseek_controller())
    
    if result:
        print("Test completed successfully")
    else:
        print("Test failed")



# python test_deepseek_controller.py 