import React, { useState, useEffect, useCallback } from 'react';
import './DragHandle.css';

/**
 * DragHandle Component
 * 
 * Provides resizable handles for layout dividers
 * 
 * @param {string} type - 'vertical' or 'horizontal'
 * @param {number} initialPosition - Initial position in percentage
 * @param {function} onPositionChange - Callback when position changes
 * @param {number} minPosition - Minimum allowed position
 * @param {number} maxPosition - Maximum allowed position
 */
const DragHandle = ({ 
  type, 
  initialPosition, 
  onPositionChange,
  minPosition = 10,
  maxPosition = 90
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle mouse move during dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    let newPosition;
    
    if (type === 'vertical') {
      newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      newPosition = ((e.clientY - rect.top) / rect.height) * 100;
    }
    
    // Constrain position within min and max
    newPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));
    
    setPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  }, [isDragging, type, minPosition, maxPosition, onPositionChange]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate handle position and style
  const handleStyle = {
    left: type === 'vertical' ? `${position}%` : undefined,
    top: type === 'horizontal' ? `${position}%` : undefined
  };

  return (
    <div 
      className={`drag-handle ${type} ${isDragging ? 'dragging' : ''}`}
      style={handleStyle}
      onMouseDown={handleMouseDown}
    />
  );
};

export default DragHandle;