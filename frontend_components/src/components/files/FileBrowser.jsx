import React, { useState, useEffect } from 'react';
import './FileBrowser.css';
import mockFileSystem from '../../data/mockFileSystem';

/**
 * FileBrowser Component
 * 
 * A file explorer similar to VS Code's Explorer panel
 * Shows the project structure for LocalMachine132
 */
const FileBrowser = ({ instanceId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [repositoryName, setRepositoryName] = useState('LocalMachine132');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'files'

  // Load the project structure
  useEffect(() => {
    // In a real implementation, this would fetch from the backend
    setTimeout(() => {
      // Log the mock data to verify content is present
      console.log('Loading mock file system:', mockFileSystem);
      
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

  // Toggle view mode between tree and files
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'tree' ? 'files' : 'tree');
  };

  // Toggle folder expansion
  const toggleFolder = (folderId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Toggle repository collapse/expand
  const toggleRepository = () => {
    setExpandedFolders(prev => ({
      ...prev,
      'repo-root': !prev['repo-root']
    }));
  };

  // Open file in workspace2
  const openFileInWorkspace = (fileId) => {
    // Find the file in our file structure
    const findFile = (files) => {
      for (const file of files) {
        if (file.id === fileId) return file;
        if (file.type === 'folder' && file.children) {
          const found = findFile(file.children);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(files);
    if (!file) {
      console.error('File not found:', fileId);
      return;
    }

    // Log the file to verify content is present
    console.log('Opening file:', file);
    console.log('File content:', file.content);
    console.log('Content type:', typeof file.content);
    console.log('Content length:', file.content ? file.content.length : 0);

    // Create a unique ID for this file
    const fileTabId = `file-${file.id}`;

    // Create the file object to be passed to the editor
    const fileData = {
      id: fileTabId,
      serviceId: 'file-editor',
      title: file.name,
      data: {
        fileId: file.id,
        fileName: file.name,
        language: file.language,
        content: file.content || '' // Ensure content is never undefined
      }
    };

    // Log the file data to verify it's structured correctly
    console.log('File data to be dispatched:', fileData);

    // Dispatch a custom event that WorkspaceManager can listen to
    const openFileEvent = new CustomEvent('LocalMachine132:openFile', {
      detail: {
        targetWorkspace: 'workspace2',
        file: fileData
      }
    });

    window.dispatchEvent(openFileEvent);
  };

  // Render a file or folder item
  const renderItem = (item, depth = 0, isLast = false) => {
    const indent = depth * 16; // 16px indentation per level
    
    if (item.type === 'folder') {
      const isExpanded = expandedFolders[item.id];
      const hasChildren = item.children && item.children.length > 0;
      
      return (
        <div key={item.id} className="tree-item-container">
          <div 
            className={`file-item folder ${isExpanded ? 'expanded' : ''}`}
            style={{ paddingLeft: `${indent}px` }}
            onClick={(e) => toggleFolder(item.id, e)}
          >
            <span className="folder-toggle">{hasChildren ? (isExpanded ? '▼' : '►') : ''}</span>
            <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
            <span className="file-name">{item.name}</span>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="folder-children">
              {item.children.map((child, index) => 
                renderItem(
                  child, 
                  depth + 1, 
                  index === item.children.length - 1
                )
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={item.id} className="tree-item-container">
          <div 
            className="file-item"
            style={{ paddingLeft: `${indent}px` }}
            onClick={() => openFileInWorkspace(item.id)}
          >
            <span className="file-icon">📄</span>
            <span className="file-name">{item.name}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <div className="explorer-title">EXPLORER</div>
        <div className="explorer-controls">
          <button 
            className="explorer-control-button" 
            onClick={toggleViewMode}
            title={viewMode === 'tree' ? 'Switch to Files view' : 'Switch to Tree view'}
          >
            {viewMode === 'tree' ? '🌲' : '📁'}
          </button>
          <button className="explorer-control-button" title="New File">📝</button>
          <button className="explorer-control-button" title="New Folder">📁+</button>
          <button className="explorer-control-button" title="Refresh">🔄</button>
          <button className="explorer-control-button" title="Collapse All">⬆️</button>
        </div>
      </div>
      
      <div className="explorer-content">
        {isLoading ? (
          <div className="loading-message">Loading files...</div>
        ) : (
          <div className="repository-root">
            <div 
              className={`repository-header ${expandedFolders['repo-root'] ? 'expanded' : ''}`}
              onClick={toggleRepository}
            >
              <span className="collapse-icon">{expandedFolders['repo-root'] ? '▼' : '►'}</span>
              <span className="repository-name">{repositoryName}</span>
            </div>
            
            {expandedFolders['repo-root'] && (
              <div className="repository-files">
                {files.map((item, index) => 
                  renderItem(item, 0, index === files.length - 1)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowser;