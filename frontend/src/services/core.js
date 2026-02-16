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

    // ========== INFO SOCIETE ==========

    /**
     * Récupérer les infos de la société
     */
    getInfoSociete: async () => {
        const response = await api.get('/core/societe/');
        // L'API peut retourner une liste ou un objet unique selon l'implémentation
        // Ici on suppose qu'on veut le premier élément si c'est une liste
        if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0];
        }
        return response.data;
    }
};

export default CoreService;
