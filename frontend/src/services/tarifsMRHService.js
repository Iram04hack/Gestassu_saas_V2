/**
 * Service API pour le module Tarifs MRH (Multirisque Habitation)
 * Gestion des grilles tarifaires MRH
 */
import api from './api';

const tarifsMRHService = {
    /**
     * Récupérer tous les tarifs MRH
     * @param {Object} params - Paramètres de filtrage (idcompagnie, id_produit, id_garantie)
     */
    getTarifs: async (params = {}) => {
        const response = await api.get('/tarifs/mrh/', { params });
        return response.data;
    },

    /**
     * Récupérer un tarif MRH par ID
     * @param {string} id - ID de la garantie (PK)
     */
    getTarifById: async (id) => {
        const response = await api.get(`/tarifs/mrh/${id}/`);
        return response.data;
    },

    /**
     * Créer un nouveau tarif MRH
     * @param {Object} tarifData - Données du tarif
     */
    createTarif: async (tarifData) => {
        const response = await api.post('/tarifs/mrh/', tarifData);
        return response.data;
    },

    /**
     * Mettre à jour un tarif MRH
     * @param {string} id - ID de la garantie (PK)
     * @param {Object} tarifData - Données à mettre à jour
     */
    updateTarif: async (id, tarifData) => {
        const response = await api.put(`/tarifs/mrh/${id}/`, tarifData);
        return response.data;
    },

    /**
     * Supprimer un tarif MRH (soft delete)
     * @param {string} id - ID de la garantie (PK)
     */
    deleteTarif: async (id) => {
        const response = await api.delete(`/tarifs/mrh/${id}/`);
        return response.data;
    },
};

export default tarifsMRHService;
