import React, { useState } from 'react';
import { Plus, Trash2, Upload, AlertCircle, Check } from 'lucide-react';
import { validateJSON, getBodyPlaceholder, BODY_TYPE_OPTIONS } from '../utils/bodySerializer';

export function BodyEditorEnhanced({ 
  body, 
  onChange, 
  bodyType, 
  onBodyTypeChange,
  formFields,
  onFormFieldsChange,
  graphqlQuery,
  graphqlVariables,
  onGraphqlChange,
}) {
  const [file, setFile] = useState(null);
  const [jsonError, setJsonError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (bodyType === 'binary') {
          onChange(event.target.result);
        } else {
          onChange(event.target.result);
        }
      };
      if (bodyType === 'binary') {
        reader.readAsArrayBuffer(selectedFile);
      } else {
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleJsonChange = (value) => {
    onChange(value);
    if (bodyType === 'json' && value.trim()) {
      const validation = validateJSON(value);
      setJsonError(validation.valid ? null : validation.error);
    } else {
      setJsonError(null);
    }
  };

  const formatJson = () => {
    const validation = validateJSON(body);
    if (validation.valid && validation.formatted) {
      onChange(validation.formatted);
      setJsonError(null);
    }
  };

  // Form fields management
  const addFormField = () => {
    onFormFieldsChange([
      ...(formFields || []),
      { key: '', value: '', enabled: true, type: 'text' }
    ]);
  };

  const updateFormField = (index, field, value) => {
    const newFields = [...(formFields || [])];
    newFields[index] = { ...newFields[index], [field]: value };
    onFormFieldsChange(newFields);
  };

  const removeFormField = (index) => {
    onFormFieldsChange((formFields || []).filter((_, i) => i !== index));
  };

  const handleFormFileSelect = (index, e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      updateFormField(index, 'file', selectedFile);
      updateFormField(index, 'value', selectedFile.name);
    }
  };

  return (
    <div>
      {/* Body Type Selector */}
      <div className="flex items-center gap-3 mb-3">
        <select
          value={bodyType}
          onChange={(e) => onBodyTypeChange(e.target.value)}
          className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {BODY_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {bodyType === 'json' && (
          <button
            onClick={formatJson}
            className="px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded"
          >
            Format JSON
          </button>
        )}
      </div>

      {/* None */}
      {bodyType === 'none' && (
        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 text-slate-400 text-sm">
          This request does not have a body.
        </div>
      )}

      {/* JSON / Text / XML / HTML */}
      {['json', 'text', 'xml', 'html'].includes(bodyType) && (
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={getBodyPlaceholder(bodyType)}
            className={`w-full h-64 px-4 py-3 bg-slate-700 text-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              jsonError ? 'border-red-500' : 'border-slate-600'
            }`}
          />
          {jsonError && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={14} />
              {jsonError}
            </div>
          )}
          {bodyType === 'json' && !jsonError && body.trim() && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
              <Check size={14} />
              Valid JSON
            </div>
          )}
        </div>
      )}

      {/* URL Encoded Form */}
      {bodyType === 'form' && (
        <div className="space-y-3">
          <div className="text-sm text-slate-400 mb-2">
            Data will be sent as <code className="bg-slate-700 px-2 py-1 rounded">application/x-www-form-urlencoded</code>
          </div>
          
          {(formFields || []).map((field, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={field.enabled !== false}
                onChange={(e) => updateFormField(index, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateFormField(index, 'key', e.target.value)}
                placeholder="Key"
                className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateFormField(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeFormField(index)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          <button
            onClick={addFormField}
            className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:bg-slate-700 rounded"
          >
            <Plus size={18} />
            Add Field
          </button>
        </div>
      )}

      {/* Multipart Form Data */}
      {bodyType === 'multipart' && (
        <div className="space-y-3">
          <div className="text-sm text-slate-400 mb-2">
            Data will be sent as <code className="bg-slate-700 px-2 py-1 rounded">multipart/form-data</code>
          </div>
          
          {(formFields || []).map((field, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={field.enabled !== false}
                onChange={(e) => updateFormField(index, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateFormField(index, 'key', e.target.value)}
                placeholder="Key"
                className="w-1/4 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={field.type || 'text'}
                onChange={(e) => updateFormField(index, 'type', e.target.value)}
                className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text</option>
                <option value="file">File</option>
              </select>
              
              {field.type === 'file' ? (
                <div className="flex-1 flex items-center gap-2">
                  <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-sm">
                    <input
                      type="file"
                      onChange={(e) => handleFormFileSelect(index, e)}
                      className="hidden"
                    />
                    Choose File
                  </label>
                  {field.file && (
                    <span className="text-slate-300 text-sm truncate">
                      {field.file.name} ({(field.file.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => updateFormField(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              
              <button
                onClick={() => removeFormField(index)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          <button
            onClick={addFormField}
            className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:bg-slate-700 rounded"
          >
            <Plus size={18} />
            Add Field
          </button>
        </div>
      )}

      {/* Binary */}
      {bodyType === 'binary' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload size={16} className="inline mr-2" />
              Choose File
            </label>
            {file && (
              <span className="text-slate-300 text-sm">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
            )}
          </div>
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 text-slate-400 text-sm">
            Binary data will be sent as raw bytes in the request body.
          </div>
        </div>
      )}

      {/* GraphQL */}
      {bodyType === 'graphql' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Query</label>
            <textarea
              value={graphqlQuery || ''}
              onChange={(e) => onGraphqlChange?.('query', e.target.value)}
              placeholder={getBodyPlaceholder('graphql')}
              className="w-full h-40 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Variables (JSON)</label>
            <textarea
              value={graphqlVariables || ''}
              onChange={(e) => onGraphqlChange?.('variables', e.target.value)}
              placeholder='{\n  "id": "123"\n}'
              className="w-full h-24 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div className="text-xs text-slate-500">
            GraphQL requests are sent as JSON with <code className="bg-slate-700 px-1 rounded">query</code> and <code className="bg-slate-700 px-1 rounded">variables</code> fields.
          </div>
        </div>
      )}
    </div>
  );
}
