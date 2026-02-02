import React, { useState } from 'react';
import { 
  History, 
  FolderOpen, 
  Globe, 
  ChevronRight, 
  ChevronDown,
  Trash2,
  Clock,
  Play,
  Plus,
  Search,
  Download,
  Upload,
  MoreVertical
} from 'lucide-react';

const METHOD_COLORS = {
  GET: 'text-green-400',
  POST: 'text-yellow-400',
  PUT: 'text-blue-400',
  PATCH: 'text-purple-400',
  DELETE: 'text-red-400',
  HEAD: 'text-gray-400',
  OPTIONS: 'text-cyan-400',
};

export function Sidebar({
  history = [],
  collections = [],
  environments = [],
  activeEnvironment,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
  onSelectRequest,
  onEnvironmentChange,
  onManageEnvironments,
  onImport,
  onExport,
  collapsed = false,
  onToggle,
}) {
  const [activeSection, setActiveSection] = useState('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleCollection = (id) => {
    setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredHistory = history.filter(item => 
    item.request.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.request.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-slate-800/50 border-r border-slate-700 flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => setActiveSection('history')}
          className={`p-2 rounded ${activeSection === 'history' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          title="History"
        >
          <History size={20} />
        </button>
        <button
          onClick={() => setActiveSection('collections')}
          className={`p-2 rounded ${activeSection === 'collections' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          title="Collections"
        >
          <FolderOpen size={20} />
        </button>
        <button
          onClick={() => setActiveSection('environments')}
          className={`p-2 rounded ${activeSection === 'environments' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          title="Environments"
        >
          <Globe size={20} />
        </button>
        <div className="flex-1" />
        <button
          onClick={onToggle}
          className="p-2 text-slate-400 hover:text-white"
          title="Expand sidebar"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-800/50 border-r border-slate-700 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveSection('history')}
          className={`flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeSection === 'history' 
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History size={16} />
          History
        </button>
        <button
          onClick={() => setActiveSection('collections')}
          className={`flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeSection === 'collections' 
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen size={16} />
          Collections
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Environment Selector */}
      <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
        <Globe size={14} className="text-slate-400" />
        <select
          value={activeEnvironment || ''}
          onChange={(e) => onEnvironmentChange(e.target.value)}
          className="flex-1 bg-slate-700 text-white text-sm rounded border border-slate-600 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Environment</option>
          {environments.map(env => (
            <option key={env.id} value={env.id}>{env.name}</option>
          ))}
        </select>
        <button
          onClick={onManageEnvironments}
          className="p-1 text-slate-400 hover:text-white"
          title="Manage Environments"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'history' && (
          <div className="p-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm">
                No history yet
              </div>
            ) : (
              <div className="space-y-1">
                {filteredHistory.map(item => (
                  <div
                    key={item.id}
                    className="group p-2 rounded hover:bg-slate-700 cursor-pointer"
                    onClick={() => onSelectHistory(item)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${METHOD_COLORS[item.request.method]}`}>
                        {item.request.method}
                      </span>
                      <span className="flex-1 text-sm text-slate-300 truncate">
                        {item.request.url.replace(/^https?:\/\//, '').split('/').slice(1).join('/') || '/'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistory(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-slate-500" />
                      <span className="text-xs text-slate-500">{formatTime(item.timestamp)}</span>
                      {item.response && (
                        <span className={`text-xs ${
                          item.response.status < 300 ? 'text-green-500' :
                          item.response.status < 400 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {item.response.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'collections' && (
          <div className="p-2">
            <button
              onClick={onCreateCollection}
              className="w-full flex items-center gap-2 p-2 text-sm text-blue-400 hover:bg-slate-700 rounded mb-2"
            >
              <Plus size={16} />
              New Collection
            </button>
            
            {filteredCollections.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm">
                No collections yet
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCollections.map(collection => (
                  <div key={collection.id}>
                    <div
                      className="group flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer"
                      onClick={() => toggleCollection(collection.id)}
                    >
                      {expandedCollections[collection.id] ? (
                        <ChevronDown size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )}
                      <FolderOpen size={16} className="text-yellow-400" />
                      <span className="flex-1 text-sm text-slate-300">{collection.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCollection(collection.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {expandedCollections[collection.id] && (
                      <div className="ml-6 space-y-1">
                        {/* Folders */}
                        {collection.folders?.map(folder => (
                          <div key={folder.id}>
                            <div
                              className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer"
                              onClick={() => toggleFolder(folder.id)}
                            >
                              {expandedFolders[folder.id] ? (
                                <ChevronDown size={14} className="text-slate-400" />
                              ) : (
                                <ChevronRight size={14} className="text-slate-400" />
                              )}
                              <FolderOpen size={14} className="text-slate-400" />
                              <span className="text-sm text-slate-300">{folder.name}</span>
                            </div>
                            {expandedFolders[folder.id] && folder.requests?.map(req => (
                              <div
                                key={req.id}
                                className="flex items-center gap-2 p-2 ml-4 rounded hover:bg-slate-700 cursor-pointer"
                                onClick={() => onSelectRequest(req)}
                              >
                                <span className={`text-xs font-bold ${METHOD_COLORS[req.method]}`}>
                                  {req.method}
                                </span>
                                <span className="text-sm text-slate-300 truncate">{req.name}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                        
                        {/* Requests at collection root */}
                        {collection.requests?.map(req => (
                          <div
                            key={req.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer"
                            onClick={() => onSelectRequest(req)}
                          >
                            <Play size={14} className="text-slate-400" />
                            <span className={`text-xs font-bold ${METHOD_COLORS[req.method]}`}>
                              {req.method}
                            </span>
                            <span className="text-sm text-slate-300 truncate">{req.name}</span>
                          </div>
                        ))}
                        
                        {(!collection.folders?.length && !collection.requests?.length) && (
                          <div className="text-xs text-slate-500 p-2">Empty collection</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-700 p-2 flex gap-2">
        {activeSection === 'history' && history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded"
          >
            <Trash2 size={14} />
            Clear History
          </button>
        )}
        {activeSection === 'collections' && (
          <>
            <button
              onClick={onImport}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded"
            >
              <Upload size={14} />
              Import
            </button>
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded"
            >
              <Download size={14} />
              Export
            </button>
          </>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-1 bg-slate-700 rounded-full text-slate-400 hover:text-white border border-slate-600 z-10"
      >
        <ChevronRight size={14} className="rotate-180" />
      </button>
    </div>
  );
}
