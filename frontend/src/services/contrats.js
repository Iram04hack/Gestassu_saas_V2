/**
 * Service API pour le module Contrats
 */
import api from './api';

/**
 * Récupère la liste des contrats avec filtres optionnels
 */
export const getContrats = async (params = {}) => {
    const response = await api.get('/contrats/contrats/', { params });
    return response.data;
};

/**
 * Récupère un contrat par son ID
 */
export const getContratById = async (id) => {
    const response = await api.get(`/contrats/contrats/${id}/`);
    return response.data;
};

/**
 * Récupère les contrats d'un client spécifique
 */
export const getContratsByClient = async (clientId, params = {}) => {
    const response = await api.get('/contrats/contrats/', {
        params: { ID_Client: clientId, ...params }
    });
    return response.data;
};

/**
 * Récupère la liste des compagnies
 */
export const getCompagnies = async () => {
    const response = await api.get('/compagnies/compagnies/');
    return response.data;
};

/**
 * Récupère la liste des agences
 */
export const getAgences = async () => {
    const response = await api.get('/core/agences/');
    return response.data;
};

/**
 * Récupère la liste des groupes de produits
 */
export const getGroupesProduits = async () => {
    const response = await api.get('/produits/groupes/');
    return response.data;
};

export default {
    getContrats,
    getContratById,
    getContratsByClient,
    getCompagnies,
    getAgences,
    getGroupesProduits,
};
