const getAuthBase = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env) return `${String(env).replace(/\/$/, '')}/api/auth`;
  return '/api/auth';
};

async function parseJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/**
 * @param {{ name: string; email: string; password: string; contactNumber?: string; address?: string }} body
 */
export async function registerUser(body) {
  const res = await fetch(`${getAuthBase()}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}

/**
 * @param {{ email: string; password: string }} body
 */
export async function loginUser(body) {
  const res = await fetch(`${getAuthBase()}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
}

/**
 * @param {{ token: string }} body
 */
export async function loginWithGoogle(body) {
  const res = await fetch(`${getAuthBase()}/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.message || 'Google login failed');
  }
  return data;
}

export const TOKEN_KEY = 'token';

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function requireToken() {
  const token = getAuthToken();
  if (!token) throw new Error('Not signed in');
  return token;
}

export async function fetchMyProfile() {
  const token = requireToken();
  const res = await fetch(`${getAuthBase()}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load profile');
  }
  return data.user;
}

/**
 * @param {{ name: string; email: string; contactNumber?: string; address?: string }} body
 */
export async function updateMyProfile(body) {
  const token = requireToken();
  const res = await fetch(`${getAuthBase()}/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return data.user;
}
