import logging
import asyncio
from flask_socketio import emit

logger = logging.getLogger(__name__)

def register_handlers(socketio, controllers):
    """Register all socket.io event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        logger.info('Client connected')
        emit('status', {'status': 'connected'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info('Client disconnected')
    
    @socketio.on('message')
    async def handle_message(data):
        """Handle a message from the client"""
        try:
            message = data.get('message', '')
            model = data.get('model', 'llama')
            
            if not message:
                emit('error', {'error': 'No message provided'})
                return
            
            controller = controllers.get(model)
            if not controller:
                emit('error', {'error': f'Unknown model: {model}'})
                return
            
            # Process the message
            response = await controller.process_message(message)
            
            # Emit the response
            emit('response', {
                'model': model,
                'response': response
            })
            
        except Exception as e:
            logger.error(f"Error handling message: {str(e)}")
            emit('error', {'error': str(e)})
    
    @socketio.on('generate_code')
    async def handle_generate_code(data):
        """Handle a code generation request from the client"""
        try:
            prompt = data.get('prompt', '')
            model = data.get('model', 'cody')  # Default to Cody for code generation
            
            if not prompt:
                emit('error', {'error': 'No prompt provided'})
                return
            
            controller = controllers.get(model)
            if not controller:
                emit('error', {'error': f'Unknown model: {model}'})
                return
            
            # Start code generation
            emit('process_update', {
                'type': 'process',
                'message': f'Starting code generation for: {prompt[:50]}...'
            })
            
            emit('process_update', {
                'type': 'process',
                'message': 'Generating code...'
            })
            
            # Generate code
            if hasattr(controller, 'generate_code'):
                response = await controller.generate_code(prompt)
            else:
                response = await controller.process_message(f"Generate code for: {prompt}")
            
            # Extract code from response
            code_content = response.get('content', '')
            
            emit('process_update', {
                'type': 'process',
                'message': 'Code generated, processing files...'
            })
            
            # Create a file path for the generated code
            file_path = f"projects/generated/generated_code_{int(asyncio.get_event_loop().time())}.js"
            
            # Emit file creation updates
            emit('process_update', {
                'type': 'file',
                'message': f'Added file: {file_path}'
            })
            
            # Emit code update
            emit('process_update', {
                'type': 'code',
                'message': code_content,
                'path': file_path
            })
            
            emit('process_update', {
                'type': 'process',
                'message': 'Code generation completed'
            })
            
            # Emit the final response
            emit('code_generated', {
                'model': model,
                'code': code_content,
                'file_path': file_path
            })
            
        except Exception as e:
            logger.error(f"Error generating code: {str(e)}")
            emit('error', {'error': str(e)})
            emit('process_update', {
                'type': 'error',
                'message': f'Error generating code: {str(e)}'
            })