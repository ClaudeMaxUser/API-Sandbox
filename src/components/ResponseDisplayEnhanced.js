import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  FileJson,
  FileText,
  Eye
} from 'lucide-react';

export function ResponseDisplay({ response, onCopy, copied }) {
  const [activeTab, setActiveTab] = useState('pretty');
  const [headerTab, setHeaderTab] = useState('body');
  const [expandedPaths, setExpandedPaths] = useState(new Set(['root']));
  const [searchQuery, setSearchQuery] = useState('');

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const downloadResponse = () => {
    const text = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data, null, 2);
    
    const contentType = response.headers?.['content-type'] || 'text/plain';
    const extension = contentType.includes('json') ? 'json' 
      : contentType.includes('xml') ? 'xml'
      : contentType.includes('html') ? 'html'
      : 'txt';
    
    const blob = new Blob([text], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isJson = useMemo(() => {
    if (typeof response?.data === 'object') return true;
    try {
      JSON.parse(response?.data);
      return true;
    } catch {
      return false;
    }
  }, [response?.data]);

  const isHtml = useMemo(() => {
    if (typeof response?.data !== 'string') return false;
    return response.data.trim().startsWith('<') && 
           (response.data.includes('<html') || response.data.includes('<body') || response.data.includes('<!DOCTYPE'));
  }, [response?.data]);

  const jsonData = useMemo(() => {
    if (!response?.data) return null;
    if (typeof response.data === 'object') return response.data;
    try {
      return JSON.parse(response.data);
    } catch {
      return null;
    }
  }, [response?.data]);

  if (!response) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg shadow-2xl border border-slate-700 p-6">
      {/* Header */}
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
              <span className="text-slate-400">
                Time: <span className="text-white font-semibold">{response.time}ms</span>
              </span>
              <span className="text-slate-400">
                Size: <span className="text-white font-semibold">{formatBytes(response.size)}</span>
              </span>
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
          {/* Main Tabs (Body/Headers/Cookies) */}
          <div className="border-b border-slate-700 mb-4">
            <div className="flex gap-6">
              <button
                onClick={() => setHeaderTab('body')}
                className={`pb-3 px-2 font-medium transition-colors flex items-center gap-2 ${
                  headerTab === 'body'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <FileJson size={16} />
                Body
              </button>
              <button
                onClick={() => setHeaderTab('headers')}
                className={`pb-3 px-2 font-medium transition-colors ${
                  headerTab === 'headers'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Headers
                <span className="ml-2 text-xs bg-slate-700 px-2 py-0.5 rounded">
                  {Object.keys(response.headers || {}).length}
                </span>
              </button>
              {response.cookies && (
                <button
                  onClick={() => setHeaderTab('cookies')}
                  className={`pb-3 px-2 font-medium transition-colors ${
                    headerTab === 'cookies'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Cookies
                </button>
              )}
            </div>
          </div>

          {/* Body Tab Content */}
          {headerTab === 'body' && (
            <>
              {/* View Mode Tabs */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('pretty')}
                    className={`px-3 py-1.5 text-sm rounded ${
                      activeTab === 'pretty'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pretty
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`px-3 py-1.5 text-sm rounded ${
                      activeTab === 'raw'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Raw
                  </button>
                  {(isHtml || response.headers?.['content-type']?.includes('html')) && (
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${
                        activeTab === 'preview'
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isJson && activeTab === 'pretty' && (
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search in response..."
                      className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    />
                  )}
                  <button
                    onClick={onCopy}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={downloadResponse}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                    title="Download response"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Pretty View (Collapsible JSON) */}
              {activeTab === 'pretty' && isJson && jsonData && (
                <div className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-[500px]">
                  <JsonTree 
                    data={jsonData} 
                    path="root"
                    expandedPaths={expandedPaths}
                    onToggle={(path) => {
                      const newExpanded = new Set(expandedPaths);
                      if (newExpanded.has(path)) {
                        newExpanded.delete(path);
                      } else {
                        newExpanded.add(path);
                      }
                      setExpandedPaths(newExpanded);
                    }}
                    searchQuery={searchQuery}
                  />
                </div>
              )}

              {/* Pretty View (Non-JSON) */}
              {activeTab === 'pretty' && !isJson && (
                <pre className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
                  <code className="text-slate-300">{response.data}</code>
                </pre>
              )}

              {/* Raw View */}
              {activeTab === 'raw' && (
                <pre className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-[500px] text-sm whitespace-pre-wrap break-all">
                  <code className="text-slate-300">
                    {typeof response.data === 'string' 
                      ? response.data 
                      : JSON.stringify(response.data)}
                  </code>
                </pre>
              )}

              {/* Preview View (HTML) */}
              {activeTab === 'preview' && (
                <div className="bg-white rounded-lg overflow-hidden max-h-[500px]">
                  <iframe
                    srcDoc={typeof response.data === 'string' ? response.data : ''}
                    title="Response Preview"
                    className="w-full h-[500px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </>
          )}

          {/* Headers Tab */}
          {headerTab === 'headers' && (
            <div className="bg-slate-900 p-4 rounded-lg max-h-96 overflow-auto">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex py-2 border-b border-slate-800 last:border-0">
                  <span className="text-blue-400 font-semibold w-1/3 font-mono text-sm">{key}</span>
                  <span className="text-slate-300 w-2/3 break-all font-mono text-sm">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Cookies Tab */}
          {headerTab === 'cookies' && response.cookies && (
            <div className="bg-slate-900 p-4 rounded-lg max-h-96 overflow-auto">
              {Object.entries(response.cookies).map(([key, value]) => (
                <div key={key} className="flex py-2 border-b border-slate-800 last:border-0">
                  <span className="text-purple-400 font-semibold w-1/3 font-mono text-sm">{key}</span>
                  <span className="text-slate-300 w-2/3 break-all font-mono text-sm">{value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Collapsible JSON Tree Component
function JsonTree({ data, path, expandedPaths, onToggle, searchQuery, depth = 0 }) {
  const isExpanded = expandedPaths.has(path);
  const isArray = Array.isArray(data);
  const isObject = data !== null && typeof data === 'object';
  
  // Highlight matching text
  const highlightText = (text) => {
    if (!searchQuery || typeof text !== 'string') return text;
    const index = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-500/30 text-yellow-300">{text.slice(index, index + searchQuery.length)}</span>
        {text.slice(index + searchQuery.length)}
      </>
    );
  };

  if (!isObject) {
    // Render primitive value
    const valueClass = 
      typeof data === 'string' ? 'text-green-400' :
      typeof data === 'number' ? 'text-blue-400' :
      typeof data === 'boolean' ? 'text-purple-400' :
      data === null ? 'text-gray-400' : 'text-slate-300';
    
    const displayValue = typeof data === 'string' ? `"${data}"` : String(data);
    
    return <span className={valueClass}>{highlightText(displayValue)}</span>;
  }

  const entries = Object.entries(data);
  const isEmpty = entries.length === 0;
  const brackets = isArray ? ['[', ']'] : ['{', '}'];

  if (isEmpty) {
    return <span className="text-slate-500">{brackets.join('')}</span>;
  }

  return (
    <div className="font-mono text-sm">
      <span
        onClick={() => onToggle(path)}
        className="cursor-pointer hover:bg-slate-800 inline-flex items-center"
      >
        {isExpanded ? (
          <ChevronDown size={14} className="text-slate-500" />
        ) : (
          <ChevronRight size={14} className="text-slate-500" />
        )}
        <span className="text-slate-500">{brackets[0]}</span>
        {!isExpanded && (
          <span className="text-slate-500 ml-1">
            {isArray ? `${entries.length} items` : `${entries.length} keys`}
          </span>
        )}
        {!isExpanded && <span className="text-slate-500">{brackets[1]}</span>}
      </span>

      {isExpanded && (
        <div className="ml-4 border-l border-slate-700 pl-2">
          {entries.map(([key, value], index) => (
            <div key={key} className="py-0.5">
              {!isArray && (
                <>
                  <span className="text-cyan-400">{highlightText(`"${key}"`)}</span>
                  <span className="text-slate-500">: </span>
                </>
              )}
              {isArray && (
                <span className="text-slate-600 mr-2">{index}</span>
              )}
              <JsonTree
                data={value}
                path={`${path}.${key}`}
                expandedPaths={expandedPaths}
                onToggle={onToggle}
                searchQuery={searchQuery}
                depth={depth + 1}
              />
              {index < entries.length - 1 && <span className="text-slate-500">,</span>}
            </div>
          ))}
        </div>
      )}
      {isExpanded && <span className="text-slate-500">{brackets[1]}</span>}
    </div>
  );
}
