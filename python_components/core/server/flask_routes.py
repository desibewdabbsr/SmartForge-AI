import logging
from flask import request, jsonify

logger = logging.getLogger(__name__)

def register_routes(app, controllers):
    """Register all Flask routes"""
    
    @app.route('/api/models', methods=['GET'])
    def get_models():
        """Get available AI models"""
        return jsonify({
            'models': list(controllers.keys())
        })
    
    @app.route('/api/files', methods=['GET'])
    def get_files():
        """Get list of generated files"""
        # This would typically interact with a file service
        # For now, return a placeholder
        return jsonify({
            'files': []
        })
    
    @app.route('/api/file/<path:file_path>', methods=['GET'])
    def get_file(file_path):
        """Get content of a specific file"""
        # This would typically interact with a file service
        # For now, return a placeholder
        return jsonify({
            'file_path': file_path,
            'content': f"// Content of {file_path}"
        })