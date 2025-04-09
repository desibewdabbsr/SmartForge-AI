import React, { useState, useEffect } from 'react';
import './DashboardLayout.css';
import DragHandle from './DragHandle';

/**
 * DashboardLayout Component
 * 
 * Grid-based layout with the following structure:
 * - Complete border around the entire layout
 * - Left service menu (3% width) - FIXED, not resizable
 * - Main workspace 1 (37% width)
 * - Right side split into two sections (60% width total):
 *   - Top workspace (60% height)
 *   - Bottom workspace (38% height)
 * - Bottom notification bar (2% height)
 * 
 * Features:
 * - Resizable panels with drag handles (except service menu)
 */
const DashboardLayout = ({ 
  serviceMenuContent, 
  workspace1Content, 
  workspace2Content, 
  workspace3Content,
  notificationBarContent 
}) => {
  // State for panel dimensions
  const [verticalDivider1] = useState(3); // Fixed at 3%
  const [verticalDivider2, setVerticalDivider2] = useState(40);
  const [horizontalDivider, setHorizontalDivider] = useState(60);
  
  // Update horizontal divider width when vertical divider changes
  useEffect(() => {
    // This ensures the horizontal divider always spans from verticalDivider2 to 100%
    const horizontalDividerElement = document.querySelector('.h-divider');
    if (horizontalDividerElement) {
      horizontalDividerElement.style.left = `${verticalDivider2}%`;
      horizontalDividerElement.style.width = `${100 - verticalDivider2}%`;
    }
    
    // Update the horizontal drag handle as well
    const horizontalDragHandle = document.querySelector('.drag-handle.horizontal');
    if (horizontalDragHandle) {
      horizontalDragHandle.style.left = `${verticalDivider2}%`;
      horizontalDragHandle.style.width = `${100 - verticalDivider2}%`;
    }
  }, [verticalDivider2]);
  
  return (
    <div className="dashboard-container">
      {/* Border element */}
      <div className="edge-border"></div>
      
      {/* Vertical dividers */}
      <div className="v-divider-1" style={{ left: `${verticalDivider1}%` }}></div>
      <div className="v-divider-2" style={{ left: `${verticalDivider2}%` }}></div>
      
      {/* Horizontal divider in right section */}
      <div className="h-divider" style={{ 
        top: `${horizontalDivider}%`, 
        left: `${verticalDivider2}%`,
        width: `${100 - verticalDivider2}%`
      }}></div>
      
      {/* Bottom divider */}
      <div className="bottom-divider"></div>
      
      {/* Drag handles - Note: No drag handle for the first vertical divider */}
      <DragHandle 
        type="vertical"
        initialPosition={verticalDivider2}
        onPositionChange={setVerticalDivider2}
        minPosition={15} // Ensure it doesn't get too close to the service menu
        maxPosition={85} // Ensure it doesn't get too close to the right edge
      />
      
      <DragHandle 
        type="horizontal"
        initialPosition={horizontalDivider}
        onPositionChange={setHorizontalDivider}
        minPosition={20} // Ensure top panel isn't too small
        maxPosition={80} // Ensure bottom panel isn't too small
      />
      
      {/* Main content areas */}
      <div className="service-menu" style={{ width: `${verticalDivider1}%` }}>
        {serviceMenuContent}
      </div>
      
      <div className="workspace-1" style={{ 
        left: `${verticalDivider1}%`, 
        width: `${verticalDivider2 - verticalDivider1}%` 
      }}>
        {workspace1Content}
      </div>
      
      <div className="workspace-2" style={{ 
        left: `${verticalDivider2}%`, 
        width: `${100 - verticalDivider2}%`,
        height: `${horizontalDivider}%`
      }}>
        {workspace2Content}
      </div>
      
      <div className="workspace-3" style={{ 
        left: `${verticalDivider2}%`, 
        top: `${horizontalDivider}%`,
        width: `${100 - verticalDivider2}%`,
        height: `${98 - horizontalDivider}%`
      }}>
        {workspace3Content}
      </div>
      
      {/* Notification bar at the bottom */}
      <div className="notification-bar">
        {notificationBarContent}
      </div>
    </div>
  );
};

export default DashboardLayout;