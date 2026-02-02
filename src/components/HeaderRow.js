import React, { useState } from 'react';
import { Send, Plus, Trash2, Copy, Check } from 'lucide-react';

// Header Row Component
export function HeaderRow({ header, index, onUpdate, onRemove }) {
  return (
    <div className="flex gap-3 items-center">
      <input
        type="checkbox"
        checked={header.enabled}
        onChange={(e) => onUpdate(index, 'enabled', e.target.checked)}
        className="w-4 h-4 rounded"
      />
      <input
        type="text"
        value={header.key}
        onChange={(e) => onUpdate(index, 'key', e.target.value)}
        placeholder="Key"
        className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={header.value}
        onChange={(e) => onUpdate(index, 'value', e.target.value)}
        placeholder="Value"
        className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => onRemove(index)}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}