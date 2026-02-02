import React, { useState } from 'react';
import { Plus, Trash2, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TEST_TYPES = [
  { value: 'status_equals', label: 'Status equals', placeholder: '200' },
  { value: 'status_not_equals', label: 'Status not equals', placeholder: '404' },
  { value: 'status_in_range', label: 'Status in range', placeholder: '200-299' },
  { value: 'response_time_less', label: 'Response time less than (ms)', placeholder: '1000' },
  { value: 'body_contains', label: 'Body contains', placeholder: 'success' },
  { value: 'body_not_contains', label: 'Body does not contain', placeholder: 'error' },
  { value: 'json_path_exists', label: 'JSON path exists', placeholder: '$.data.id' },
  { value: 'json_path_equals', label: 'JSON path equals', placeholder: '$.status|success' },
  { value: 'header_exists', label: 'Header exists', placeholder: 'Content-Type' },
  { value: 'header_equals', label: 'Header equals', placeholder: 'Content-Type|application/json' },
  { value: 'body_is_json', label: 'Body is valid JSON', placeholder: '' },
  { value: 'body_is_array', label: 'Body is array', placeholder: '' },
  { value: 'body_array_length', label: 'Body array length equals', placeholder: '10' },
  { value: 'body_array_min_length', label: 'Body array min length', placeholder: '1' },
];

export function TestEditor({ tests, onChange, response }) {
  const [testResults, setTestResults] = useState([]);

  const addTest = () => {
    onChange([
      ...tests,
      { id: Date.now().toString(), type: 'status_equals', value: '200', enabled: true },
    ]);
  };

  const updateTest = (index, field, value) => {
    const newTests = [...tests];
    newTests[index] = { ...newTests[index], [field]: value };
    onChange(newTests);
  };

  const removeTest = (index) => {
    onChange(tests.filter((_, i) => i !== index));
  };

  const runTests = () => {
    if (!response) {
      setTestResults(tests.map(t => ({ id: t.id, status: 'skipped', message: 'No response' })));
      return;
    }

    const results = tests
      .filter(t => t.enabled)
      .map(test => runSingleTest(test, response));
    
    setTestResults(results);
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const skippedTests = testResults.filter(r => r.status === 'skipped').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Tests help verify your API responses automatically
        </div>
        <div className="flex items-center gap-2">
          {testResults.length > 0 && (
            <div className="flex items-center gap-3 text-sm mr-4">
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle size={14} /> {passedTests}
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <XCircle size={14} /> {failedTests}
              </span>
              {skippedTests > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <AlertCircle size={14} /> {skippedTests}
                </span>
              )}
            </div>
          )}
          <button
            onClick={runTests}
            disabled={tests.length === 0 || !response}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded"
          >
            <Play size={14} />
            Run Tests
          </button>
        </div>
      </div>

      {/* Test List */}
      <div className="space-y-2">
        {tests.map((test, index) => {
          const testResult = testResults.find(r => r.id === test.id);
          const testType = TEST_TYPES.find(t => t.value === test.type);
          
          return (
            <div
              key={test.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                testResult?.status === 'passed'
                  ? 'bg-green-500/10 border-green-500/30'
                  : testResult?.status === 'failed'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={test.enabled}
                onChange={(e) => updateTest(index, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              
              <select
                value={test.type}
                onChange={(e) => updateTest(index, 'type', e.target.value)}
                className="px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TEST_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {testType?.placeholder && (
                <input
                  type="text"
                  value={test.value || ''}
                  onChange={(e) => updateTest(index, 'value', e.target.value)}
                  placeholder={testType.placeholder}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              )}

              {testResult && (
                <div className="flex items-center gap-2 min-w-0">
                  {testResult.status === 'passed' ? (
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  ) : testResult.status === 'failed' ? (
                    <XCircle size={16} className="text-red-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs truncate ${
                    testResult.status === 'passed' ? 'text-green-400' :
                    testResult.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {testResult.message}
                  </span>
                </div>
              )}

              <button
                onClick={() => removeTest(index)}
                className="p-1 text-red-400 hover:text-red-300 flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={addTest}
        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded"
      >
        <Plus size={16} />
        Add Test
      </button>

      {/* Quick Add Presets */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 mb-2">Quick Add:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Success (2xx)', tests: [{ type: 'status_in_range', value: '200-299' }] },
            { label: 'Is JSON', tests: [{ type: 'body_is_json', value: '' }] },
            { label: 'Fast Response', tests: [{ type: 'response_time_less', value: '500' }] },
            { label: 'Has Data', tests: [{ type: 'json_path_exists', value: '$.data' }] },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                const newTests = preset.tests.map(t => ({
                  ...t,
                  id: Date.now().toString() + Math.random(),
                  enabled: true,
                }));
                onChange([...tests, ...newTests]);
              }}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Run a single test against a response
 * @param {Object} test - Test configuration
 * @param {Object} response - Response object
 * @returns {Object} - Test result
 */
function runSingleTest(test, response) {
  const result = { id: test.id, status: 'passed', message: '' };

  try {
    const body = response.data;
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

    switch (test.type) {
      case 'status_equals':
        if (response.status !== parseInt(test.value)) {
          result.status = 'failed';
          result.message = `Expected ${test.value}, got ${response.status}`;
        } else {
          result.message = `Status is ${test.value}`;
        }
        break;

      case 'status_not_equals':
        if (response.status === parseInt(test.value)) {
          result.status = 'failed';
          result.message = `Status should not be ${test.value}`;
        } else {
          result.message = `Status is not ${test.value}`;
        }
        break;

      case 'status_in_range':
        const [min, max] = test.value.split('-').map(Number);
        if (response.status < min || response.status > max) {
          result.status = 'failed';
          result.message = `Status ${response.status} not in range ${min}-${max}`;
        } else {
          result.message = `Status ${response.status} in range`;
        }
        break;

      case 'response_time_less':
        if (response.time >= parseInt(test.value)) {
          result.status = 'failed';
          result.message = `Response time ${response.time}ms >= ${test.value}ms`;
        } else {
          result.message = `Response time ${response.time}ms < ${test.value}ms`;
        }
        break;

      case 'body_contains':
        if (!bodyString.includes(test.value)) {
          result.status = 'failed';
          result.message = `Body does not contain "${test.value}"`;
        } else {
          result.message = `Body contains "${test.value}"`;
        }
        break;

      case 'body_not_contains':
        if (bodyString.includes(test.value)) {
          result.status = 'failed';
          result.message = `Body contains "${test.value}"`;
        } else {
          result.message = `Body does not contain "${test.value}"`;
        }
        break;

      case 'json_path_exists':
        const pathValue = getJsonPath(body, test.value);
        if (pathValue === undefined) {
          result.status = 'failed';
          result.message = `Path "${test.value}" not found`;
        } else {
          result.message = `Path "${test.value}" exists`;
        }
        break;

      case 'json_path_equals':
        const [path, expected] = test.value.split('|');
        const actual = getJsonPath(body, path);
        if (String(actual) !== expected) {
          result.status = 'failed';
          result.message = `Expected "${expected}", got "${actual}"`;
        } else {
          result.message = `Path equals "${expected}"`;
        }
        break;

      case 'header_exists':
        if (!response.headers[test.value.toLowerCase()]) {
          result.status = 'failed';
          result.message = `Header "${test.value}" not found`;
        } else {
          result.message = `Header "${test.value}" exists`;
        }
        break;

      case 'header_equals':
        const [headerName, headerValue] = test.value.split('|');
        const actualHeader = response.headers[headerName.toLowerCase()];
        if (actualHeader !== headerValue) {
          result.status = 'failed';
          result.message = `Header "${headerName}" is "${actualHeader}"`;
        } else {
          result.message = `Header equals "${headerValue}"`;
        }
        break;

      case 'body_is_json':
        try {
          if (typeof body === 'string') JSON.parse(body);
          result.message = 'Body is valid JSON';
        } catch {
          result.status = 'failed';
          result.message = 'Body is not valid JSON';
        }
        break;

      case 'body_is_array':
        if (!Array.isArray(body)) {
          result.status = 'failed';
          result.message = 'Body is not an array';
        } else {
          result.message = 'Body is an array';
        }
        break;

      case 'body_array_length':
        if (!Array.isArray(body) || body.length !== parseInt(test.value)) {
          result.status = 'failed';
          result.message = `Array length is ${Array.isArray(body) ? body.length : 'N/A'}`;
        } else {
          result.message = `Array length is ${test.value}`;
        }
        break;

      case 'body_array_min_length':
        if (!Array.isArray(body) || body.length < parseInt(test.value)) {
          result.status = 'failed';
          result.message = `Array length ${Array.isArray(body) ? body.length : 0} < ${test.value}`;
        } else {
          result.message = `Array has >= ${test.value} items`;
        }
        break;

      default:
        result.status = 'skipped';
        result.message = 'Unknown test type';
    }
  } catch (error) {
    result.status = 'failed';
    result.message = error.message;
  }

  return result;
}

/**
 * Simple JSON path getter (supports $.path.to.value syntax)
 * @param {Object} obj - Object to query
 * @param {string} path - JSON path (e.g., $.data.id)
 * @returns {any} - Value at path or undefined
 */
function getJsonPath(obj, path) {
  if (!path || !obj) return undefined;
  
  const parts = path.replace(/^\$\.?/, '').split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    
    // Handle array index
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      current = current[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
    } else {
      current = current[part];
    }
  }
  
  return current;
}

/**
 * Run all tests and return results
 * @param {Array} tests - Array of test configurations
 * @param {Object} response - Response object
 * @returns {Array} - Array of test results
 */
export function runAllTests(tests, response) {
  if (!response) {
    return tests.map(t => ({ id: t.id, status: 'skipped', message: 'No response' }));
  }

  return tests
    .filter(t => t.enabled)
    .map(test => runSingleTest(test, response));
}
