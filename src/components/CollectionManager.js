import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  FolderPlus, 
  Save, 
  X,
  ChevronRight,
  ChevronDown,
  Edit2,
  MoreVertical,
  Download,
  Upload
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

export function CollectionManager({
  collections,
  onSave,
  onClose,
  currentRequest,
}) {
  const [collectionList, setCollectionList] = useState(collections);
  const [selectedCollectionId, setSelectedCollectionId] = useState(collectionList[0]?.id);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveToCollection, setSaveToCollection] = useState('');
  const [saveToFolder, setSaveToFolder] = useState('');
  const [requestName, setRequestName] = useState('');

  const selectedCollection = collectionList.find(c => c.id === selectedCollectionId);

  const addCollection = () => {
    const newCollection = {
      id: Date.now().toString(),
      name: 'New Collection',
      description: '',
      folders: [],
      requests: [],
      createdAt: new Date().toISOString(),
    };
    setCollectionList([...collectionList, newCollection]);
    setSelectedCollectionId(newCollection.id);
    setEditingId(newCollection.id);
  };

  const deleteCollection = (id) => {
    const newList = collectionList.filter(c => c.id !== id);
    setCollectionList(newList);
    if (selectedCollectionId === id) {
      setSelectedCollectionId(newList[0]?.id);
    }
  };

  const updateCollection = (id, updates) => {
    setCollectionList(collectionList.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const addFolder = (collectionId) => {
    const collection = collectionList.find(c => c.id === collectionId);
    if (!collection) return;

    const newFolder = {
      id: Date.now().toString(),
      name: 'New Folder',
      requests: [],
    };

    updateCollection(collectionId, {
      folders: [...(collection.folders || []), newFolder],
    });
    setEditingId(newFolder.id);
  };

  const deleteFolder = (collectionId, folderId) => {
    const collection = collectionList.find(c => c.id === collectionId);
    if (!collection) return;

    updateCollection(collectionId, {
      folders: collection.folders.filter(f => f.id !== folderId),
    });
  };

  const updateFolder = (collectionId, folderId, updates) => {
    const collection = collectionList.find(c => c.id === collectionId);
    if (!collection) return;

    updateCollection(collectionId, {
      folders: collection.folders.map(f =>
        f.id === folderId ? { ...f, ...updates } : f
      ),
    });
  };

  const deleteRequest = (collectionId, requestId, folderId = null) => {
    const collection = collectionList.find(c => c.id === collectionId);
    if (!collection) return;

    if (folderId) {
      updateCollection(collectionId, {
        folders: collection.folders.map(f =>
          f.id === folderId
            ? { ...f, requests: f.requests.filter(r => r.id !== requestId) }
            : f
        ),
      });
    } else {
      updateCollection(collectionId, {
        requests: collection.requests.filter(r => r.id !== requestId),
      });
    }
  };

  const saveCurrentRequest = () => {
    if (!currentRequest || !saveToCollection || !requestName) return;

    const collection = collectionList.find(c => c.id === saveToCollection);
    if (!collection) return;

    const newRequest = {
      id: Date.now().toString(),
      name: requestName,
      ...currentRequest,
      savedAt: new Date().toISOString(),
    };

    if (saveToFolder) {
      updateCollection(saveToCollection, {
        folders: collection.folders.map(f =>
          f.id === saveToFolder
            ? { ...f, requests: [...(f.requests || []), newRequest] }
            : f
        ),
      });
    } else {
      updateCollection(saveToCollection, {
        requests: [...(collection.requests || []), newRequest],
      });
    }

    setShowSaveDialog(false);
    setRequestName('');
    setSaveToFolder('');
  };

  const exportCollections = () => {
    const data = {
      version: '1.0',
      type: 'api_sandbox_collection',
      exportedAt: new Date().toISOString(),
      collections: collectionList,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api_sandbox_collections.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCollections = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.collections && Array.isArray(data.collections)) {
          // Assign new IDs to avoid conflicts
          const importedCollections = data.collections.map(c => ({
            ...c,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: c.name + ' (Imported)',
          }));
          setCollectionList([...collectionList, ...importedCollections]);
        }
      } catch (error) {
        console.error('Failed to import collections:', error);
        alert('Failed to import collections. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onSave(collectionList);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Collections</h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded cursor-pointer">
              <Upload size={16} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importCollections}
                className="hidden"
              />
            </label>
            <button
              onClick={exportCollections}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Collection List */}
          <div className="w-72 border-r border-slate-700 p-4 overflow-auto">
            <button
              onClick={addCollection}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded mb-3"
            >
              <Plus size={16} />
              New Collection
            </button>

            <div className="space-y-1">
              {collectionList.map(collection => (
                <div
                  key={collection.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${
                    selectedCollectionId === collection.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedCollectionId(collection.id)}
                >
                  {editingId === collection.id ? (
                    <input
                      type="text"
                      value={collection.name}
                      onChange={(e) => updateCollection(collection.id, { name: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      autoFocus
                      className="flex-1 bg-slate-600 text-white text-sm px-2 py-1 rounded border border-slate-500 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-slate-300 truncate">{collection.name}</span>
                      <span className="text-xs text-slate-500">
                        {(collection.requests?.length || 0) + (collection.folders?.reduce((sum, f) => sum + (f.requests?.length || 0), 0) || 0)} reqs
                      </span>
                    </>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(collection.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCollection(collection.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Details */}
          <div className="flex-1 p-4 overflow-auto">
            {selectedCollection ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedCollection.name}</h3>
                    <input
                      type="text"
                      value={selectedCollection.description || ''}
                      onChange={(e) => updateCollection(selectedCollection.id, { description: e.target.value })}
                      placeholder="Add a description..."
                      className="mt-1 text-sm text-slate-400 bg-transparent border-none focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addFolder(selectedCollection.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded"
                    >
                      <FolderPlus size={16} />
                      Add Folder
                    </button>
                    {currentRequest && (
                      <button
                        onClick={() => {
                          setSaveToCollection(selectedCollection.id);
                          setShowSaveDialog(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        <Save size={16} />
                        Save Current Request
                      </button>
                    )}
                  </div>
                </div>

                {/* Folders */}
                <div className="space-y-2">
                  {selectedCollection.folders?.map(folder => (
                    <div key={folder.id} className="border border-slate-700 rounded-lg">
                      <div
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700/50 cursor-pointer"
                        onClick={() => setExpandedFolders(prev => ({ ...prev, [folder.id]: !prev[folder.id] }))}
                      >
                        {expandedFolders[folder.id] ? (
                          <ChevronDown size={16} className="text-slate-400" />
                        ) : (
                          <ChevronRight size={16} className="text-slate-400" />
                        )}
                        {editingId === folder.id ? (
                          <input
                            type="text"
                            value={folder.name}
                            onChange={(e) => updateFolder(selectedCollection.id, folder.id, { name: e.target.value })}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                            autoFocus
                            className="flex-1 bg-slate-600 text-white text-sm px-2 py-1 rounded border border-slate-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="flex-1 text-sm text-slate-300">{folder.name}</span>
                        )}
                        <span className="text-xs text-slate-500">{folder.requests?.length || 0} requests</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(folder.id);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFolder(selectedCollection.id, folder.id);
                          }}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      
                      {expandedFolders[folder.id] && (
                        <div className="px-3 pb-2 space-y-1">
                          {folder.requests?.length ? (
                            folder.requests.map(req => (
                              <RequestItem
                                key={req.id}
                                request={req}
                                onDelete={() => deleteRequest(selectedCollection.id, req.id, folder.id)}
                              />
                            ))
                          ) : (
                            <div className="text-xs text-slate-500 py-2 pl-6">No requests in this folder</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Root-level requests */}
                  {selectedCollection.requests?.length > 0 && (
                    <div className="border border-slate-700 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-2">Root Requests</div>
                      <div className="space-y-1">
                        {selectedCollection.requests.map(req => (
                          <RequestItem
                            key={req.id}
                            request={req}
                            onDelete={() => deleteRequest(selectedCollection.id, req.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedCollection.folders?.length && !selectedCollection.requests?.length && (
                    <div className="text-center text-slate-400 py-12">
                      <p>This collection is empty</p>
                      <p className="text-sm mt-2">Add folders or save requests to get started</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-12">
                Select a collection or create a new one
              </div>
            )}
          </div>
        </div>

        {/* Save Request Dialog */}
        {showSaveDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-700 rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium text-white mb-4">Save Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Request Name</label>
                  <input
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="e.g., Get Users"
                    className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Save to Folder (optional)</label>
                  <select
                    value={saveToFolder}
                    onChange={(e) => setSaveToFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Root of collection</option>
                    {selectedCollection?.folders?.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 text-slate-300 hover:bg-slate-600 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCurrentRequest}
                    disabled={!requestName}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestItem({ request, onDelete }) {
  return (
    <div className="group flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-700/50">
      <span className={`text-xs font-bold ${METHOD_COLORS[request.method]}`}>
        {request.method}
      </span>
      <span className="flex-1 text-sm text-slate-300 truncate">{request.name}</span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
