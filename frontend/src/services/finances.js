import api from './api';

/**
 * Récupère la liste des mouvements d'un client
 * @param {string} clientId - L'ID du client (idtransfert)
 * @param {object} params - Paramètres de filtre (date_debut, date_fin)
 */
export const getMouvementsByClient = async (clientId, params = {}) => {
    const queryParams = new URLSearchParams({
        client_id: clientId,
        ...params
    }).toString();

    const response = await api.get(`/finances/mouvements/?${queryParams}`);
    return response.data;
};

/**
 * Récupère les types de mouvements manuels
 */
export const getTypeMouvements = async () => {
    const response = await api.get('/finances/mouvements/types/');
    return response.data;
};

/**
 * Récupère les caisses disponibles
 */
export const getCaisses = async () => {
    const response = await api.get('/finances/mouvements/caisses/');
    return response.data;
};

/**
 * Crée un nouveau mouvement
 * @param {object} data - Les données du mouvement
 */
export const createMouvement = async (data) => {
    const response = await api.post('/finances/mouvements/', data);
    return response.data;
};

export default {
    getMouvementsByClient,
    getTypeMouvements,
    getCaisses,
    createMouvement,
};
