// Variable interpolation for {{variable}} syntax

/**
 * Replace all {{variable}} patterns with values from the environment
 * @param {string} text - Text containing {{variable}} patterns
 * @param {Object} variables - Key-value object of variables
 * @returns {string} - Text with variables replaced
 */
export const interpolate = (text, variables = {}) => {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    if (variables.hasOwnProperty(varName)) {
      return variables[varName];
    }
    // Return original if variable not found
    return match;
  });
};

/**
 * Convert environment variable array to object for easy lookup
 * @param {Array} envVariables - Array of {key, value, secret} objects
 * @returns {Object} - Key-value object
 */
export const envToObject = (envVariables = []) => {
  return envVariables.reduce((acc, { key, value }) => {
    if (key) acc[key] = value;
    return acc;
  }, {});
};

/**
 * Interpolate all string values in an object (shallow)
 * @param {Object} obj - Object with string values
 * @param {Object} variables - Variables to interpolate
 * @returns {Object} - Object with interpolated values
 */
export const interpolateObject = (obj, variables) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[interpolate(key, variables)] = interpolate(value, variables);
  }
  return result;
};

/**
 * Interpolate all items in a key-value array
 * @param {Array} items - Array of {key, value, enabled} objects
 * @param {Object} variables - Variables to interpolate
 * @returns {Array} - Array with interpolated values
 */
export const interpolateKeyValueArray = (items, variables) => {
  return items.map(item => ({
    ...item,
    key: interpolate(item.key, variables),
    value: interpolate(item.value, variables),
  }));
};

/**
 * Find all variables used in a text
 * @param {string} text - Text to search
 * @returns {Array} - Array of variable names found
 */
export const findVariables = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  return [...new Set([...matches].map(m => m[1]))];
};

/**
 * Find all variables used in a request
 * @param {Object} request - Request object
 * @returns {Array} - Array of unique variable names
 */
export const findVariablesInRequest = (request) => {
  const allText = [
    request.url || '',
    request.body || '',
    ...(request.headers || []).flatMap(h => [h.key || '', h.value || '']),
    ...(request.params || []).flatMap(p => [p.key || '', p.value || '']),
  ].join(' ');
  
  return findVariables(allText);
};

/**
 * Highlight variables in text for display
 * @param {string} text - Text with variables
 * @param {Object} variables - Available variables (for coloring found/missing)
 * @returns {Array} - Array of {text, isVariable, found} segments
 */
export const highlightVariables = (text, variables = {}) => {
  if (!text) return [{ text: '', isVariable: false }];
  
  const segments = [];
  let lastIndex = 0;
  const regex = /\{\{(\w+)\}\}/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the variable
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isVariable: false,
      });
    }
    
    // Add the variable
    segments.push({
      text: match[0],
      isVariable: true,
      varName: match[1],
      found: variables.hasOwnProperty(match[1]),
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isVariable: false,
    });
  }
  
  return segments.length ? segments : [{ text, isVariable: false }];
};
