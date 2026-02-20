/**
 * Service API pour le module Tarifs Auto
 * Gestion des grilles tarifaires automobile
 */
import api from './api';

const tarifsAutoService = {
    /**
     * Récupérer tous les tarifs
     * @param {Object} params - Paramètres de filtrage (groupe, code_cat, id_compagnie, search)
     */
    getTarifs: async (params = {}) => {
        const response = await api.get('/tarifs/auto/', { params });
        return response.data;
    },

    /**
     * Récupérer un tarif par ID
     * @param {string} id - ID du tarif
     */
    getTarifById: async (id) => {
        const response = await api.get(`/tarifs/auto/${id}/`);
        return response.data;
    },

    /**
     * Créer un nouveau tarif
     * @param {Object} tarifData - Données du tarif
     */
    createTarif: async (tarifData) => {
        const response = await api.post('/tarifs/auto/', tarifData);
        return response.data;
    },

    /**
     * Mettre à jour un tarif
     * @param {string} id - ID du tarif
     * @param {Object} tarifData - Données à mettre à jour
     */
    updateTarif: async (id, tarifData) => {
        const response = await api.put(`/tarifs/auto/${id}/`, tarifData);
        return response.data;
    },

    /**
     * Supprimer un tarif (soft delete)
     * @param {string} id - ID du tarif
     */
    deleteTarif: async (id) => {
        const response = await api.delete(`/tarifs/auto/${id}/`);
        return response.data;
    },
};

export default tarifsAutoService;
