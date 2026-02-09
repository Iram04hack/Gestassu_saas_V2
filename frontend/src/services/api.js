import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy handles redirection to backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor pour ajouter le token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Flag to track if a refresh is in progress
let isRefreshing = false;
// Queue to hold requests while refreshing
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Interceptor pour gérer l'expiration du token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error.response exists (it might be undefined for Network Errors)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                // If refreshing, return a promise that resolves when the token is refreshed
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

                if (!refreshToken) {
                    console.warn("No refresh token found, logging out.");
                    localStorage.clear();
                    sessionStorage.clear(); // Ensure clean slate
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Tenter de rafraîchir le token
                const response = await axios.post('/api/auth/token/refresh/', {
                    refresh: refreshToken,
                });

                if (response.status === 200) {
                    const newToken = response.data.access;
                    localStorage.setItem('access_token', newToken);
                    sessionStorage.setItem('access_token', newToken); // Backup write
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                    // Process the queue with the new token
                    processQueue(null, newToken);

                    // Update the original request's header and retry
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                processQueue(refreshError, null);
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
