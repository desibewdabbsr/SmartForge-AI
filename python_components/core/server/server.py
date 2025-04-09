import os
import sys
import asyncio
from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

# Add the parent directory to the Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import AI controllers using absolute imports
from ai_models_controller.llama_controller import LlamaController
from ai_models_controller.deepseek_controller import DeepSeekController
from ai_models_controller.cohere_controller import CohereController
from ai_models_controller.ai_controller import AIController

# Import config manager
from ai_models_controller.ai_config.config_manager import ConfigManager

# Import socketio handlers and flask routes
from core.server.socketio_handlers import register_handlers
from core.server.flask_routes import register_routes

# Import advanced logger
try:
    from utils.logger import AdvancedLogger
    # Setup logging
    logger_manager = AdvancedLogger()
    logger = logger_manager.get_logger("server")
except ImportError:
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("server")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Change async_mode to 'eventlet' which is more compatible
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Load configuration
try:
    config_manager = ConfigManager()
    config = config_manager.get_config()
except Exception as e:
    logger.error(f"Error loading configuration: {e}")
    config = {}

# Initialize AI controllers
try:
    llama_controller = LlamaController()
    deepseek_controller = DeepSeekController()
    cohere_controller = CohereController(api_key=config.get('ai', {}).get('cohere', {}).get('api_key', ''))
    
    # Initialize the main AI controller and register individual controllers
    ai_controller = AIController()
    ai_controller.register_controller('llama', llama_controller)
    ai_controller.register_controller('deepseek', deepseek_controller)
    ai_controller.register_controller('cohere', cohere_controller)
    
    # Register socket handlers
    register_handlers(socketio, {
        'llama': llama_controller,
        'deepseek': deepseek_controller,
        'cohere': cohere_controller,
        'auto': ai_controller  # Add the auto controller for auto-selection
    })
    
    # Register Flask routes
    register_routes(app, {
        'llama': llama_controller,
        'deepseek': deepseek_controller,
        'cohere': cohere_controller,
        'auto': ai_controller  # Add the auto controller for auto-selection
    })
except Exception as e:
    logger.error(f"Error initializing controllers: {e}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'ok',
            'models': {
                'llama': getattr(llama_controller, 'initialized', False),
                'deepseek': getattr(deepseek_controller, 'initialized', False),
                'cohere': getattr(cohere_controller, 'initialized', False),
                'auto': getattr(ai_controller, 'initialized', False)
            }
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/process', methods=['POST'])
async def process_message():
    """Process a message with the specified AI model"""
    try:
        data = request.json
        message = data.get('message', '')
        model = data.get('model', 'auto')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        controllers = {
            'llama': llama_controller,
            'deepseek': deepseek_controller,
            'cohere': cohere_controller,
            'auto': ai_controller
        }
        
        controller = controllers.get(model)
        if not controller:
            return jsonify({'error': f'Unknown model: {model}'}), 400
        
        response = await controller.process_message(message)
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error processing message with {model}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
async def generate_code():
    """Generate code with the specified AI model"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        model = data.get('model', 'auto')  # Default to auto for code generation
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        controllers = {
            'llama': llama_controller,
            'deepseek': deepseek_controller,
            'cohere': cohere_controller,
            'auto': ai_controller
        }
        
        controller = controllers.get(model)
        if not controller:
            return jsonify({'error': f'Unknown model: {model}'}), 400
        
        # Use generate_code method if available, otherwise fall back to process_message
        if hasattr(controller, 'generate_code'):
            response = await controller.generate_code(prompt)
        else:
            response = await controller.process_message(f"Generate code for: {prompt}")
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error generating code with {model}: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)