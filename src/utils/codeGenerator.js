// Generate code snippets for various languages/libraries

/**
 * Generate cURL command from request
 * @param {Object} request - Request configuration
 * @returns {string} - cURL command
 */
export const generateCurl = (request) => {
  const { method, url, headers, params, body, bodyType } = request;
  const parts = ['curl'];

  // Method
  if (method !== 'GET') {
    parts.push(`-X ${method}`);
  }

  // URL with params
  let finalUrl = url;
  const enabledParams = (params || []).filter(p => p.enabled && p.key);
  if (enabledParams.length > 0) {
    const urlObj = new URL(url);
    enabledParams.forEach(p => urlObj.searchParams.append(p.key, p.value));
    finalUrl = urlObj.toString();
  }
  parts.push(`'${finalUrl}'`);

  // Headers
  const enabledHeaders = (headers || []).filter(h => h.enabled && h.key);
  enabledHeaders.forEach(h => {
    parts.push(`-H '${h.key}: ${h.value}'`);
  });

  // Body
  if (body && method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'form') {
      // Parse form fields
      const formPairs = body.split('&').filter(Boolean);
      formPairs.forEach(pair => {
        parts.push(`--data-urlencode '${pair}'`);
      });
    } else if (bodyType === 'multipart') {
      parts.push(`-F 'data=${body}'`);
    } else {
      // Escape single quotes in body
      const escapedBody = body.replace(/'/g, "'\\''");
      parts.push(`-d '${escapedBody}'`);
    }
  }

  return parts.join(' \\\n  ');
};

/**
 * Generate JavaScript fetch code
 * @param {Object} request - Request configuration
 * @returns {string} - JavaScript code
 */
export const generateFetch = (request) => {
  const { method, url, headers, params, body, bodyType } = request;

  // Build URL with params
  let urlCode = `'${url}'`;
  const enabledParams = (params || []).filter(p => p.enabled && p.key);
  if (enabledParams.length > 0) {
    urlCode = `\`${url}?\${new URLSearchParams(${JSON.stringify(
      enabledParams.reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {})
    )})}\``;
  }

  // Build headers object
  const enabledHeaders = (headers || []).filter(h => h.enabled && h.key);
  const headersObj = enabledHeaders.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

  // Build options
  const options = { method };
  
  if (Object.keys(headersObj).length > 0) {
    options.headers = headersObj;
  }

  let bodyCode = '';
  if (body && method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'json') {
      bodyCode = `  body: JSON.stringify(${body}),\n`;
    } else if (bodyType === 'form') {
      bodyCode = `  body: new URLSearchParams(${JSON.stringify(
        Object.fromEntries(new URLSearchParams(body))
      )}),\n`;
    } else {
      bodyCode = `  body: ${JSON.stringify(body)},\n`;
    }
  }

  const code = `const response = await fetch(${urlCode}, {
  method: '${method}',
${Object.keys(headersObj).length > 0 ? `  headers: ${JSON.stringify(headersObj, null, 4).replace(/\n/g, '\n  ')},\n` : ''}${bodyCode}});

const data = await response.json();
console.log(data);`;

  return code;
};

/**
 * Generate Axios code
 * @param {Object} request - Request configuration
 * @returns {string} - JavaScript code using axios
 */
export const generateAxios = (request) => {
  const { method, url, headers, params, body, bodyType } = request;

  const enabledParams = (params || []).filter(p => p.enabled && p.key);
  const paramsObj = enabledParams.reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {});

  const enabledHeaders = (headers || []).filter(h => h.enabled && h.key);
  const headersObj = enabledHeaders.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

  const config = {};
  if (Object.keys(paramsObj).length > 0) config.params = paramsObj;
  if (Object.keys(headersObj).length > 0) config.headers = headersObj;

  let dataArg = '';
  if (body && method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'json') {
      dataArg = `, ${body}`;
    } else {
      dataArg = `, ${JSON.stringify(body)}`;
    }
  }

  const configArg = Object.keys(config).length > 0 
    ? `, ${JSON.stringify(config, null, 2)}` 
    : '';

  const code = `const axios = require('axios');

const response = await axios.${method.toLowerCase()}('${url}'${dataArg}${configArg});

console.log(response.data);`;

  return code;
};

/**
 * Generate Python requests code
 * @param {Object} request - Request configuration
 * @returns {string} - Python code
 */
