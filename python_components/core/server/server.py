import os
import sys
import asyncio
from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from datetime import datetime

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
# Configure CORS to allow all origins for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Use eventlet for better compatibility with Socket.io
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
        
        # Always emit a process update when a message is received
        socketio.emit('process_update', {
            'type': 'process',
            'message': f'Processing query with {model}: {message[:50]}...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Check if this is a code generation request
        is_code_request = any(keyword in message.lower() for keyword in 
                            ['generate', 'create', 'write', 'code', 'program', 'script', 'function'])
        
        if is_code_request:
            # Broadcast process updates to all connected clients
            socketio.emit('process_update', {
                'type': 'process',
                'message': f'Starting code generation for: {message[:50]}...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            socketio.emit('process_update', {
                'type': 'process',
                'message': 'Generating code...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
        
        # Process the message
        response = await controller.process_message(message)
        
        # Emit a process update when processing is complete
        socketio.emit('process_update', {
            'type': 'process',
            'message': f'Query processed successfully with {model}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # If this was a code generation request, emit more process updates
        if is_code_request:
            # Extract code from response
            code_content = response.get('content', '')
            
            socketio.emit('process_update', {
                'type': 'process',
                'message': 'Code generated, processing files...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Determine file extension based on content
            file_ext = '.js'  # Default extension
            if 'pragma solidity' in code_content:
                file_ext = '.sol'
            elif 'def ' in code_content and ('import ' in code_content or '"""' in code_content):
                file_ext = '.py'
            elif '<html>' in code_content.lower():
                file_ext = '.html'
            elif 'class ' in code_content and '{' in code_content and '}' in code_content:
                file_ext = '.java'
            
            # Create timestamp for unique file naming
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create a file path for the generated code
            file_name = f"generated_code_{timestamp}{file_ext}"
            dir_path = os.path.join('.Repositories', f'generated_{timestamp}')
            file_path = os.path.join(dir_path, file_name)
            
            # Ensure directory exists
            os.makedirs(dir_path, exist_ok=True)
            
            # Save the file
            try:
                with open(file_path, 'w') as f:
                    f.write(code_content)
                logger.info(f'Saved generated code to {file_path}')
            except Exception as e:
                logger.error(f"Error saving file: {str(e)}")
                socketio.emit('process_update', {
                    'type': 'error',
                    'message': f'Error saving file: {str(e)}',
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
            
            # Emit file creation updates
            socketio.emit('process_update', {
                'type': 'file',
                'message': f'Added file: {file_path}',
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Emit code update
            socketio.emit('process_update', {
                'type': 'code',
                'message': code_content,
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            socketio.emit('process_update', {
                'type': 'process',
                'message': 'Code generation completed',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error processing message with {model}: {str(e)}")
        socketio.emit('process_update', {
            'type': 'error',
            'message': f'Error processing message: {str(e)}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
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
        
        # Emit process updates
        socketio.emit('process_update', {
            'type': 'process',
            'message': f'Starting code generation for: {prompt[:50]}...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Generating code...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Use generate_code method if available, otherwise fall back to process_message
        if hasattr(controller, 'generate_code'):
            response = await controller.generate_code(prompt)
        else:
            response = await controller.process_message(f"Generate code for: {prompt}")
        
        # Extract code from response
        code_content = response.get('content', '')
        
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Code generated, processing files...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Determine file extension based on content
        file_ext = '.js'  # Default extension
        if 'pragma solidity' in code_content:
            file_ext = '.sol'
        elif 'def ' in code_content and ('import ' in code_content or '"""' in code_content):
            file_ext = '.py'
        elif '<html>' in code_content.lower():
            file_ext = '.html'
        elif 'class ' in code_content and '{' in code_content and '}' in code_content:
            file_ext = '.java'
        
        # Create timestamp for unique file naming
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create a file path for the generated code
        file_name = f"generated_code_{timestamp}{file_ext}"
        dir_path = os.path.join('.Repositories', f'generated_{timestamp}')
        file_path = os.path.join(dir_path, file_name)
        
        # Ensure directory exists
        os.makedirs(dir_path, exist_ok=True)
        
        # Save the file
        try:
            with open(file_path, 'w') as f:
                f.write(code_content)
            logger.info(f'Saved generated code to {file_path}')
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            socketio.emit('process_update', {
                'type': 'error',
                'message': f'Error saving file: {str(e)}',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
        
        # Emit file creation updates
        socketio.emit('process_update', {
            'type': 'file',
            'message': f'Added file: {file_path}',
            'path': file_path,
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Emit code update
        socketio.emit('process_update', {
            'type': 'code',
            'message': code_content,
            'path': file_path,
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Code generation completed',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error generating code with {model}: {str(e)}")
        socketio.emit('process_update', {
            'type': 'error',
            'message': f'Error generating code: {str(e)}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)