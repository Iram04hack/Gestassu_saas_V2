/**
 * Service API pour le module Core
 * Gestion des référentiels transverses (Agences, Info Société, etc.)
 */
import api from './api';

const CoreService = {
    // ========== AGENCES ==========

    /**
     * Récupérer toutes les agences
     */
    getAgences: async () => {
        const response = await api.get('/core/agences/');
        return response.data;
    },

    /**
     * Récupérer une agence par code
     */
    getAgenceByCode: async (code) => {
        const response = await api.get(`/core/agences/${code}/`);
        return response.data;
    },

    /**
     * Créer une nouvelle agence
     */
    createAgence: async (data) => {
        const response = await api.post('/core/agences/', data);
        return response.data;
    },

    /**
     * Modifier une agence existante
     */
    updateAgence: async (code, data) => {
        const response = await api.put(`/core/agences/${code}/`, data);
        return response.data;
    },

    /**
     * Supprimer (soft delete) une agence
     */
    deleteAgence: async (code) => {
        await api.delete(`/core/agences/${code}/`);
    },

    // ========== INFO SOCIETE ==========

    /**
     * Récupérer les infos de la société
     */
    getInfoSociete: async () => {
        const response = await api.get('/core/societe/');
        if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0];
        }
        if (response.data && response.data.results && response.data.results.length > 0) {
            return response.data.results[0];
        }
        return null;
    },

    /**
     * Créer les infos société (première fois)
     */
    createInfoSociete: async (data) => {
        const response = await api.post('/core/societe/', data);
        return response.data;
    },

    /**
     * Mettre à jour les infos de la société
     */
    updateInfoSociete: async (raisonsocial, data) => {
        const response = await api.put(`/core/societe/${encodeURIComponent(raisonsocial)}/`, data);
        return response.data;
    },
};

export default CoreService;
