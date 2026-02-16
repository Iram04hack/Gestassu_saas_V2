/**
 * Service pour la gestion des données financières
 */
import api from './api';

const FINANCE_API_URL = '/finances';

const financesService = {
    // Types de Mouvements (Motifs transactions)
    getTypesMouvements: (params = {}) => {
        return api.get(`${FINANCE_API_URL}/types-mouvements/`, { params });
    },

    createTypeMouvement: (data) => {
        return api.post(`${FINANCE_API_URL}/types-mouvements/`, data);
    },

    updateTypeMouvement: (id, data) => {
        return api.put(`${FINANCE_API_URL}/types-mouvements/${id}/`, data);
    },

    deleteTypeMouvement: (id) => {
        return api.delete(`${FINANCE_API_URL}/types-mouvements/${id}/`);
    },

    // Autres (Caisses, etc.)
    getCaisses: () => {
        return api.get(`${FINANCE_API_URL}/caisses/`);
    }
};

export default financesService;
