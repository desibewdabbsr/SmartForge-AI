import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import WorkspaceManager from '../workspace/WorkspaceManager';
import './Dashboard.css';

/**
 * Dashboard Page
 * 
 * Uses the DashboardLayout component with WorkspaceManager for service management
 */
const Dashboard = () => {
  // Get workspace content from WorkspaceManager
  const {
    serviceMenuContent,
    workspace1Content,
    workspace2Content,
    workspace3Content
  } = WorkspaceManager();

  return (
    <DashboardLayout
      serviceMenuContent={serviceMenuContent}
      workspace1Content={workspace1Content}
      workspace2Content={workspace2Content}
      workspace3Content={workspace3Content}
      notificationBarContent={<div className="notification-content">Ready</div>}
    />
  );
};

export default Dashboard;