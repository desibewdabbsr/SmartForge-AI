import React, { useState, useEffect } from 'react';
import './DragDropService.css';

/**
 * DragDropService Component
 * 
 * Enables drag and drop functionality for services between workspaces
 */
const DragDropService = ({ children, onDrop, serviceId, serviceIcon, serviceTitle }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle drag start
  const handleDragStart = (e) => {
    // Set data for the drag operation
    e.dataTransfer.setData('application/smartforge-service', JSON.stringify({
      serviceId,
      serviceIcon,
      serviceTitle
    }));
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'service-drag-image';
    dragImage.innerHTML = serviceIcon;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 15, 15);
    
    // Set dragging state
    setIsDragging(true);
    
    // Clean up drag image after drag operation
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <div 
      className={`draggable-service ${isDragging ? 'dragging' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  );
};

/**
 * DropTarget Component
 * 
 * Creates a drop target for draggable services
 */
export const DropTarget = ({ workspaceId, onServiceDrop, children }) => {
  const [isOver, setIsOver] = useState(false);
  
  // Handle drag over
  const handleDragOver = (e) => {
    // Allow drop
    e.preventDefault();
    
    // Check if the dragged item is a service
    if (e.dataTransfer.types.includes('application/smartforge-service')) {
      setIsOver(true);
    }
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    
    // Get the service data
    try {
      const serviceData = JSON.parse(e.dataTransfer.getData('application/smartforge-service'));
      
      // Call the onServiceDrop callback with the service data and target workspace
      if (serviceData && onServiceDrop) {
        onServiceDrop(serviceData.serviceId, workspaceId);
      }
    } catch (error) {
      console.error('Error parsing dropped service data:', error);
    }
  };
  
  return (
    <div 
      className={`droppable-workspace ${isOver ? 'drop-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default DragDropService;