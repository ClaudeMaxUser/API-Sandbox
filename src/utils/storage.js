// Local storage utilities for persisting app state

const STORAGE_KEYS = {
  HISTORY: 'api_sandbox_history',
  ENVIRONMENTS: 'api_sandbox_environments',
  ACTIVE_ENV: 'api_sandbox_active_env',
  COLLECTIONS: 'api_sandbox_collections',
  OPEN_TABS: 'api_sandbox_tabs',
  SETTINGS: 'api_sandbox_settings',
};

// Generic storage helpers
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
};

// History management
export const getHistory = () => getItem(STORAGE_KEYS.HISTORY, []);

export const addToHistory = (request, response) => {
  const history = getHistory();
  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers,
      params: request.params,
      body: request.body,
      bodyType: request.bodyType,
      auth: request.auth,
    },
    response: response ? {
      status: response.status,
      statusText: response.statusText,
      time: response.time,
      size: response.size,
    } : null,
  };
  
  // Keep last 100 entries
  const newHistory = [entry, ...history].slice(0, 100);
  setItem(STORAGE_KEYS.HISTORY, newHistory);
  return entry;
};

export const clearHistory = () => setItem(STORAGE_KEYS.HISTORY, []);

export const deleteHistoryItem = (id) => {
  const history = getHistory();
  setItem(STORAGE_KEYS.HISTORY, history.filter(h => h.id !== id));
};

// Environment management
export const getEnvironments = () => getItem(STORAGE_KEYS.ENVIRONMENTS, [
  {
    id: 'default',
    name: 'Default',
    variables: [
      { key: 'baseUrl', value: 'https://api.example.com', secret: false },
      { key: 'token', value: '', secret: true },
    ],
  },
]);

export const saveEnvironments = (environments) => {
  setItem(STORAGE_KEYS.ENVIRONMENTS, environments);
};

export const getActiveEnvironment = () => getItem(STORAGE_KEYS.ACTIVE_ENV, 'default');

export const setActiveEnvironment = (envId) => {
  setItem(STORAGE_KEYS.ACTIVE_ENV, envId);
};

// Collections management
export const getCollections = () => getItem(STORAGE_KEYS.COLLECTIONS, []);

export const saveCollections = (collections) => {
  setItem(STORAGE_KEYS.COLLECTIONS, collections);
};

export const addCollection = (collection) => {
  const collections = getCollections();
  const newCollection = {
    id: Date.now().toString(),
    name: collection.name || 'New Collection',
    description: collection.description || '',
    folders: [],
    requests: [],
    createdAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.COLLECTIONS, [...collections, newCollection]);
  return newCollection;
};

export const deleteCollection = (id) => {
  const collections = getCollections();
  setItem(STORAGE_KEYS.COLLECTIONS, collections.filter(c => c.id !== id));
};

export const updateCollection = (id, updates) => {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === id);
  if (index !== -1) {
    collections[index] = { ...collections[index], ...updates };
    setItem(STORAGE_KEYS.COLLECTIONS, collections);
  }
};

// Tabs management
export const getOpenTabs = () => getItem(STORAGE_KEYS.OPEN_TABS, []);

export const saveOpenTabs = (tabs) => {
  setItem(STORAGE_KEYS.OPEN_TABS, tabs);
};

// Settings management
export const getSettings = () => getItem(STORAGE_KEYS.SETTINGS, {
  timeout: 30000,
  followRedirects: true,
  validateSSL: true,
  maxResponseSize: 10 * 1024 * 1024, // 10MB
  cacheMode: 'default',
});

export const saveSettings = (settings) => {
  setItem(STORAGE_KEYS.SETTINGS, settings);
};

// Export/Import
export const exportData = () => {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    collections: getCollections(),
    environments: getEnvironments(),
    settings: getSettings(),
  };
};

export const importData = (data) => {
  if (data.collections) saveCollections(data.collections);
  if (data.environments) saveEnvironments(data.environments);
  if (data.settings) saveSettings(data.settings);
};
