import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Copy,
  Edit2,
  Check
} from 'lucide-react';

export function EnvironmentManager({
  environments,
  activeEnvironment,
  onSave,
  onClose,
  onSetActive,
}) {
  const [envList, setEnvList] = useState(environments);
  const [selectedEnvId, setSelectedEnvId] = useState(activeEnvironment || envList[0]?.id);
  const [editingName, setEditingName] = useState(null);

  const selectedEnv = envList.find(e => e.id === selectedEnvId);

  const addEnvironment = () => {
    const newEnv = {
      id: Date.now().toString(),
      name: 'New Environment',
      variables: [{ key: '', value: '', secret: false }],
    };
    setEnvList([...envList, newEnv]);
    setSelectedEnvId(newEnv.id);
    setEditingName(newEnv.id);
  };

  const deleteEnvironment = (id) => {
    if (envList.length <= 1) return; // Keep at least one environment
    const newList = envList.filter(e => e.id !== id);
    setEnvList(newList);
    if (selectedEnvId === id) {
      setSelectedEnvId(newList[0]?.id);
    }
  };

  const updateEnvironment = (id, updates) => {
    setEnvList(envList.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const addVariable = () => {
    if (!selectedEnv) return;
    updateEnvironment(selectedEnvId, {
      variables: [...selectedEnv.variables, { key: '', value: '', secret: false }],
    });
  };

  const updateVariable = (index, field, value) => {
    if (!selectedEnv) return;
    const newVariables = [...selectedEnv.variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    updateEnvironment(selectedEnvId, { variables: newVariables });
  };

  const removeVariable = (index) => {
    if (!selectedEnv) return;
    updateEnvironment(selectedEnvId, {
      variables: selectedEnv.variables.filter((_, i) => i !== index),
    });
  };

  const duplicateEnvironment = (env) => {
    const newEnv = {
      ...env,
      id: Date.now().toString(),
      name: `${env.name} (Copy)`,
      variables: env.variables.map(v => ({ ...v })),
    };
    setEnvList([...envList, newEnv]);
    setSelectedEnvId(newEnv.id);
  };

  const handleSave = () => {
    onSave(envList);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Manage Environments</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Environment List */}
          <div className="w-64 border-r border-slate-700 p-4 overflow-auto">
            <button
              onClick={addEnvironment}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded mb-3"
            >
              <Plus size={16} />
              Add Environment
            </button>

            <div className="space-y-1">
              {envList.map(env => (
                <div
                  key={env.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${
                    selectedEnvId === env.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedEnvId(env.id)}
                >
                  {editingName === env.id ? (
                    <input
                      type="text"
                      value={env.name}
                      onChange={(e) => updateEnvironment(env.id, { name: e.target.value })}
                      onBlur={() => setEditingName(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingName(null)}
                      autoFocus
                      className="flex-1 bg-slate-600 text-white text-sm px-2 py-1 rounded border border-slate-500 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-slate-300 truncate">{env.name}</span>
                      {activeEnvironment === env.id && (
                        <span className="text-xs text-green-400">Active</span>
                      )}
                    </>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingName(env.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateEnvironment(env);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Copy size={12} />
                    </button>
                    {envList.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEnvironment(env.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Variables Editor */}
          <div className="flex-1 p-4 overflow-auto">
            {selectedEnv ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">{selectedEnv.name}</h3>
                  <button
                    onClick={() => onSetActive(selectedEnvId)}
                    className={`px-3 py-1 text-sm rounded ${
                      activeEnvironment === selectedEnvId
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {activeEnvironment === selectedEnvId ? (
                      <span className="flex items-center gap-1"><Check size={14} /> Active</span>
                    ) : (
                      'Set as Active'
                    )}
                  </button>
                </div>

                {/* Variables Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 px-2">
                    <div className="col-span-4">VARIABLE</div>
                    <div className="col-span-5">VALUE</div>
                    <div className="col-span-2">SECRET</div>
                    <div className="col-span-1"></div>
                  </div>

                  {selectedEnv.variables.map((variable, index) => (
                    <VariableRow
                      key={index}
                      variable={variable}
                      onUpdate={(field, value) => updateVariable(index, field, value)}
                      onRemove={() => removeVariable(index)}
                    />
                  ))}

                  <button
                    onClick={addVariable}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded"
                  >
                    <Plus size={16} />
                    Add Variable
                  </button>
                </div>

                {/* Usage Info */}
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">How to use</h4>
                  <p className="text-xs text-slate-400">
                    Use <code className="bg-slate-600 px-1 rounded">{'{{variableName}}'}</code> in your URLs, 
                    headers, params, or body to reference environment variables.
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    Example: <code className="bg-slate-600 px-1 rounded">{'{{baseUrl}}/api/users'}</code>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-12">
                Select an environment to edit
              </div>
            )}
          </div>
        </div>

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

function VariableRow({ variable, onUpdate, onRemove }) {
  const [showValue, setShowValue] = useState(!variable.secret);

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input
        type="text"
        value={variable.key}
        onChange={(e) => onUpdate('key', e.target.value)}
        placeholder="Variable name"
        className="col-span-4 px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="col-span-5 relative">
        <input
          type={showValue ? 'text' : 'password'}
          value={variable.value}
          onChange={(e) => onUpdate('value', e.target.value)}
          placeholder="Value"
          className="w-full px-3 py-2 pr-10 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
        <button
          onClick={() => setShowValue(!showValue)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
        >
          {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <div className="col-span-2 flex justify-center">
        <input
          type="checkbox"
          checked={variable.secret}
          onChange={(e) => {
            onUpdate('secret', e.target.checked);
            if (e.target.checked) setShowValue(false);
          }}
          className="w-4 h-4 rounded"
        />
      </div>
      <div className="col-span-1 flex justify-center">
        <button
          onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-300"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
