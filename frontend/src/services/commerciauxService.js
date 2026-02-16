import api from './api';

const API_URL = '/commerciaux';

const commerciauxService = {
    // Apporteurs
    getApporteurs: (params = {}) => {
        return api.get(`${API_URL}/apporteurs/`, { params });
    },

    getApporteur: (code) => {
        return api.get(`${API_URL}/apporteurs/${code}/`);
    },

    createApporteur: (data) => {
        return api.post(`${API_URL}/apporteurs/`, data);
    },

    updateApporteur: (code, data) => {
        return api.put(`${API_URL}/apporteurs/${code}/`, data);
    },

    deleteApporteur: (code) => {
        return api.delete(`${API_URL}/apporteurs/${code}/`);
    },

    // Commissions
    getCommissions: (params = {}) => {
        return api.get(`${API_URL}/commissions/`, { params });
    },

    createCommission: (data) => {
        return api.post(`${API_URL}/commissions/`, data);
    },

    deleteCommission: (id) => {
        return api.delete(`${API_URL}/commissions/${id}/`);
    }
};

export default commerciauxService;
