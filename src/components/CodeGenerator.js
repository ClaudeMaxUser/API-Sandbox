import React, { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { CODE_GENERATORS } from '../utils/codeGenerator';

export function CodeGeneratorModal({ request, onClose }) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [copied, setCopied] = useState(false);

  const generator = CODE_GENERATORS[selectedLanguage];
  const code = generator ? generator.generate(request) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Code size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Code Snippet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="px-6 py-3 border-b border-slate-700 flex gap-2 flex-wrap">
          {Object.entries(CODE_GENERATORS).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setSelectedLanguage(key)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedLanguage === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Code Display */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors z-10"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-auto text-sm">
              <code className={`text-slate-300 language-${generator?.language || 'text'}`}>
                {code}
              </code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Copy this code to use in your application
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Button component to trigger the modal
export function CodeButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
      title="Generate Code Snippet"
    >
      <Code size={16} />
      Code
    </button>
  );
}
