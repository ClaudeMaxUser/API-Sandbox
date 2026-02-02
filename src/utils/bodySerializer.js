// Body serialization for different content types

/**
 * Serialize request body based on body type
 * @param {string} body - Raw body content
 * @param {string} bodyType - Type of body (json, text, xml, form, multipart, graphql)
 * @param {Object} formFields - For form/multipart: array of {key, value, type, file}
 * @param {Object} graphqlData - For graphql: {query, variables}
 * @returns {{body: any, contentType: string}} - Serialized body and content type
 */
export const serializeBody = (body, bodyType, formFields = [], graphqlData = null) => {
  switch (bodyType) {
    case 'json':
      return {
        body: body,
        contentType: 'application/json',
      };

    case 'text':
      return {
        body: body,
        contentType: 'text/plain',
      };

    case 'xml':
      return {
        body: body,
        contentType: 'application/xml',
      };

    case 'html':
      return {
        body: body,
        contentType: 'text/html',
      };

    case 'form':
      return serializeUrlEncoded(formFields);

    case 'multipart':
      return serializeMultipart(formFields);

    case 'graphql':
      return serializeGraphQL(graphqlData || { query: body, variables: '' });

    case 'binary':
      return {
        body: body, // Should be ArrayBuffer or Blob
        contentType: 'application/octet-stream',
      };

    default:
      return {
        body: body,
        contentType: 'text/plain',
      };
  }
};

/**
 * Serialize URL-encoded form data
 * @param {Array} fields - Array of {key, value, enabled}
 * @returns {{body: string, contentType: string}}
 */
export const serializeUrlEncoded = (fields) => {
  const params = new URLSearchParams();
  
  fields
    .filter(f => f.enabled !== false && f.key)
    .forEach(f => params.append(f.key, f.value || ''));

  return {
    body: params.toString(),
    contentType: 'application/x-www-form-urlencoded',
  };
};

/**
 * Serialize multipart form data
 * @param {Array} fields - Array of {key, value, enabled, type, file}
 * @returns {{body: FormData, contentType: null}} - contentType null lets browser set it with boundary
 */
export const serializeMultipart = (fields) => {
  const formData = new FormData();

  fields
    .filter(f => f.enabled !== false && f.key)
    .forEach(f => {
      if (f.type === 'file' && f.file) {
        formData.append(f.key, f.file, f.file.name);
      } else {
        formData.append(f.key, f.value || '');
      }
    });

  return {
    body: formData,
    contentType: null, // Browser sets multipart/form-data with boundary
  };
};

/**
 * Serialize GraphQL request
 * @param {{query: string, variables: string}} data - GraphQL query and variables
 * @returns {{body: string, contentType: string}}
 */
export const serializeGraphQL = (data) => {
  let variables = {};
  
  if (data.variables) {
    try {
      variables = JSON.parse(data.variables);
    } catch (e) {
      // If variables aren't valid JSON, send as empty object
      console.warn('Invalid GraphQL variables JSON:', e);
    }
  }

  return {
    body: JSON.stringify({
      query: data.query,
      variables,
    }),
    contentType: 'application/json',
  };
};

/**
 * Parse URL-encoded string to field array
 * @param {string} encoded - URL-encoded string
 * @returns {Array} - Array of {key, value, enabled}
 */
export const parseUrlEncoded = (encoded) => {
  if (!encoded) return [];
  
  const params = new URLSearchParams(encoded);
  const fields = [];
  
  params.forEach((value, key) => {
    fields.push({ key, value, enabled: true });
  });
  
  return fields;
};

/**
 * Validate JSON body
 * @param {string} body - JSON string
 * @returns {{valid: boolean, error: string|null, formatted: string|null}}
 */
export const validateJSON = (body) => {
  if (!body || !body.trim()) {
    return { valid: true, error: null, formatted: '' };
  }
  
  try {
    const parsed = JSON.parse(body);
    return {
      valid: true,
      error: null,
      formatted: JSON.stringify(parsed, null, 2),
    };
  } catch (e) {
    return {
      valid: false,
      error: e.message,
      formatted: null,
    };
  }
};

/**
 * Get placeholder text for body type
 * @param {string} bodyType - Type of body
 * @returns {string} - Placeholder text
 */
export const getBodyPlaceholder = (bodyType) => {
  const placeholders = {
    json: '{\n  "key": "value"\n}',
    text: 'Enter plain text...',
    xml: '<?xml version="1.0"?>\n<root>\n  <element>value</element>\n</root>',
    html: '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>',
    graphql: 'query {\n  users {\n    id\n    name\n  }\n}',
  };
  
  return placeholders[bodyType] || 'Enter request body...';
};

/**
 * Get content type options for body type selector
 */
export const BODY_TYPE_OPTIONS = [
  { value: 'none', label: 'None', contentType: null },
  { value: 'json', label: 'JSON', contentType: 'application/json' },
  { value: 'text', label: 'Text', contentType: 'text/plain' },
  { value: 'xml', label: 'XML', contentType: 'application/xml' },
  { value: 'html', label: 'HTML', contentType: 'text/html' },
  { value: 'form', label: 'x-www-form-urlencoded', contentType: 'application/x-www-form-urlencoded' },
  { value: 'multipart', label: 'form-data', contentType: 'multipart/form-data' },
  { value: 'graphql', label: 'GraphQL', contentType: 'application/json' },
  { value: 'binary', label: 'Binary', contentType: 'application/octet-stream' },
];
