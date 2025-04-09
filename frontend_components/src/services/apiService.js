/**
 * API Service
 * Handles communication with the backend API
 */
class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.socket = null;
  }

  /**
   * Initialize the socket connection
   */
  initSocket() {
    if (!this.socket && window.io) {
      this.socket = window.io('http://localhost:5000');
      
      this.socket.on('connect', () => {
        console.log('Socket connected');
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    
    return this.socket;
  }

  /**
   * Get available AI models
   * @returns {Promise<Array>} List of available models
   */
  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  /**
   * Process a message with an AI model
   * @param {string} message - The message to process
   * @param {string} model - The model to use (default: 'llama')
   * @returns {Promise<Object>} The response from the AI
   */
  async processMessage(message, model = 'llama') {
    try {
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, model }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Error processing message with ${model}:`, error);
      return { error: error.message };
    }
  }

  /**
   * Generate code with an AI model
   * @param {string} prompt - The code generation prompt
   * @param {string} model - The model to use (default: 'cody')
   * @returns {Promise<Object>} The generated code
   */
  async generateCode(prompt, model = 'cody') {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Error generating code with ${model}:`, error);
      return { error: error.message };
    }
  }

  /**
   * Generate code with socket.io for real-time updates
   * @param {string} prompt - The code generation prompt
   * @param {string} model - The model to use (default: 'cody')
   * @param {Function} onUpdate - Callback for process updates
   * @returns {Promise<Object>} The generated code
   */
  generateCodeWithUpdates(prompt, model = 'cody', onUpdate) {
    return new Promise((resolve, reject) => {
      const socket = this.initSocket();
      
      if (!socket) {
        reject(new Error('Socket not initialized'));
        return;
      }
      
      // Listen for process updates
      socket.on('process_update', (update) => {
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(update);
        }
      });
      
      // Listen for code generation completion
      socket.on('code_generated', (data) => {
        socket.off('process_update');
        socket.off('code_generated');
        socket.off('error');
        resolve(data);
      });
      
      // Listen for errors
      socket.on('error', (error) => {
        socket.off('process_update');
        socket.off('code_generated');
        socket.off('error');
        reject(error);
      });
      
      // Send code generation request
      socket.emit('generate_code', { prompt, model });
    });
  }

  /**
   * Get list of generated files
   * @returns {Promise<Array>} List of files
   */
  async getFiles() {
    try {
      const response = await fetch(`${this.baseUrl}/files`);
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  }

  /**
   * Get content of a specific file
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} File content
   */
  async getFile(filePath) {
    try {
      const response = await fetch(`${this.baseUrl}/file/${filePath}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching file ${filePath}:`, error);
      return { error: error.message };
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
