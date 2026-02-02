import React, { useState, useEffect, useCallback } from 'react';
import { Send, Code, Save, Settings, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

// Components
import { Sidebar } from './components/Sidebar';
import { RequestTabs, createNewTab } from './components/RequestTabs';
import { KeyValueList } from './components/KeyValueList';
import { BodyEditorEnhanced } from './components/BodyEditorEnhanced';
import { ResponseDisplay } from './components/ResponseDisplayEnhanced';
import { AuthEditor, generateAuthConfig } from './components/AuthEditor';
import { EnvironmentManager } from './components/EnvironmentManager';
import { CodeGeneratorModal } from './components/CodeGenerator';
import { CollectionManager } from './components/CollectionManager';
import { RequestSettings, buildFetchOptions, createTimeoutController } from './components/RequestSettings';
import { TestEditor, runAllTests } from './components/TestEditor';

// Utilities
import { 
  getHistory, 
  addToHistory, 
  clearHistory, 
  deleteHistoryItem,
  getEnvironments, 
  saveEnvironments, 
  getActiveEnvironment, 
  setActiveEnvironment,
  getCollections,
  saveCollections,
  getSettings,
  saveSettings,
  exportData,
  importData,
} from './utils/storage';
import { interpolate, envToObject, interpolateKeyValueArray } from './utils/variableInterpolation';
import { serializeBody, serializeUrlEncoded, serializeMultipart, serializeGraphQL } from './utils/bodySerializer';

export default function ApiSandbox() {
  // Core state
  const [tabs, setTabs] = useState([createNewTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [activeEnvironment, setActiveEnv] = useState(null);
  
  // Modal state
  const [showEnvManager, setShowEnvManager] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [showCollectionManager, setShowCollectionManager] = useState(false);
  
  // Request state
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get current active tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Load persisted data on mount
  useEffect(() => {
    setHistory(getHistory());
    setCollections(getCollections());
    setEnvironments(getEnvironments());
    setActiveEnv(getActiveEnvironment());
    
    // Load default settings into first tab
    const settings = getSettings();
    updateActiveTab({ settings });
  }, []);

  // Update active tab helper
  const updateActiveTab = useCallback((updates) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, ...updates, isDirty: true }
          : tab
      )
    );
  }, [activeTabId]);

  // Tab management
  const handleNewTab = () => {
    const newTab = createNewTab();
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
  };

  // Item management for key-value lists
  const addItem = (field) => {
    const items = activeTab[field] || [];
    updateActiveTab({ [field]: [...items, { key: '', value: '', enabled: true }] });
  };

  const updateItem = (field, index, key, value) => {
    const items = [...(activeTab[field] || [])];
    items[index] = { ...items[index], [key]: value };
    updateActiveTab({ [field]: items });
  };

  const removeItem = (field, index) => {
    const items = (activeTab[field] || []).filter((_, i) => i !== index);
    updateActiveTab({ [field]: items });
  };

  // Get interpolated values
  const getInterpolatedRequest = () => {
    const env = environments.find(e => e.id === activeEnvironment);
    const vars = env ? envToObject(env.variables) : {};

    return {
      url: interpolate(activeTab.url, vars),
      method: activeTab.method,
      headers: interpolateKeyValueArray(activeTab.headers || [], vars),
      params: interpolateKeyValueArray(activeTab.params || [], vars),
      body: interpolate(activeTab.body, vars),
      bodyType: activeTab.bodyType,
      formFields: activeTab.formFields,
      graphqlQuery: interpolate(activeTab.graphqlQuery, vars),
      graphqlVariables: interpolate(activeTab.graphqlVariables, vars),
      auth: activeTab.auth ? {
        ...activeTab.auth,
        token: interpolate(activeTab.auth.token, vars),
        username: interpolate(activeTab.auth.username, vars),
        password: interpolate(activeTab.auth.password, vars),
        value: interpolate(activeTab.auth.value, vars),
      } : { type: 'none' },
      settings: activeTab.settings || {},
    };
  };

  // Build URL with params
  const buildUrlWithParams = (url, params, authParams = []) => {
    const enabledParams = [...params, ...authParams].filter(p => p.enabled && p.key);
    if (enabledParams.length === 0) return url;

    try {
      const urlObj = new URL(url);
      enabledParams.forEach(p => {
        urlObj.searchParams.append(p.key, p.value);
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  // Send request
  const sendRequest = async () => {
    setLoading(true);
    updateActiveTab({ response: null });
    
    const startTime = Date.now();
    const request = getInterpolatedRequest();
    const { controller, clear: clearTimeout } = createTimeoutController(request.settings.timeout || 30000);
    
    try {
      // Generate auth headers/params
      const authConfig = generateAuthConfig(request.auth);
      
      // Merge headers (user headers + auth headers)
      const allHeaders = [
        ...request.headers.filter(h => h.enabled && h.key && !h.isAuth),
        ...authConfig.headers,
      ];
      
      const enabledHeaders = allHeaders.reduce((acc, h) => {
        if (h.key) acc[h.key] = h.value;
        return acc;
      }, {});

      // Build fetch options
      const fetchOptions = buildFetchOptions(request.settings);
      const options = {
        method: request.method,
        headers: enabledHeaders,
        signal: controller.signal,
        ...fetchOptions,
      };

      // Handle body based on type
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        let bodyData = null;
        let contentType = null;

        switch (request.bodyType) {
          case 'json':
          case 'text':
          case 'xml':
          case 'html':
            const serialized = serializeBody(request.body, request.bodyType);
            bodyData = serialized.body;
            contentType = serialized.contentType;
            break;
            
          case 'form':
            const formSerialized = serializeUrlEncoded(request.formFields || []);
            bodyData = formSerialized.body;
            contentType = formSerialized.contentType;
            break;
            
          case 'multipart':
            const multipartSerialized = serializeMultipart(request.formFields || []);
            bodyData = multipartSerialized.body;
            // Don't set content-type for FormData - browser will set it with boundary
            break;
            
          case 'graphql':
            const graphqlSerialized = serializeGraphQL({
              query: request.graphqlQuery,
              variables: request.graphqlVariables,
            });
            bodyData = graphqlSerialized.body;
            contentType = graphqlSerialized.contentType;
            break;
            
          case 'binary':
            bodyData = request.body;
            contentType = 'application/octet-stream';
            break;
        }

        if (bodyData) {
          options.body = bodyData;
        }
        
        if (contentType && !enabledHeaders['Content-Type']) {
          options.headers['Content-Type'] = contentType;
        }
      }

      // Build final URL
      const finalUrl = buildUrlWithParams(request.url, request.params, authConfig.params);
      
      // Make request
      const res = await fetch(finalUrl, options);
      clearTimeout();
      
      const endTime = Date.now();
      
      // Parse response
      const responseContentType = res.headers.get('content-type') || '';
      let data;
      
      if (responseContentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = await res.text();
        }
      } else {
        data = await res.text();
      }

      // Collect response headers
      const responseHeaders = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const response = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: endTime - startTime,
        size: new Blob([typeof data === 'string' ? data : JSON.stringify(data)]).size,
        url: res.url,
        redirected: res.redirected,
      };

      updateActiveTab({ response });

      // Run tests if any
      if (activeTab.tests?.length > 0) {
        const testResults = runAllTests(activeTab.tests, response);
        updateActiveTab({ testResults });
      }

      // Add to history
      const historyEntry = addToHistory(
        {
          url: activeTab.url,
          method: activeTab.method,
          headers: activeTab.headers,
          params: activeTab.params,
          body: activeTab.body,
          bodyType: activeTab.bodyType,
          auth: activeTab.auth,
        },
        response
      );
      setHistory(getHistory());

    } catch (error) {
      clearTimeout();
      const response = {
        error: true,
        message: error.name === 'AbortError' 
          ? 'Request timed out' 
          : error.message,
        time: Date.now() - startTime,
      };
      updateActiveTab({ response });
    } finally {
      setLoading(false);
    }
  };

  // Copy response
  const copyResponse = () => {
    if (!activeTab.response?.data) return;
    const text = typeof activeTab.response.data === 'string' 
      ? activeTab.response.data 
      : JSON.stringify(activeTab.response.data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // History handlers
  const handleSelectHistory = (item) => {
    updateActiveTab({
      url: item.request.url,
      method: item.request.method,
      headers: item.request.headers || [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      params: item.request.params || [{ key: '', value: '', enabled: true }],
      body: item.request.body || '',
      bodyType: item.request.bodyType || 'json',
      auth: item.request.auth || { type: 'none' },
      response: null,
      isDirty: false,
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleDeleteHistory = (id) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  // Environment handlers
  const handleEnvironmentChange = (envId) => {
    setActiveEnv(envId);
    setActiveEnvironment(envId);
  };

  const handleSaveEnvironments = (envs) => {
    saveEnvironments(envs);
    setEnvironments(envs);
  };

  // Collection handlers
  const handleCreateCollection = () => {
    setShowCollectionManager(true);
  };

  const handleSaveCollections = (cols) => {
    saveCollections(cols);
    setCollections(cols);
  };

  const handleDeleteCollection = (id) => {
    const newCollections = collections.filter(c => c.id !== id);
    saveCollections(newCollections);
    setCollections(newCollections);
  };

  const handleSelectRequest = (request) => {
    updateActiveTab({
      url: request.url,
      method: request.method,
      headers: request.headers || [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      params: request.params || [{ key: '', value: '', enabled: true }],
      body: request.body || '',
      bodyType: request.bodyType || 'json',
      auth: request.auth || { type: 'none' },
      formFields: request.formFields,
      graphqlQuery: request.graphqlQuery,
      graphqlVariables: request.graphqlVariables,
      tests: request.tests || [],
      settings: request.settings || {},
      response: null,
      isDirty: false,
      name: request.name,
    });
  };

  // Import/Export
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api_sandbox_export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          importData(data);
          setCollections(getCollections());
          setEnvironments(getEnvironments());
        } catch (error) {
          console.error('Failed to import:', error);
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Active tab index for tabs
  const [activeRequestTab, setActiveRequestTab] = useState('params');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar */}
      <div className="relative">
        <Sidebar
          history={history}
          collections={collections}
          environments={environments}
          activeEnvironment={activeEnvironment}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
          onSelectCollection={() => setShowCollectionManager(true)}
          onCreateCollection={handleCreateCollection}
          onDeleteCollection={handleDeleteCollection}
          onSelectRequest={handleSelectRequest}
          onEnvironmentChange={handleEnvironmentChange}
          onManageEnvironments={() => setShowEnvManager(true)}
          onImport={handleImport}
          onExport={handleExport}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Request Tabs */}
        <RequestTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
        />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">API Sandbox</h1>
                <p className="text-slate-400 text-sm">Test and debug API endpoints</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCodeGenerator(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Generate Code"
                >
                  <Code size={16} />
                  Code
                </button>
                <button
                  onClick={() => setShowCollectionManager(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Save to Collection"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>

            {/* Request Section */}
            <div className="bg-slate-800/50 backdrop-blur rounded-lg shadow-2xl border border-slate-700 p-6 mb-6">
              {/* URL Bar */}
              <div className="flex gap-3 mb-6">
                <select
                  value={activeTab.method}
                  onChange={(e) => updateActiveTab({ method: e.target.value })}
                  className="px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                  <option>HEAD</option>
                  <option>OPTIONS</option>
                </select>
                
                <input
                  type="text"
                  value={activeTab.url}
                  onChange={(e) => updateActiveTab({ url: e.target.value })}
                  placeholder="Enter request URL (use {{variable}} for env variables)"
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <button
                  onClick={sendRequest}
                  disabled={loading || !activeTab.url}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Send size={18} />
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>

              {/* Request Tabs */}
              <div className="border-b border-slate-700 mb-4">
                <div className="flex gap-6">
                  {['params', 'headers', 'auth', 'body', 'settings', 'tests'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveRequestTab(tab)}
                      className={`pb-3 px-2 font-medium transition-colors capitalize ${
                        activeRequestTab === tab
                          ? 'text-blue-400 border-b-2 border-blue-400'
                          : 'text-slate-400 hover:text-slate-300'
                      } ${
                        (tab === 'body' && (activeTab.method === 'GET' || activeTab.method === 'HEAD'))
                          ? 'hidden' : ''
                      }`}
                    >
                      {tab}
                      {tab === 'params' && activeTab.params?.filter(p => p.enabled && p.key).length > 0 && (
                        <span className="ml-2 text-xs bg-slate-600 px-1.5 py-0.5 rounded">
                          {activeTab.params.filter(p => p.enabled && p.key).length}
                        </span>
                      )}
                      {tab === 'headers' && activeTab.headers?.filter(h => h.enabled && h.key).length > 0 && (
                        <span className="ml-2 text-xs bg-slate-600 px-1.5 py-0.5 rounded">
                          {activeTab.headers.filter(h => h.enabled && h.key).length}
                        </span>
                      )}
                      {tab === 'tests' && activeTab.tests?.length > 0 && (
                        <span className="ml-2 text-xs bg-slate-600 px-1.5 py-0.5 rounded">
                          {activeTab.tests.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeRequestTab === 'params' && (
                <KeyValueList
                  items={activeTab.params || []}
                  onUpdate={(index, field, value) => updateItem('params', index, field, value)}
                  onRemove={(index) => removeItem('params', index)}
                  onAdd={() => addItem('params')}
                  label="Param"
                />
              )}

              {activeRequestTab === 'headers' && (
                <KeyValueList
                  items={activeTab.headers || []}
                  onUpdate={(index, field, value) => updateItem('headers', index, field, value)}
                  onRemove={(index) => removeItem('headers', index)}
                  onAdd={() => addItem('headers')}
                  label="Header"
                />
              )}

              {activeRequestTab === 'auth' && (
                <AuthEditor
                  auth={activeTab.auth || { type: 'none' }}
                  onChange={(auth) => updateActiveTab({ auth })}
                />
              )}

              {activeRequestTab === 'body' && activeTab.method !== 'GET' && activeTab.method !== 'HEAD' && (
                <BodyEditorEnhanced
                  body={activeTab.body || ''}
                  onChange={(body) => updateActiveTab({ body })}
                  bodyType={activeTab.bodyType || 'json'}
                  onBodyTypeChange={(bodyType) => updateActiveTab({ bodyType })}
                  formFields={activeTab.formFields || []}
                  onFormFieldsChange={(formFields) => updateActiveTab({ formFields })}
                  graphqlQuery={activeTab.graphqlQuery || ''}
                  graphqlVariables={activeTab.graphqlVariables || ''}
                  onGraphqlChange={(field, value) => updateActiveTab({ 
                    [field === 'query' ? 'graphqlQuery' : 'graphqlVariables']: value 
                  })}
                />
              )}

              {activeRequestTab === 'settings' && (
                <RequestSettings
                  settings={activeTab.settings || {}}
                  onChange={(settings) => updateActiveTab({ settings })}
                />
              )}

              {activeRequestTab === 'tests' && (
                <TestEditor
                  tests={activeTab.tests || []}
                  onChange={(tests) => updateActiveTab({ tests })}
                  response={activeTab.response}
                />
              )}
            </div>

            {/* Response Section */}
            {activeTab.response && (
              <ResponseDisplay
                response={activeTab.response}
                onCopy={copyResponse}
                copied={copied}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEnvManager && (
        <EnvironmentManager
          environments={environments}
          activeEnvironment={activeEnvironment}
          onSave={handleSaveEnvironments}
          onClose={() => setShowEnvManager(false)}
          onSetActive={(envId) => {
            setActiveEnv(envId);
            setActiveEnvironment(envId);
          }}
        />
      )}

      {showCodeGenerator && (
        <CodeGeneratorModal
          request={{
            method: activeTab.method,
            url: activeTab.url,
            headers: activeTab.headers,
            params: activeTab.params,
            body: activeTab.body,
            bodyType: activeTab.bodyType,
          }}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}

      {showCollectionManager && (
        <CollectionManager
          collections={collections}
          onSave={handleSaveCollections}
          onClose={() => setShowCollectionManager(false)}
          currentRequest={{
            url: activeTab.url,
            method: activeTab.method,
            headers: activeTab.headers,
            params: activeTab.params,
            body: activeTab.body,
            bodyType: activeTab.bodyType,
            auth: activeTab.auth,
            formFields: activeTab.formFields,
            graphqlQuery: activeTab.graphqlQuery,
            graphqlVariables: activeTab.graphqlVariables,
            tests: activeTab.tests,
            settings: activeTab.settings,
          }}
        />
      )}
    </div>
  );
}
