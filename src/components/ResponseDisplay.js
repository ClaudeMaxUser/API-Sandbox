import React, { useState } from 'react';
import { Send, Plus, Trash2, Copy, Check } from 'lucide-react';

export function ResponseDisplay({ response, onCopy, copied }) {
  const [activeTab, setActiveTab] = useState('body');

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  if (!response) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg shadow-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Response</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-3 py-1 rounded font-semibold ${
            response.error 
              ? 'bg-red-500/20 text-red-400'
              : response.status < 300 
              ? 'bg-green-500/20 text-green-400' 
              : response.status < 400
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {response.error ? 'Error' : `${response.status} ${response.statusText}`}
          </span>
          {!response.error && (
            <>
              <span className="text-slate-400">Time: <span className="text-white font-semibold">{response.time}ms</span></span>
              <span className="text-slate-400">Size: <span className="text-white font-semibold">{formatBytes(response.size)}</span></span>
            </>
          )}
        </div>
      </div>

      {response.error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 font-mono">{response.message}</p>
        </div>
      ) : (
        <>
          <div className="border-b border-slate-700 mb-4">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('body')}
                className={`pb-3 px-2 font-medium transition-colors ${
                  activeTab === 'body'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Body
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`pb-3 px-2 font-medium transition-colors ${
                  activeTab === 'headers'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Headers
              </button>
            </div>
          </div>

          {activeTab === 'body' && (
            <div className="relative">
              <button
                onClick={onCopy}
                className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors z-10"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <pre className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <code className="text-slate-300">
                  {typeof response.data === 'string' 
                    ? response.data 
                    : JSON.stringify(response.data, null, 2)}
                </code>
              </pre>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="bg-slate-900 p-4 rounded-lg max-h-96 overflow-auto">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex py-2 border-b border-slate-800 last:border-0">
                  <span className="text-blue-400 font-semibold w-1/3">{key}:</span>
                  <span className="text-slate-300 w-2/3 break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
