const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// LoadingProvider registers itself here so that every request made through
// this module — from any page, public/student/admin — automatically shows
// the global loading spinner, without each page having to wire it up itself.
let onRequestStart = () => {};
let onRequestEnd = () => {};

export function registerLoadingHandlers(startHandler, endHandler) {
  onRequestStart = startHandler || (() => {});
  onRequestEnd = endHandler || (() => {});
}

async function request(path, { method = 'GET', body, token, silent = false } = {}) {
  if (!silent) onRequestStart();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.error) || 'Request failed');
    return data;
  } finally {
    if (!silent) onRequestEnd();
  }
}

export const api = {
  get: (path, token, opts) => request(path, { token, ...opts }),
  post: (path, body, token, opts) => request(path, { method: 'POST', body, token, ...opts }),
  put: (path, body, token, opts) => request(path, { method: 'PUT', body, token, ...opts }),
  del: (path, token, opts) => request(path, { method: 'DELETE', token, ...opts }),
  // For file uploads: takes a FormData instance directly and lets the
  // browser set the multipart Content-Type header (with boundary) itself —
  // setting it manually breaks the upload.
  upload: async (path, formData, token, opts = {}) => {
    if (!opts.silent) onRequestStart();
    try {
      const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const data = res.status === 204 ? null : await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.error) || 'Upload failed');
      return data;
    } finally {
      if (!opts.silent) onRequestEnd();
    }
  },
};
