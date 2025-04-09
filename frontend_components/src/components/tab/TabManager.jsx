import React from 'react';
import './TabManager.css';

/**
 * TabManager Component
 * 
 * Manages tabs for services in a workspace
 */
const TabManager = ({ 
  tabs, 
  activeTabId, 
  onTabSelect, 
  onTabClose,
  workspaceId,
  orientation = 'horizontal' // Add orientation prop with default 'horizontal'
}) => {
  // Don't render anything if there are no tabs
  if (tabs.length === 0) {
    return null;
  }
  
  return (
    <div className={`tab-manager ${orientation}`}>
      <div className={`tabs-container ${orientation}`}>
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`workspace-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            <button 
              className="tab-close-button" 
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabManager;