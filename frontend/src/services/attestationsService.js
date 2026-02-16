import api from './api';

const AttestationsService = {
    /**
     * Récupérer toutes les attestations avec filtres
     */
    getAll: (params = {}) => {
        return api.get('/produits/attestations/', { params });
    },

    /**
     * Récupérer une attestation par ID
     */
    getById: (id) => {
        return api.get(`/produits/attestations/${id}/`);
    },

    /**
     * Créer une attestation
     */
    create: (data) => {
        return api.post('/produits/attestations/', data);
    },

    /**
     * Création en masse d'attestations (génération automatique)
     */
    bulkCreate: (data) => {
        return api.post('/produits/attestations/bulk_create/', data);
    },

    /**
     * Mettre à jour une attestation
     */
    update: (id, data) => {
        return api.put(`/produits/attestations/${id}/`, data);
    },

    /**
     * Supprimer une attestation (soft delete)
     */
    remove: (id) => {
        return api.delete(`/produits/attestations/${id}/`);
    },

    /**
     * Récupérer les statistiques
     */
    getStats: (type_attestation = null) => {
        const params = type_attestation ? { type_attestation } : {};
        return api.get('/produits/attestations/stats/', { params });
    },

    /**
     * Récupérer la liste des références de lots
     */
    getReferences: (params = {}) => {
        return api.get('/produits/attestations/references/', { params });
    },

    /**
     * Assigner un état à une sélection d'attestations
     */
    /**
     * Assigner des valeurs (état, compagnie, agence) à une sélection d'attestations
     */
    assignSelection: (data) => {
        return api.post('/produits/attestations/assign_selection/', data);
    },

    /**
     * Supprimer une sélection d'attestations
     */
    deleteSelection: (attestation_ids) => {
        return api.post('/produits/attestations/delete_selection/', {
            attestation_ids
        });
    },

    /**
     * Récupérer le tracking (historique) d'une attestation
     */
    getTracking: (id) => {
        return api.get(`/produits/attestations/${id}/tracking/`);
    },

    /**
     * Assigner des attestations à un contrat
     */
    assignToContract: (data) => {
        return api.post('/produits/attestations/assign_contract/', data);
    }
};

export default AttestationsService;
