import api from './api';

/**
 * Récupère les tâches d'un client
 * @param {string} clientId - L'ID du client
 * @param {object} params - Paramètres de filtre (statut, etc.)
 */
export const getTachesByClient = async (clientId, params = {}) => {
    const queryParams = new URLSearchParams({
        client_id: clientId,
        ...params
    }).toString();

    const response = await api.get(`/taches/taches/?${queryParams}`);
    return response.data;
};

/**
 * Récupère tous les utilisateurs pour l'affectation
 */
export const getUtilisateurs = async () => {
    const response = await api.get('/authentication/utilisateurs/');
    return response.data;
};

/**
 * Crée une nouvelle tâche
 * @param {object} data - Les données de la tâche
 */
export const createTache = async (data) => {
    const response = await api.post('/taches/taches/', data);
    return response.data;
};

/**
 * Met à jour une tâche
 * @param {string} tacheId - L'ID de la tâche
 * @param {object} data - Les données à mettre à jour
 */
export const updateTache = async (tacheId, data) => {
    const response = await api.put(`/taches/taches/${tacheId}/`, data);
    return response.data;
};

/**
 * Supprime une tâche
 * @param {string} tacheId - L'ID de la tâche
 */
export const deleteTache = async (tacheId) => {
    const response = await api.delete(`/taches/taches/${tacheId}/`);
    return response.data;
};

export default {
    getTachesByClient,
    getUtilisateurs,
    createTache,
    updateTache,
    deleteTache,
};
