import api from './api';

/**
 * Récupère les documents d'un client
 * @param {string} clientId - L'ID du client
 */
export const getDocumentsByClient = async (clientId) => {
    const response = await api.get(`/documents/documents/?client_id=${clientId}`);
    return response.data;
};

/**
 * Crée un nouveau document
 * @param {FormData} formData - Les données du document (avec fichier)
 */
export const createDocument = async (formData) => {
    const response = await api.post('/documents/documents/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Supprime un document
 * @param {string} documentId - L'ID du document
 */
export const deleteDocument = async (documentId) => {
    const response = await api.delete(`/documents/documents/${documentId}/`);
    return response.data;
};

export default {
    getDocumentsByClient,
    createDocument,
    deleteDocument,
};
