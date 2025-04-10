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
    if (!this.socket && typeof io !== 'undefined') {
      console.log('Initializing socket connection...');
      this.socket = io('http://localhost:5000');
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        // Emit a global event that other components can listen for
        document.dispatchEvent(new CustomEvent('socket-connected'));
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        // Emit a global event that other components can listen for
        document.dispatchEvent(new CustomEvent('socket-disconnected'));
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listen for process updates and broadcast them as custom events
      this.socket.on('process_update', (update) => {
        console.log('Process update received:', update);
        // Broadcast the update as a custom event
        document.dispatchEvent(new CustomEvent('process-update', { detail: update }));
      });
    } else if (typeof io === 'undefined') {
      console.error('Socket.io client not available. Make sure it is included in your HTML.');
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
   * @param {string} model - The model to use (default: 'auto')
   * @returns {Promise<Object>} The response from the AI
   */
  async processMessage(message, model = 'auto') {
    try {
      console.log(`Processing message with model: ${model}`);
      
      // Initialize socket if not already done
      this.initSocket();
      
      // Emit a process update event directly
      if (this.socket && this.socket.connected) {
        this.socket.emit('process_update', {
          type: 'process',
          message: `Processing query with ${model}: ${message.substring(0, 50)}...`
        });
      } else {
        // Broadcast a custom event if socket is not available
        document.dispatchEvent(new CustomEvent('process-update', { 
          detail: {
            type: 'process',
            message: `Processing query with ${model}: ${message.substring(0, 50)}...`
          }
        }));
      }
      
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, model }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response received:', data);
      
      // Emit a process completion event
      if (this.socket && this.socket.connected) {
        this.socket.emit('process_update', {
          type: 'process',
          message: `Query processed successfully with ${model}`
        });
      } else {
        // Broadcast a custom event if socket is not available
        document.dispatchEvent(new CustomEvent('process-update', { 
          detail: {
            type: 'process',
            message: `Query processed successfully with ${model}`
          }
        }));
      }
      
      return {
        content: data.content || data.message || JSON.stringify(data),
        model: data.model || model
      };
    } catch (error) {
      console.error(`Error processing message with ${model}:`, error);
      
      // Emit an error event
      if (this.socket && this.socket.connected) {
        this.socket.emit('process_update', {
          type: 'error',
          message: `Error processing message: ${error.message}`
        });
      } else {
        // Broadcast a custom event if socket is not available
        document.dispatchEvent(new CustomEvent('process-update', { 
          detail: {
            type: 'error',
            message: `Error processing message: ${error.message}`
          }
        }));
      }
      
      return { error: error.message };
    }
  }

  /**
   * Generate code with an AI model
   * @param {string} prompt - The code generation prompt
   * @param {string} model - The model to use (default: 'auto')
   * @returns {Promise<Object>} The generated code
   */
  async generateCode(prompt, model = 'auto') {
    try {
      // Initialize socket if not already done
      this.initSocket();
      
      // Emit process updates
      if (this.socket && this.socket.connected) {
        this.socket.emit('process_update', {
          type: 'process',
          message: `Starting code generation for: ${prompt.substring(0, 50)}...`
        });
        
        this.socket.emit('process_update', {
          type: 'process',
          message: 'Generating code...'
        });
      } else {
        // Broadcast custom events if socket is not available
        document.dispatchEvent(new CustomEvent('process-update', { 
          detail: {
            type: 'process',
            message: `Starting code generation for: ${prompt.substring(0, 50)}...`
          }
        }));
        
        document.dispatchEvent(new CustomEvent('process-update', { 
          detail: {
            type: 'process',
            message: 'Generating code...'
          }
        }));
      }
      
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Emit completion update
      if (this.socket && this.socket.connected) {
        this.socket.emit('process_update', {
          type: 'process',
          message: 'Code generation completed'
        });
      } else {
        // Broadcast a custom event if socket is not available
        document.dispatchEvent(new CustomEvent('process-update', { 
          detail: {
            type: 'process',
            message: 'Code generation completed'
          }
        }));
      }
      
      return data;
    } catch (error) {
      console.error(`Error generating code with ${model}:`, error);
      
      // Emit an error event
      if (this.socket && this.socket.connected) {
        this.socket.emit('process_update', {
          type: 'error',
          message: `Error generating code: ${error.message}`
        });
      } else {
        // Broadcast a custom event if socket is not available
        document.dispatchEvent(new CustomEvent('process-update', { 
          detail: {
            type: 'error',
            message: `Error generating code: ${error.message}`
          }
        }));
      }
      
      return { error: error.message };
    }
  }

  /**
   * Generate code with socket.io for real-time updates
   * @param {string} prompt - The code generation prompt
   * @param {string} model - The model to use (default: 'auto')
   * @param {Function} onUpdate - Callback for process updates
   * @returns {Promise<Object>} The generated code
   */
  generateCodeWithUpdates(prompt, model = 'auto', onUpdate) {
    return new Promise((resolve, reject) => {
      const socket = this.initSocket();
      
      if (!socket) {
        // Fall back to HTTP API if socket is not available
        this.generateCode(prompt, model)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // Listen for process updates
      const processUpdateHandler = (update) => {
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(update);
        }
      };
      
      socket.on('process_update', processUpdateHandler);
      
      // Listen for code generation completion
      socket.on('code_generated', (data) => {
        socket.off('process_update', processUpdateHandler);
        socket.off('code_generated');
        socket.off('error');
        resolve(data);
      });
      
      // Listen for errors
      socket.on('error', (error) => {
        socket.off('process_update', processUpdateHandler);
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