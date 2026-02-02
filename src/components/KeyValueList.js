import React, { useState } from 'react';
import { Send, Plus, Trash2, Copy, Check } from 'lucide-react';
import { HeaderRow } from './HeaderRow';

// Key-Value List Component (for headers and params)
export function KeyValueList({ items, onUpdate, onRemove, onAdd, label }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <HeaderRow
          key={index}
          header={item}
          index={index}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded transition-colors"
      >
        <Plus size={18} />
        Add {label}
      </button>
    </div>
  );
}