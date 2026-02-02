import React from 'react';
import { Settings, Info } from 'lucide-react';

export function RequestSettings({ settings, onChange }) {
  const updateSetting = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 flex items-center gap-2 mb-4">
        <Settings size={16} />
        Request Configuration
      </div>

      {/* Timeout */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-slate-300">Request Timeout</label>
          <p className="text-xs text-slate-500">Maximum time to wait for a response</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={settings.timeout || 30000}
            onChange={(e) => updateSetting('timeout', parseInt(e.target.value) || 30000)}
            min={1000}
            max={300000}
            step={1000}
            className="w-24 px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-400">ms</span>
        </div>
      </div>

      {/* Cache Mode */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-slate-300">Cache Mode</label>
          <p className="text-xs text-slate-500">How to handle browser caching</p>
        </div>
        <select
          value={settings.cacheMode || 'default'}
          onChange={(e) => updateSetting('cacheMode', e.target.value)}
          className="px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default</option>
          <option value="no-store">No Store (Fresh)</option>
          <option value="no-cache">No Cache (Validate)</option>
          <option value="force-cache">Force Cache</option>
          <option value="only-if-cached">Only If Cached</option>
        </select>
      </div>

      {/* Redirect Mode */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-slate-300">Follow Redirects</label>
          <p className="text-xs text-slate-500">Automatically follow HTTP redirects</p>
        </div>
        <select
          value={settings.redirect || 'follow'}
          onChange={(e) => updateSetting('redirect', e.target.value)}
          className="px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="follow">Follow</option>
          <option value="manual">Manual</option>
          <option value="error">Error on Redirect</option>
        </select>
      </div>

      {/* Credentials Mode */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-slate-300">Credentials</label>
          <p className="text-xs text-slate-500">Include cookies with requests</p>
        </div>
        <select
          value={settings.credentials || 'same-origin'}
          onChange={(e) => updateSetting('credentials', e.target.value)}
          className="px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="omit">Omit</option>
          <option value="same-origin">Same Origin</option>
          <option value="include">Include (All)</option>
        </select>
      </div>

      {/* CORS Mode */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-slate-300">CORS Mode</label>
          <p className="text-xs text-slate-500">Cross-origin request behavior</p>
        </div>
        <select
          value={settings.mode || 'cors'}
          onChange={(e) => updateSetting('mode', e.target.value)}
          className="px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cors">CORS</option>
          <option value="no-cors">No CORS</option>
          <option value="same-origin">Same Origin</option>
        </select>
      </div>

      {/* Max Response Size */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-slate-300">Max Response Size</label>
          <p className="text-xs text-slate-500">Limit response body size</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={(settings.maxResponseSize || 10485760) / 1048576}
            onChange={(e) => updateSetting('maxResponseSize', (parseFloat(e.target.value) || 10) * 1048576)}
            min={1}
            max={100}
            step={1}
            className="w-20 px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-400">MB</span>
        </div>
      </div>

      {/* SSL Verification Note */}
      <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-1">Browser Limitations</p>
            <ul className="space-y-1">
              <li>• SSL certificate verification cannot be disabled in browsers</li>
              <li>• Some headers (Host, User-Agent) may be restricted</li>
              <li>• CORS policies are enforced by the browser</li>
              <li>• Consider using a proxy server for full control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Build fetch options from settings
 * @param {Object} settings - Request settings
 * @returns {Object} - Fetch options
 */
export function buildFetchOptions(settings = {}) {
  const options = {};

  if (settings.cacheMode) {
    options.cache = settings.cacheMode;
  }

  if (settings.redirect) {
    options.redirect = settings.redirect;
  }

  if (settings.credentials) {
    options.credentials = settings.credentials;
  }

  if (settings.mode) {
    options.mode = settings.mode;
  }

  return options;
}

/**
 * Create abort controller with timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {{controller: AbortController, timeoutId: number}}
 */
export function createTimeoutController(timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return {
    controller,
    timeoutId,
    clear: () => clearTimeout(timeoutId),
  };
}
