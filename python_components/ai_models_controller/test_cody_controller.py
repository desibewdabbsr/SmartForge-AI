import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_models_controller.cody_controller import CodyController
from ai_models_controller.ai_config.config_manager import ConfigManager
from utils.logger import AdvancedLogger

# Set up logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("test_cody")

async def test_cody_controller():
    # Load configuration with correct path
    config_path = Path(__file__).parent / "ai_config" / "config.yaml"
    config_manager = ConfigManager(str(config_path))
    config = config_manager.get_config()
    
    # Get API key from config
    api_key = None
    if config and 'ai' in config and 'cody' in config['ai']:
        api_key = config['ai']['cody'].get('api_key')
        if api_key:
            logger.info(f"Found API key in config: {api_key[:5]}...{api_key[-5:]}")
        else:
            logger.warning("No API key found in config for Cody")
    
    # Initialize the controller with the API key
    cody_controller = CodyController(api_key=api_key)
    
    # Check if initialized
    if cody_controller.initialized:
        logger.info("Cody controller initialized successfully")
    else:
        logger.warning("Cody controller initialization failed - API key may be missing")
    
    # Test with a simple prompt
    test_prompt = "function sort"  # Simplified query for search
    logger.info(f"Testing with prompt: '{test_prompt}'")
    
    try:
        # Process the prompt
        response = await cody_controller.process_command(test_prompt)
        
        # Log and print the response
        logger.info(f"Response received: '{response}'")
        print("\n--- Cody Controller Response ---")
        print(response)
        print("---------------------------------\n")
        
        # Verify that we got the expected "hi" response
        if response == "hi":
            logger.info("Received expected 'hi' response")
        else:
            logger.info(f"Received unexpected response: '{response}'")
        
        # Test code generation specifically
        logger.info("Testing code generation...")
        code_response = await cody_controller.generate_code("React component")
        
        # Log and print the code response
        logger.info(f"Code generation response received: '{code_response.get('content', '')}'")
        print("\n--- Cody Code Generation Response ---")
        print(code_response.get('content', ''))
        print("--------------------------------------\n")
        
        # Verify that we got the expected "hi" response for code generation
        if code_response.get('content', '') == "hi":
            logger.info("Received expected 'hi' response for code generation")
        else:
            logger.info(f"Received unexpected response for code generation: '{code_response.get('content', '')}'")
        
        # Try to check if src CLI is available
        try:
            import subprocess
            result = subprocess.run(["which", "src"], capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"src CLI is available at: {result.stdout.strip()}")
                
                # Try a simple src CLI command
                logger.info("Testing src CLI...")
                os.environ["SRC_ACCESS_TOKEN"] = api_key
                os.environ["SRC_ENDPOINT"] = "https://sourcegraph.com"
                
                result = subprocess.run(["src", "search", "-json", "count:1 repo:github.com/sourcegraph/sourcegraph"], 
                                       capture_output=True, text=True)
                
                if result.returncode == 0:
                    logger.info("src CLI test successful")
                else:
                    logger.warning(f"src CLI test failed: {result.stderr}")
            else:
                logger.info("src CLI is not available")
        except Exception as e:
            logger.warning(f"Error checking src CLI: {e}")
        
        return True
    except Exception as e:
        logger.error(f"Error testing Cody controller: {e}")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # Run the test
    print("Testing Cody Controller...")
    result = asyncio.run(test_cody_controller())
    
    if result:
        print("Test completed successfully")
    else:
        print("Test failed")