import React, { useState } from 'react';

export function BodyEditor({ body, onChange, bodyType, onBodyTypeChange }) {
  const [file, setFile] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target.result);
      };
      if (bodyType === 'binary') {
        reader.readAsArrayBuffer(selectedFile);
      } else {
        reader.readAsText(selectedFile);
      }
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-3">
        <select
          value={bodyType}
          onChange={(e) => onBodyTypeChange(e.target.value)}
          className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="json">JSON</option>
          <option value="text">Plain Text</option>
          <option value="xml">XML</option>
          <option value="form">Form URL-Encoded</option>
          <option value="multipart">Form Data (Multipart)</option>
          <option value="binary">Binary</option>
          <option value="graphql">GraphQL</option>
        </select>
      </div>

      {bodyType === 'binary' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              Choose File
            </label>
            {file && (
              <span className="text-gray-300 text-sm">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
            )}
          </div>
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 text-gray-400 text-sm">
            Binary data will be sent as raw bytes. Select a file to upload.
          </div>
        </div>
      ) : bodyType === 'multipart' ? (
        <div className="space-y-3">
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
            <div className="text-gray-300 text-sm mb-3">
              Add form fields and files for multipart/form-data
            </div>
            <textarea
              value={body}
              onChange={(e) => onChange(e.target.value)}
              placeholder="field1=value1&#10;field2=value2&#10;file=@/path/to/file.jpg"
              className="w-full h-48 px-3 py-2 bg-slate-800 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="mt-2 text-xs text-gray-400">
              Use @/path/to/file for file uploads
            </div>
          </div>
        </div>
      ) : (
        <textarea
          value={body}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter request body (${bodyType.toUpperCase()})`}
          className="w-full h-64 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      )}
    </div>
  );
}