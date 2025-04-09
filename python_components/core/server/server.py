import os
import asyncio
from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

# Import AI controllers
from ai_models_controller.llama_controller import LlamaController
from ai_models_controller.deepseek_controller import DeepSeekController
from ai_models_controller.cohere_controller import CohereController
from ai_models_controller.cody_controller import CodyController
from ai_models_controller.ai_controller import AIController

# Import config manager
from ai_models_controller.ai_config.config_manager import ConfigManager

# Import socketio handlers
from core.server.socketio_handlers import register_handlers
from core.server.flask_routes import register_routes

# Import advanced logger
from utils.logger import AdvancedLogger

# Setup logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("server")

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='asyncio')

# Load configuration
config_manager = ConfigManager()
config = config_manager.get_config()

# Initialize AI controllers
llama_controller = LlamaController()
deepseek_controller = DeepSeekController()
cohere_controller = CohereController(api_key=config.get('ai', {}).get('cohere', {}).get('api_key'))
cody_controller = CodyController(api_key=config.get('ai', {}).get('cody', {}).get('api_key'))

# Initialize the main AI controller and register individual controllers
ai_controller = AIController()
ai_controller.register_controller('llama', llama_controller)
ai_controller.register_controller('deepseek', deepseek_controller)
ai_controller.register_controller('cohere', cohere_controller)
ai_controller.register_controller('cody', cody_controller)

# Register socket handlers
register_handlers(socketio, {
    'llama': llama_controller,
    'deepseek': deepseek_controller,
    'cohere': cohere_controller,
    'cody': cody_controller,
    'auto': ai_controller  # Add the auto controller for auto-selection
})

# Register Flask routes
register_routes(app, {
    'llama': llama_controller,
    'deepseek': deepseek_controller,
    'cohere': cohere_controller,
    'cody': cody_controller,
    'auto': ai_controller  # Add the auto controller for auto-selection
})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'models': {
            'llama': llama_controller.initialized,
            'deepseek': deepseek_controller.initialized,
            'cohere': cohere_controller.initialized,
            'cody': cody_controller.initialized,
            'auto': ai_controller.initialized
        }
    })

@app.route('/api/process', methods=['POST'])
async def process_message():
    """Process a message with the specified AI model"""
    data = request.json
    message = data.get('message', '')
    model = data.get('model', 'auto')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    
    controllers = {
        'llama': llama_controller,
        'deepseek': deepseek_controller,
        'cohere': cohere_controller,
        'cody': cody_controller,
        'auto': ai_controller
    }
    
    controller = controllers.get(model)
    if not controller:
        return jsonify({'error': f'Unknown model: {model}'}), 400
    
    try:
        response = await controller.process_message(message)
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error processing message with {model}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
async def generate_code():
    """Generate code with the specified AI model"""
    data = request.json
    prompt = data.get('prompt', '')
    model = data.get('model', 'cody')  # Default to Cody for code generation
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    controllers = {
        'llama': llama_controller,
        'deepseek': deepseek_controller,
        'cohere': cohere_controller,
        'cody': cody_controller,
        'auto': ai_controller
    }
    
    controller = controllers.get(model)
    if not controller:
        return jsonify({'error': f'Unknown model: {model}'}), 400
    
    try:
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