export const generatePython = (request) => {
  const { method, url, headers, params, body, bodyType } = request;

  const enabledParams = (params || []).filter(p => p.enabled && p.key);
  const enabledHeaders = (headers || []).filter(h => h.enabled && h.key);

  let code = `import requests\n\n`;
  code += `url = "${url}"\n`;

  if (enabledHeaders.length > 0) {
    code += `headers = {\n`;
    enabledHeaders.forEach((h, i) => {
      code += `    "${h.key}": "${h.value}"${i < enabledHeaders.length - 1 ? ',' : ''}\n`;
    });
    code += `}\n`;
  }

  if (enabledParams.length > 0) {
    code += `params = {\n`;
    enabledParams.forEach((p, i) => {
      code += `    "${p.key}": "${p.value}"${i < enabledParams.length - 1 ? ',' : ''}\n`;
    });
    code += `}\n`;
  }

  if (body && method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'json') {
      code += `json_data = ${body}\n`;
    } else {
      code += `data = """${body}"""\n`;
    }
  }

  code += `\nresponse = requests.${method.toLowerCase()}(\n    url`;
  if (enabledHeaders.length > 0) code += `,\n    headers=headers`;
  if (enabledParams.length > 0) code += `,\n    params=params`;
  if (body && method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'json') {
      code += `,\n    json=json_data`;
    } else {
      code += `,\n    data=data`;
    }
  }
  code += `\n)\n\nprint(response.json())`;

  return code;
};

/**
 * Generate Node.js (native) code
 * @param {Object} request - Request configuration
 * @returns {string} - Node.js code
 */
export const generateNodejs = (request) => {
  const { method, url, headers, params, body } = request;

  let urlWithParams = url;
  const enabledParams = (params || []).filter(p => p.enabled && p.key);
  if (enabledParams.length > 0) {
    const urlObj = new URL(url);
    enabledParams.forEach(p => urlObj.searchParams.append(p.key, p.value));
    urlWithParams = urlObj.toString();
  }

  const enabledHeaders = (headers || []).filter(h => h.enabled && h.key);
  const headersObj = enabledHeaders.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

  const code = `const https = require('https');

const options = {
  method: '${method}',
  headers: ${JSON.stringify(headersObj, null, 4)}
};

const req = https.request('${urlWithParams}', options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error(error);
});
${body && method !== 'GET' && method !== 'HEAD' ? `\nreq.write(${JSON.stringify(body)});` : ''}
req.end();`;

  return code;
};

/**
 * Generate PHP code
 * @param {Object} request - Request configuration
 * @returns {string} - PHP code
 */
export const generatePHP = (request) => {
  const { method, url, headers, params, body } = request;

  let urlWithParams = url;
  const enabledParams = (params || []).filter(p => p.enabled && p.key);
  if (enabledParams.length > 0) {
    const urlObj = new URL(url);
    enabledParams.forEach(p => urlObj.searchParams.append(p.key, p.value));
    urlWithParams = urlObj.toString();
  }

  const enabledHeaders = (headers || []).filter(h => h.enabled && h.key);

  let code = `<?php\n\n$curl = curl_init();\n\n`;
  code += `curl_setopt_array($curl, [\n`;
  code += `    CURLOPT_URL => "${urlWithParams}",\n`;
  code += `    CURLOPT_RETURNTRANSFER => true,\n`;
  code += `    CURLOPT_CUSTOMREQUEST => "${method}",\n`;
  
  if (enabledHeaders.length > 0) {
    code += `    CURLOPT_HTTPHEADER => [\n`;
    enabledHeaders.forEach(h => {
      code += `        "${h.key}: ${h.value}",\n`;
    });
    code += `    ],\n`;
  }
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    code += `    CURLOPT_POSTFIELDS => '${body.replace(/'/g, "\\'")}',\n`;
  }
  
  code += `]);\n\n`;
  code += `$response = curl_exec($curl);\n`;
  code += `curl_close($curl);\n\n`;
  code += `echo $response;\n?>`;

  return code;
};

/**
 * All available code generators
 */
export const CODE_GENERATORS = {
  curl: { name: 'cURL', generate: generateCurl, language: 'bash' },
  fetch: { name: 'JavaScript - Fetch', generate: generateFetch, language: 'javascript' },
  axios: { name: 'JavaScript - Axios', generate: generateAxios, language: 'javascript' },
  python: { name: 'Python - Requests', generate: generatePython, language: 'python' },
  nodejs: { name: 'Node.js - Native', generate: generateNodejs, language: 'javascript' },
  php: { name: 'PHP - cURL', generate: generatePHP, language: 'php' },
};
