/**
 * Mock File System Data
 * 
 * This file contains mock data for the file browser component.
 * In a production environment, this would be replaced with actual filesystem data.
 */

const mockFileSystem = [
  {
    id: 'folder-projects',
    name: 'Projects',
    type: 'folder',
    children: [
      {
        id: 'folder-localmachine132',
        name: 'LocalMachine132',
        type: 'folder',
        children: [
          {
            id: 'folder-src',
            name: 'src',
            type: 'folder',
            children: [
              { 
                id: 'file-index', 
                name: 'index.js', 
                type: 'file', 
                language: 'javascript', 
                content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);`
              },
              { 
                id: 'file-app', 
                name: 'App.jsx', 
                type: 'file', 
                language: 'javascript', 
                content: `import React from 'react';
import Dashboard from './pages/Dashboard';
import './pages/Dashboard.css';

function App() {
  return <Dashboard />;
}

export default App;`
              },
              {
                id: 'folder-components',
                name: 'components',
                type: 'folder',
                children: [
                  {
                    id: 'folder-layout',
                    name: 'layout',
                    type: 'folder',
                    children: [
                      { 
                        id: 'file-dashboardlayout', 
                        name: 'DashboardLayout.jsx', 
                        type: 'file', 
                        language: 'javascript',
                        content: `import React from 'react';
import './DashboardLayout.css';

/**
 * DashboardLayout Component
 * 
 * Implements a grid-based layout system with three main panels:
 * - Left panel (navigation/services sidebar): 15% width
 * - Mid panel (main content area): 45% width
 * - Right panel (split into top and bottom sections): 40% width
 */
const DashboardLayout = ({ children, leftPanelContent, midPanelContent, rightTopContent, rightBottomContent }) => {
  return (
    <div className="dashboard-container">
      {/* Border and divider elements */}
      <div className="edge-border"></div>
      <div className="v-divider-1"></div>
      <div className="v-divider-2"></div>
      <div className="h-divider"></div>
      <div className="right-panel-divider"></div>
      
      {/* Main content panels */}
      <div className="left-panel">
        {leftPanelContent}
      </div>
      
      <div className="mid-panel">
        {midPanelContent}
      </div>
      
      <div className="right-panel">
        <div className="right-top">
          {rightTopContent}
        </div>
        <div className="right-bottom">
          {rightBottomContent}
        </div>
      </div>
      
      {/* Status bar at the bottom */}
      <div className="status-bar">
        <span>Ready</span>
        <span className="status-indicator"></span>
      </div>
      
      {/* Additional children will be rendered directly in the container */}
      {children}
    </div>
  );
};

export default DashboardLayout;`
                      },
                      { 
                        id: 'file-dashboardlayout-css', 
                        name: 'DashboardLayout.css', 
                        type: 'file', 
                        language: 'css',
                        content: `/**
 * Dashboard Layout Styles
 * 
 * Grid-based layout with Vedic-inspired color scheme
 */

/* Main container */
.dashboard-container {
  display: grid;
  width: 100%;
  height: 100vh;
  background-color: #1B1B1B; /* Deep Charcoal background */
  color: white;
  font-family: 'Manrope', sans-serif;
  
  /* Grid template with precise measurements */
  grid-template-columns: 15% 45% 40%; /* Left panel, Mid panel, Right panel */
  grid-template-rows: calc(100vh - 30px) 30px; /* Main content, Status bar */
  grid-template-areas:
    "left-panel mid-panel right-panel"
    "status-bar status-bar status-bar";
  position: relative;
}

/* Edge border - surrounds the entire layout */
.edge-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #FFD700; /* Gold border */
  pointer-events: none;
  z-index: 10;
}`
                      },
                    ]
                  },
                  {
                    id: 'folder-files',
                    name: 'files',
                    type: 'folder',
                    children: [
                      { 
                        id: 'file-filebrowser', 
                        name: 'FileBrowser.jsx', 
                        type: 'file', 
                        language: 'javascript',
                        content: `import React, { useState, useEffect } from 'react';
import './FileBrowser.css';
import mockFileSystem from '../../data/mockFileSystem';

/**
 * FileBrowser Component
 * 
 * A file explorer similar to VS Code's Explorer panel
 */
const FileBrowser = ({ instanceId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [repositoryName, setRepositoryName] = useState('LocalMachine132');

  // Load the project structure
  useEffect(() => {
    // In a real implementation, this would fetch from the backend
    setTimeout(() => {
      setFiles(mockFileSystem);
      setIsLoading(false);
      // Auto-expand the repository root and Projects folder
      setExpandedFolders({ 
        'repo-root': true,
        'folder-projects': true,
        'folder-localmachine132': true
      });
    }, 500);
  }, []);

  // Rest of the component...
}`
                      },
                      { 
                        id: 'file-filebrowser-css', 
                        name: 'FileBrowser.css', 
                        type: 'file', 
                        language: 'css',
                        content: `/**
 * File Browser Component Styles
 */

.file-explorer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #1B1B1B;
  color: #FFD700;
  font-family: 'Manrope', sans-serif;
  border: 1px solid #FFD700;
}

.explorer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  background-color: #444444;
  border-bottom: 1px solid #FFD700;
  height: 28px;
}`
                      },
                    ]
                  }
                ]
              },
              {
                id: 'folder-pages',
                name: 'pages',
                type: 'folder',
                children: [
                  { 
                    id: 'file-dashboard', 
                    name: 'Dashboard.jsx', 
                    type: 'file', 
                    language: 'javascript',
                    content: `import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ChatPanel from '../components/chat/ChatPanel';
import Terminal from '../components/terminal/Terminal';
import './Dashboard.css';

/**
 * Dashboard Page
 * 
 * Uses the DashboardLayout component with service icons
 */
const Dashboard = () => {
  // Track which services are active
  const [activeServices, setActiveServices] = useState({
    chat: true, // Chat is active by default
    metrics: false,
    explorer: false,
    settings: false,
    terminal: true // Terminal is active by default
  });

  // Toggle service active state
  const toggleService = (service) => {
    setActiveServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  // Service menu content with icons
  const serviceMenuContent = (
    <div className="service-icons">
      <button 
        className={\`icon-button \${activeServices.chat ? 'active' : ''}\`}
        onClick={() => toggleService('chat')}
        title="Chat AI"
      >
        💬
      </button>
      <button 
        className={\`icon-button \${activeServices.metrics ? 'active' : ''}\`}
        onClick={() => toggleService('metrics')}
        title="Metrics"
      >
        📊
      </button>
      <button 
        className={\`icon-button \${activeServices.explorer ? 'active' : ''}\`}
        onClick={() => toggleService('explorer')}
        title="Explorer"
      >
        🔍
      </button>
      <button 
        className={\`icon-button \${activeServices.terminal ? 'active' : ''}\`}
        onClick={() => toggleService('terminal')}
        title="Terminal"
      >
        💻
      </button>
      <button 
        className={\`icon-button \${activeServices.settings ? 'active' : ''}\`}
        onClick={() => toggleService('settings')}
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );

  return (
    <DashboardLayout
      serviceMenuContent={serviceMenuContent}
      workspace1Content={<div>{activeServices.chat && <ChatPanel />}</div>}
      workspace2Content={<div></div>}
      workspace3Content={<div>{activeServices.terminal && <Terminal />}</div>}
      notificationBarContent={<div className="notification-content">Ready</div>}
    />
  );
};

export default Dashboard;`
                  },
                  { 
                    id: 'file-dashboard-css', 
                    name: 'Dashboard.css', 
                    type: 'file', 
                    language: 'css',
                    content: `/**
 * Dashboard Page Styles
 */

.service-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 20px;
  height: 100%;
}

.icon-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #444444;
  color: #FFD700; /* Gold text */
  border: 1px solid #FFD700; /* Gold border */
  border-radius: 0; /* Square corners to match our design */
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background-color: #2E2E2E;
  box-shadow: 0 0 6px #FFD700; /* Gold glow */
}

.icon-button.active {
  background-color: #FF6F00; /* Saffron */
  color: white;
}`
                  },
                ]
              }
            ]
          },
          { 
            id: 'file-package', 
            name: 'package.json', 
            type: 'file', 
            language: 'json',
            content: `{
  "name": "localmachine132",
  "version": "1.0.0",
  "description": "A development environment for smart contracts and web3 applications",
  "main": "index.js",
  "scripts": {
    "start": "webpack serve",
    "build": "webpack",
    "test": "jest"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@babel/core": "^7.26.10",
    "@babel/preset-env": "^7.26.9",
    "@babel/preset-react": "^7.26.3",
    "babel-loader": "^10.0.0",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.3",
    "style-loader": "^4.0.0",
    "webpack": "^5.98.0",
    "webpack-cli": "^6.0.1",
    "webpack-dev-server": "^5.2.1"
  }
}`
          },
          { 
            id: 'file-readme', 
            name: 'README.md', 
            type: 'file', 
            language: 'markdown',
            content: `# LocalMachine132

## Overview
LocalMachine132 is a development environment for smart contracts and web3 applications. It provides a unified interface for coding, testing, and deploying blockchain applications.

## Features
- Integrated code editor with syntax highlighting
- File browser for project management
- Terminal for command execution
- Support for multiple blockchain networks
- Real-time metrics and monitoring

## Getting Started
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the application: \`npm start\`

## Documentation
For more information, see the [documentation](https://docs.localmachine132.com).

## License
MIT`
          },
        ]
      }
    ]
  }
];

export default mockFileSystem;