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

/**
 * Met à jour partiellement un risque (véhicule) — PATCH
 * Utilisé lors d'un avenant de changement d'immatriculation.
 */
export const patchRisque = async (id, data) => {
    const response = await api.patch(`/contrats/risques/${id}/`, data);
    return response.data;
};

/**
 * Génère une quittance pour un contrat en statut projet.
 * Le contrat passe automatiquement de projet → contrat.
 * @param {{ id_contrat: string, observation?: string }} data
 */
export const genererQuittance = async (data) => {
    const response = await api.post('/finances/quittances/generer/', data);
    return response.data;
};

/**
 * Supprime (soft delete) un contrat
 * @param {string} id - id_contrat
 */
export const deleteContrat = async (id) => {
    const response = await api.delete(`/contrats/contrats/${id}/`);
    return response.data;
};

/**
 * Met à jour le numéro de police assureur d'un contrat
 * @param {string} id - id_contrat
 * @param {string} numPolice_assureur
 */
export const updatePoliceAssureur = async (id, numPolice_assureur) => {
    const response = await api.patch(`/contrats/contrats/${id}/update_police/`, { numPolice_assureur });
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
    patchRisque,
    getRisques,
    getRisquesChoices,
    importRisquesExcel,
    genererQuittance,
    deleteContrat,
    updatePoliceAssureur,
};
