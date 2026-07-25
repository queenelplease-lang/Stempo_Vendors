const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@stempo.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export const authProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    // Always use API login to get proper JWT token
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'Login failed');
    }

    // Store token and user data
    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user;
    
    if (!token) {
      throw new Error('No token received from server');
    }

    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return Promise.resolve();
  },

  checkError: ({ status }: any) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      return Promise.resolve();
    }
    return Promise.reject({ message: 'Not authenticated' });
  },

  getPermissions: () => Promise.resolve('admin'),
  getIdentity: () => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return Promise.resolve({
        id: user.id,
        fullName: user.name || user.email,
        avatar: user.avatarUrl,
      });
    }
    return Promise.reject();
  },
};
