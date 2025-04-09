import appConfig from '../config/appConfig';

/**
 * Workspace Service
 * Manages workspace state and persistence
 */
const workspaceService = {
/**
 * Initialize default workspace state
 */
getDefaultState() {
  return {
    workspace1: {
      tabs: [],
      activeTabId: null
    },
    workspace2: {
      tabs: [],
      activeTabId: null
    },
    workspace3: {
      tabs: [{ id: 'terminal-1', serviceId: 'terminal', instanceId: 1 }],
      activeTabId: 'terminal-1'
    }
  };
},


  /**
   * Save workspace state to storage
   * @param {Object} state - Current workspace state
   */
  saveState(state) {
    try {
      // Save to localStorage
      localStorage.setItem(`${appConfig.appName}-workspaces`, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Failed to save workspace state:', error);
      return false;
    }
  },

  /**
   * Load workspace state from storage
   */
  loadState() {
    try {
      const savedState = localStorage.getItem(`${appConfig.appName}-workspaces`);
      if (savedState) {
        return JSON.parse(savedState);
      }
      return this.getDefaultState();
    } catch (error) {
      console.error('Failed to load workspace state:', error);
      return this.getDefaultState();
    }
  }
};

export default workspaceService;