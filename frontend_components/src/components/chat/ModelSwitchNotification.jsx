import React from 'react';
import './ModelSwitchNotification.css';

/**
 * Model Switch Notification Component
 * 
 * Displays a notification when switching between AI models
 */
const ModelSwitchNotification = ({ model, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="model-switch-notification">
      <div className="notification-content">
        <span className="notification-icon">🔄</span>
        <span className="notification-text">Switching to {model.toUpperCase()} model...</span>
      </div>
    </div>
  );
};

export default ModelSwitchNotification;