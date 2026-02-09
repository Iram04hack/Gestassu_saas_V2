/**
 * Service API pour le module Compagnies
 * Gestion des compagnies d'assurance et leurs contacts
 */
import api from './api';

const compagniesService = {
    // ========== COMPAGNIES ==========

    /**
     * Récupérer toutes les compagnies
     * @param {Object} params - Paramètres de filtrage (search, ordering)
     */
    getCompagnies: async (params = {}) => {
        const response = await api.get('/compagnies/compagnies/', { params });
        return response.data;
    },

    /**
     * Récupérer une compagnie par ID
     * @param {string} id - ID de la compagnie
     */
    getCompagnieById: async (id) => {
        const response = await api.get(`/compagnies/compagnies/${id}/`);
        return response.data;
    },

    /**
     * Créer une nouvelle compagnie
     * @param {Object} compagnieData - Données de la compagnie
     */
    createCompagnie: async (compagnieData) => {
        const response = await api.post('/compagnies/compagnies/', compagnieData);
        return response.data;
    },

    /**
     * Mettre à jour une compagnie
     * @param {string} id - ID de la compagnie
     * @param {Object} compagnieData - Données à mettre à jour
     */
    updateCompagnie: async (id, compagnieData) => {
        const response = await api.put(`/compagnies/compagnies/${id}/`, compagnieData);
        return response.data;
    },

    /**
     * Supprimer une compagnie (soft delete)
     * @param {string} id - ID de la compagnie
     */
    deleteCompagnie: async (id) => {
        const response = await api.delete(`/compagnies/compagnies/${id}/`);
        return response.data;
    },

    /**
     * Récupérer les contacts d'une compagnie
     * @param {string} id - ID de la compagnie
     */
    getCompagnieContacts: async (id) => {
        const response = await api.get(`/compagnies/compagnies/${id}/contacts/`);
        return response.data;
    },

    // ========== CONTACTS ==========

    /**
     * Récupérer tous les contacts
     * @param {Object} params - Paramètres de filtrage (id_compagnie, search)
     */
    getContacts: async (params = {}) => {
        const response = await api.get('/compagnies/contacts/', { params });
        return response.data;
    },

    /**
     * Récupérer un contact par ID
     * @param {string} id - ID du contact
     */
    getContactById: async (id) => {
        const response = await api.get(`/compagnies/contacts/${id}/`);
        return response.data;
    },

    /**
     * Créer un nouveau contact
     * @param {Object} contactData - Données du contact
     */
    createContact: async (contactData) => {
        const response = await api.post('/compagnies/contacts/', contactData);
        return response.data;
    },

    /**
     * Mettre à jour un contact
     * @param {string} id - ID du contact
     * @param {Object} contactData - Données à mettre à jour
     */
    updateContact: async (id, contactData) => {
        const response = await api.put(`/compagnies/contacts/${id}/`, contactData);
        return response.data;
    },

    /**
     * Supprimer un contact
     * @param {string} id - ID du contact
     */
    deleteContact: async (id) => {
        const response = await api.delete(`/compagnies/contacts/${id}/`);
        return response.data;
    },
};

export default compagniesService;
