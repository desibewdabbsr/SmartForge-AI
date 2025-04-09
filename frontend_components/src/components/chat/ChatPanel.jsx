import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';
import apiService from '../../services/apiService';
import AIResponseFormatter from './AIResponseFormatter';
import ModelSwitchNotification from './ModelSwitchNotification';

/**
 * ChatPanel Component
 * 
 * A chat interface with:
 * - Auto-expanding prompt box
 * - Model selection button with dropdown
 * - Auto-Pilot toggle with flight icon
 * - AI Voice toggle
 * - Send/Process/Stop button
 * - Positioned at bottom with 2% space from notification bar
 */
const ChatPanel = () => {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('A'); // Default: Auto
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [responses, setResponses] = useState([]);
  const [showModelSwitch, setShowModelSwitch] = useState(false);
  const [currentModelName, setCurrentModelName] = useState('auto');
  const textareaRef = useRef(null);
  const responsesEndRef = useRef(null);

  // Models available for selection
  const models = [
    { id: 'A', name: 'Auto', apiName: 'auto' },
    { id: 'C', name: 'Cody', apiName: 'cody' },
    { id: 'G', name: 'ChatGPT', apiName: 'gpt' },
    { id: 'M', name: 'Mistral', apiName: 'mistral' },
    { id: 'D', name: 'Deepseek', apiName: 'deepseek' },
    { id: 'H', name: 'Cohere', apiName: 'cohere' }
  ];

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to calculate proper scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.4; // 40% of viewport height
      
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        // Only show scrollbar within the textarea itself
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
      
      // Ensure parent containers don't scroll
      const chatPanel = textareaRef.current.closest('.chat-panel');
      if (chatPanel) {
        chatPanel.style.overflowY = 'visible';
      }
      
      // Ensure workspace doesn't scroll
      const workspace = document.querySelector('.workspace-content');
      if (workspace) {
        workspace.style.overflowY = 'hidden';
      }
    }
  }, [message]);

  // Scroll to bottom when new responses are added
  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [responses]);

  // Initialize socket connection
  useEffect(() => {
    apiService.initSocket();
  }, []);

  // Handle message change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Toggle model dropdown
  const toggleModelDropdown = () => {
    setShowModelDropdown(!showModelDropdown);
  };

  // Select a model
  const selectModel = (modelId) => {
    const previousModel = models.find(model => model.id === selectedModel);
    const newModel = models.find(model => model.id === modelId);
    
    setSelectedModel(modelId);
    setShowModelDropdown(false);
    
    if (previousModel.apiName !== newModel.apiName) {
      setCurrentModelName(newModel.apiName);
      setShowModelSwitch(true);
      
      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowModelSwitch(false);
      }, 2000);
    }
  };

  // Toggle auto-pilot mode
  const toggleAutoPilot = () => {
    setIsAutoPilot(!isAutoPilot);
  };

  // Toggle voice mode
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  // Get the API model name from the selected model ID
  const getApiModelName = () => {
    const model = models.find(model => model.id === selectedModel);
    return model ? model.apiName : 'auto';
  };

  // Handle send/process/stop
  const handleSendOrStop = async () => {
    if (isProcessing) {
      // Stop processing - would need to implement cancellation logic
      setIsProcessing(false);
    } else if (message.trim()) {
      // Start processing
      setIsProcessing(true);
      
      // Add user message to responses
      const userMessage = {
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setResponses(prev => [...prev, userMessage]);
      
      try {
        // Get the API model name
        const modelName = getApiModelName();
        
        // Process the message with the selected model
        const response = await apiService.processMessage(message, modelName);
        
        // Add AI response to responses
        const aiResponse = {
          type: 'ai',
          content: response.response || response.error || 'No response received',
          model: modelName,
          timestamp: new Date().toISOString()
        };
        
        setResponses(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Error processing message:', error);
        
        // Add error response
        const errorResponse = {
          type: 'ai',
          content: `Error: ${error.message}`,
          model: getApiModelName(),
          timestamp: new Date().toISOString()
        };
        
        setResponses(prev => [...prev, errorResponse]);
      } finally {
        setIsProcessing(false);
        setMessage('');
      }
    }
  };

  return (
    <div className="chat-container">
      {/* Chat messages area */}
      <div className="chat-messages">
        {responses.map((response, index) => (
          <div key={index} className={`message ${response.type}`}>
            {response.type === 'user' ? (
              <div className="user-message">{response.content}</div>
            ) : (
              <AIResponseFormatter response={response.content} model={response.model} />
            )}
          </div>
        ))}
        <div ref={responsesEndRef} />
      </div>
      
      {/* Model switch notification */}
      <ModelSwitchNotification 
        model={currentModelName} 
        isVisible={showModelSwitch} 
      />
      
      <div className="chat-panel">
        {/* Left side controls */}
        <div className="chat-controls left-controls">
          {/* Model selection button */}
          <div className="model-selector">
            <button 
              className="control-button model-button" 
              onClick={toggleModelDropdown}
              title={models.find(model => model.id === selectedModel).name}
            >
              {selectedModel}
            </button>
            
            {showModelDropdown && (
              <div className="model-dropdown">
                {models.map(model => (
                  <div 
                    key={model.id} 
                    className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
                    onClick={() => selectModel(model.id)}
                  >
                    {model.id}: {model.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Auto-pilot toggle */}
          <button 
            className={`control-button autopilot-button ${isAutoPilot ? 'active' : ''}`}
            onClick={toggleAutoPilot}
            title={isAutoPilot ? 'Disable Auto-Pilot' : 'Enable Auto-Pilot'}
          >
            ✈️
          </button>
        </div>
        
        {/* Chat input area */}
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={message}
          onChange={handleMessageChange}
          placeholder="Ask me anything..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendOrStop();
            }
          }}
        />
        
        {/* Right side controls */}
        <div className="chat-controls right-controls">
          {/* Voice toggle */}
          <button 
            className={`control-button voice-button ${isVoiceEnabled ? 'active' : ''}`}
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Disable AI Voice' : 'Enable AI Voice'}
          >
            🔊
          </button>
          
          {/* Send/Stop button */}
          <button 
            className={`control-button send-button ${isProcessing ? 'processing' : ''}`}
            onClick={handleSendOrStop}
            title={isProcessing ? 'Stop' : 'Send'}
          >
            {isProcessing ? '■' : '▶'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;