import React from 'react';
import './AIResponseFormatter.css';

/**
 * AI Response Formatter Component
 * 
 * Formats AI responses with model information and styling
 */
const AIResponseFormatter = ({ response, model }) => {
  // Format the model name for display
  const getModelDisplay = (modelName) => {
    if (!modelName) return 'AI';
    
    // Handle AUTO mode specially
    if (modelName.toLowerCase() === 'auto') {
      return 'AUTO';
    }
    
    return modelName.toUpperCase();
  };
  
  // Add emoji based on model
  const getModelEmoji = (modelName) => {
    if (!modelName) return '🤖';
    
    const model = modelName.toLowerCase();
    if (model === 'auto') return '🧠';
    if (model === 'cody') return '👨‍💻';
    if (model === 'mistral') return '🌪️';
    if (model === 'deepseek') return '🔍';
    if (model === 'cohere') return '🧩';
    if (model === 'llama') return '🦙';
    
    return '🤖';
  };
  
  // Format the response content
  const formatContent = (content) => {
    if (!content) return '';
    
    // Split by newlines to handle paragraphs
    const paragraphs = content.split('\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return <br key={index} />;
      
      // Check if this is a list item
      if (paragraph.trim().match(/^\d+\.\s/)) {
        return <div key={index} className="list-item">{paragraph}</div>;
      }
      
      return <p key={index}>{paragraph}</p>;
    });
  };
  
  return (
    <div className="ai-response">
      <div className="response-header">
        <div className="model-indicator">
          <span className="model-emoji">{getModelEmoji(model)}</span>
          <span className="model-name">AI ({getModelDisplay(model)})</span>
        </div>
      </div>
      
      <div className="response-content">
        {formatContent(response)}
      </div>
    </div>
  );
};

export default AIResponseFormatter;