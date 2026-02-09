import api from './api';

const AuthService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login/', credentials);
        if (response.data.access) {
            console.log("Login successful. Storing tokens.");

            // Try LocalStorage
            try {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            } catch (e) { console.warn("LocalStorage write failed", e); }

            // Backup: SessionStorage (often more permissive)
            try {
                sessionStorage.setItem('access_token', response.data.access);
                sessionStorage.setItem('refresh_token', response.data.refresh);
                sessionStorage.setItem('user', JSON.stringify(response.data.user));
            } catch (e) { console.warn("SessionStorage write failed", e); }
        }
        return response.data;
    },

    logout: async () => {
        try {
            const refresh = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
            if (refresh) await api.post('/auth/logout/', { refresh });
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user');
        }
    },

    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) { return null; }
    },

    // Helper to get tokens for API
    getAccessToken: () => localStorage.getItem('access_token') || sessionStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token'),
};

export default AuthService;
