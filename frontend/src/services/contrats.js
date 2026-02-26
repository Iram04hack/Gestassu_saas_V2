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

export const getInfoSociete = async () => {
    const response = await api.get('/core/societe/');
    return response.data;
};

/**
 * Récupère la liste des groupes de produits
 */
export const getGroupesProduits = async () => {
    const response = await api.get('/produits/groupes/');
    return response.data;
};

/**
 * Récupère les produits auto (G01)
 */
export const getProduits = async (params = {}) => {
    const response = await api.get('/produits/produits/', { params });
    return response.data;
};

/**
 * Crée un nouveau contrat (affaire nouvelle ou avenant)
 */
export const createContrat = async (data) => {
    const response = await api.post('/contrats/contrats/', data);
    return response.data;
};

/**
 * Récupère les valeurs distinctes de veh_usage et veh_energie depuis la DB
 * @returns {{ usages: string[], energies: string[] }}
 */
export const getRisquesChoices = async () => {
    const response = await api.get('/contrats/risques/choices/');
    return response.data;
};

/**
 * Récupère les véhicules disponibles depuis la table risques
 * @param {Object} params - search, type_risque, page, page_size
 */
export const getRisques = async (params = {}) => {
    const response = await api.get('/contrats/risques/', { params });
    return response.data;
};

/**
 * Importe des véhicules depuis un fichier Excel vers la table risques.
 * Les véhicules dont veh_immat existe déjà sont ignorés silencieusement.
 * @param {File} file - Fichier .xlsx/.xls
 * @returns {{ created: string[], skipped: string[], errors: object[] }}
 */
export const importRisquesExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/contrats/risques/import_excel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export default {
    getContrats,
    getContratById,
    getContratsByClient,
    getCompagnies,
    getAgences,
    getGroupesProduits,
    getProduits,
    createContrat,
    getRisques,
    getRisquesChoices,
    importRisquesExcel,
};
