import React from 'react';
import { X, Plus } from 'lucide-react';

const METHOD_COLORS = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PUT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  HEAD: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  OPTIONS: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export function RequestTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onUpdateTab,
}) {
  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    onCloseTab(tabId);
  };

  return (
    <div className="flex items-center bg-slate-800/50 border-b border-slate-700 overflow-x-auto">
      <div className="flex items-center flex-1 min-w-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group flex items-center gap-2 px-4 py-2 border-r border-slate-700 cursor-pointer min-w-0 max-w-xs transition-colors ${
              activeTabId === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${METHOD_COLORS[tab.method] || METHOD_COLORS.GET}`}>
              {tab.method}
            </span>
            <span className="truncate text-sm flex-1 min-w-0">
              {tab.name || getTabName(tab.url)}
            </span>
            {tab.isDirty && (
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" title="Unsaved changes" />
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-600 rounded flex-shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={onNewTab}
        className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        title="New Tab"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

function getTabName(url) {
  if (!url) return 'Untitled';
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (path === '/') return urlObj.hostname;
    return path.split('/').filter(Boolean).pop() || urlObj.hostname;
  } catch {
    return url.slice(0, 20) || 'Untitled';
  }
}

// Create a new empty tab
export function createNewTab(id = null) {
  return {
    id: id || Date.now().toString(),
    name: '',
    url: '',
    method: 'GET',
    headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
    params: [{ key: '', value: '', enabled: true }],
    body: '',
    bodyType: 'json',
    auth: { type: 'none' },
    settings: {},
    tests: [],
    isDirty: false,
    response: null,
  };
}

// Clone an existing request into a new tab
export function cloneRequestToTab(request) {
  return {
    ...createNewTab(),
    ...request,
    id: Date.now().toString(),
    name: request.name ? `${request.name} (Copy)` : '',
    isDirty: true,
  };
}
