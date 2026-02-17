/**
 * Service API pour le module Produits
 * Gestion des produits d'assurance
 */
import api from './api';

const productsService = {
    // ========== PRODUITS ==========

    /**
     * Récupérer tous les produits
     * @param {Object} params - Paramètres de filtrage (search, Id_compagnie, branche, code_groupe_prod)
     */
    getProducts: async (params = {}) => {
        const response = await api.get('/produits/produits/', { params });
        return response.data;
    },

    /**
     * Récupérer un produit par ID
     * @param {string} id - ID du produit
     */
    getProductById: async (id) => {
        const response = await api.get(`/produits/produits/${id}/`);
        return response.data;
    },

    /**
     * Créer un nouveau produit
     * @param {Object} productData - Données du produit
     */
    createProduct: async (productData) => {
        const response = await api.post('/produits/produits/', productData);
        return response.data;
    },

    /**
     * Mettre à jour un produit
     * @param {string} id - ID du produit
     * @param {Object} productData - Données à mettre à jour
     */
    updateProduct: async (id, productData) => {
        const response = await api.put(`/produits/produits/${id}/`, productData);
        return response.data;
    },

    /**
     * Supprimer un produit (soft delete)
     * @param {string} id - ID du produit
     */
    deleteProduct: async (id) => {
        const response = await api.delete(`/produits/produits/${id}/`);
        return response.data;
    },

    // ========== GROUPES DE PRODUITS ==========

    /**
     * Récupérer tous les groupes de produits
     */
    getGroupes: async () => {
        const response = await api.get('/produits/groupes/');
        return response.data;
    },

    // ========== GARANTIES ==========

    /**
     * Récupérer les garanties
     * @param {Object} params - Paramètres de filtrage (id_produit)
     */
    getGaranties: async (params = {}) => {
        const response = await api.get('/produits/garanties/', { params });
        return response.data;
    },

    /**
     * Récupérer une garantie par ID
     * @param {string} id - ID de la garantie
     */
    getGarantieById: async (id) => {
        const response = await api.get(`/produits/garanties/${id}/`);
        return response.data;
    },

    /**
     * Créer une nouvelle garantie
     * @param {Object} garantieData - Données de la garantie
     */
    createGarantie: async (garantieData) => {
        const response = await api.post('/produits/garanties/', garantieData);
        return response.data;
    },

    /**
     * Mettre à jour une garantie
     * @param {string} id - ID de la garantie
     * @param {Object} garantieData - Données à mettre à jour
     */
    updateGarantie: async (id, garantieData) => {
        const response = await api.put(`/produits/garanties/${id}/`, garantieData);
        return response.data;
    },

    /**
     * Supprimer une garantie (soft delete)
     * @param {string} id - ID de la garantie
     */
    deleteGarantie: async (id) => {
        const response = await api.delete(`/produits/garanties/${id}/`);
        return response.data;
    },
};

export default productsService;
