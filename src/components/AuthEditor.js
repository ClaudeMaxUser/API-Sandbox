import React from 'react';
import { Key, User, Lock, Hash } from 'lucide-react';

const AUTH_TYPES = [
  { value: 'none', label: 'No Auth', icon: null },
  { value: 'bearer', label: 'Bearer Token', icon: Key },
  { value: 'basic', label: 'Basic Auth', icon: User },
  { value: 'apikey', label: 'API Key', icon: Hash },
  { value: 'digest', label: 'Digest Auth', icon: Lock },
];

export function AuthEditor({ auth, onChange }) {
  const handleTypeChange = (type) => {
    const defaults = {
      none: {},
      bearer: { token: '' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
      digest: { username: '', password: '' },
    };
    onChange({ type, ...defaults[type] });
  };

  const updateField = (field, value) => {
    onChange({ ...auth, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Auth Type Selector */}
      <div className="flex flex-wrap gap-2">
        {AUTH_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleTypeChange(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              auth.type === value
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
            }`}
          >
            {Icon && <Icon size={16} />}
            {label}
          </button>
        ))}
      </div>

      {/* Auth Configuration */}
      <div className="mt-4">
        {auth.type === 'none' && (
          <div className="text-slate-400 text-sm p-4 bg-slate-700/50 rounded-lg">
            This request does not use any authorization.
          </div>
        )}

        {auth.type === 'bearer' && (
          <div className="space-y-3">
            <div className="text-sm text-slate-400 mb-2">
              The token will be sent as: <code className="bg-slate-700 px-2 py-1 rounded">Authorization: Bearer &lt;token&gt;</code>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Token</label>
              <input
                type="password"
                value={auth.token || ''}
                onChange={(e) => updateField('token', e.target.value)}
                placeholder="Enter your bearer token"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div className="text-xs text-slate-500">
              Tip: Use environment variables like <code className="bg-slate-700 px-1 rounded">{'{{token}}'}</code>
            </div>
          </div>
        )}

        {auth.type === 'basic' && (
          <div className="space-y-3">
            <div className="text-sm text-slate-400 mb-2">
              Credentials will be Base64 encoded and sent as: <code className="bg-slate-700 px-2 py-1 rounded">Authorization: Basic &lt;credentials&gt;</code>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={auth.username || ''}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={auth.password || ''}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {auth.type === 'apikey' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Key</label>
                <input
                  type="text"
                  value={auth.key || ''}
                  onChange={(e) => updateField('key', e.target.value)}
                  placeholder="e.g., X-API-Key"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Value</label>
                <input
                  type="password"
                  value={auth.value || ''}
                  onChange={(e) => updateField('value', e.target.value)}
                  placeholder="Your API key"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Add to</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="apiKeyLocation"
                    checked={auth.addTo === 'header'}
                    onChange={() => updateField('addTo', 'header')}
                    className="text-blue-500"
                  />
                  <span className="text-slate-300">Header</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="apiKeyLocation"
                    checked={auth.addTo === 'query'}
                    onChange={() => updateField('addTo', 'query')}
                    className="text-blue-500"
                  />
                  <span className="text-slate-300">Query Params</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {auth.type === 'digest' && (
          <div className="space-y-3">
            <div className="text-sm text-slate-400 mb-2">
              Digest authentication requires a server challenge. The credentials will be used to respond to the WWW-Authenticate challenge.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={auth.username || ''}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={auth.password || ''}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded">
              Note: Digest auth has limited browser support. Consider using a proxy for full support.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Generate auth headers/params from auth config
 * @param {Object} auth - Auth configuration
 * @returns {{headers: Array, params: Array}} - Headers and params to add
 */
export function generateAuthConfig(auth) {
  const headers = [];
  const params = [];

  if (!auth || auth.type === 'none') {
    return { headers, params };
  }

  switch (auth.type) {
    case 'bearer':
      if (auth.token) {
        headers.push({
          key: 'Authorization',
          value: `Bearer ${auth.token}`,
          enabled: true,
          isAuth: true,
        });
      }
      break;

    case 'basic':
      if (auth.username || auth.password) {
        const credentials = btoa(`${auth.username || ''}:${auth.password || ''}`);
        headers.push({
          key: 'Authorization',
          value: `Basic ${credentials}`,
          enabled: true,
          isAuth: true,
        });
      }
      break;

    case 'apikey':
      if (auth.key && auth.value) {
        if (auth.addTo === 'query') {
          params.push({
            key: auth.key,
            value: auth.value,
            enabled: true,
            isAuth: true,
          });
        } else {
          headers.push({
            key: auth.key,
            value: auth.value,
            enabled: true,
            isAuth: true,
          });
        }
      }
      break;

    case 'digest':
      // Digest auth is handled by the browser/server challenge-response
      // We'll just store the credentials for now
      break;

    default:
      break;
  }

  return { headers, params };
}
