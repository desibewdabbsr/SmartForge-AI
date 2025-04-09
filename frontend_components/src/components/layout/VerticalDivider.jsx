import React, { useState, useEffect, useRef } from 'react';
import './VerticalDivider.css';

const VerticalDivider = ({ initialPosition = 150, onPositionChange, minPosition = 100, maxPosition = 300 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef(null);
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !dividerRef.current) return;
      
      // Get the parent container's bounds
      const parentRect = dividerRef.current.parentElement.getBoundingClientRect();
      
      // Calculate the position relative to the parent's right edge
      const positionFromRight = parentRect.right - e.clientX;
      
      // Ensure position stays within bounds
      let newPosition = positionFromRight;
      if (newPosition < minPosition) newPosition = minPosition;
      if (newPosition > maxPosition) newPosition = maxPosition;
      
      // Update the position
      onPositionChange(newPosition);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minPosition, maxPosition, onPositionChange]);
  
  return (
    <div 
      ref={dividerRef}
      className={`vertical-divider ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      style={{ right: `${initialPosition}px` }}
    >
      <div className="divider-handle"></div>
    </div>
  );
};

export default VerticalDivider;