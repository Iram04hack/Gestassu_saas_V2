/**
 * Service API pour le module CRM
 * Gestion des clients et interactions
 */
import api from './api';

const crmService = {
    // ========== CLIENTS ==========
    
    /**
     * Récupérer tous les clients
     * @param {Object} params - Paramètres de filtrage (search, est_entreprise, source)
     */
    getClients: async (params = {}) => {
        const response = await api.get('/crm/clients/', { params });
        return response.data;
    },

    /**
     * Récupérer un client par ID
     * @param {string} id - ID du client
     */
    getClientById: async (id) => {
        const response = await api.get(`/crm/clients/${id}/`);
        return response.data;
    },

    /**
     * Créer un nouveau client
     * @param {Object} clientData - Données du client
     */
    createClient: async (clientData) => {
        const response = await api.post('/crm/clients/', clientData);
        return response.data;
    },

    /**
     * Mettre à jour un client
     * @param {string} id - ID du client
     * @param {Object} clientData - Données à mettre à jour
     */
    updateClient: async (id, clientData) => {
        const response = await api.put(`/crm/clients/${id}/`, clientData);
        return response.data;
    },

    /**
     * Supprimer un client (soft delete)
     * @param {string} id - ID du client
     */
    deleteClient: async (id) => {
        const response = await api.delete(`/crm/clients/${id}/`);
        return response.data;
    },

    /**
     * Récupérer les statistiques des clients
     */
    getClientsStats: async () => {
        const response = await api.get('/crm/clients/stats/');
        return response.data;
    },

    // ========== INTERACTIONS ==========

    /**
     * Récupérer toutes les interactions
     * @param {Object} params - Paramètres de filtrage (id_client, search)
     */
    getInteractions: async (params = {}) => {
        const response = await api.get('/crm/interactions/', { params });
        return response.data;
    },

    /**
     * Récupérer une interaction par ID
     * @param {string} id - ID de l'interaction
     */
    getInteractionById: async (id) => {
        const response = await api.get(`/crm/interactions/${id}/`);
        return response.data;
    },

    /**
     * Créer une nouvelle interaction
     * @param {Object} interactionData - Données de l'interaction
     */
    createInteraction: async (interactionData) => {
        const response = await api.post('/crm/interactions/', interactionData);
        return response.data;
    },

    /**
     * Mettre à jour une interaction
     * @param {string} id - ID de l'interaction
     * @param {Object} interactionData - Données à mettre à jour
     */
    updateInteraction: async (id, interactionData) => {
        const response = await api.put(`/crm/interactions/${id}/`, interactionData);
        return response.data;
    },

    /**
     * Supprimer une interaction
     * @param {string} id - ID de l'interaction
     */
    deleteInteraction: async (id) => {
        const response = await api.delete(`/crm/interactions/${id}/`);
        return response.data;
    },
};

export default crmService;
