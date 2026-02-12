import api from './api';

const COMMISSION_CATEGORIES_API_URL = '/produits/commissions/';

const getAll = (params = {}) => {
    return api.get(COMMISSION_CATEGORIES_API_URL, { params });
};

const get = (id) => {
    return api.get(`${COMMISSION_CATEGORIES_API_URL}${id}/`);
};

const create = (data) => {
    return api.post(COMMISSION_CATEGORIES_API_URL, data);
};

const update = (id, data) => {
    return api.put(`${COMMISSION_CATEGORIES_API_URL}${id}/`, data);
};

const remove = (code_cat, id_compagnie) => {
    return api.post(`${COMMISSION_CATEGORIES_API_URL}delete_custom/`, { code_cat, id_compagnie });
};

const CommissionCategoriesService = {
    getAll,
    get,
    create,
    update,
    remove
};

export default CommissionCategoriesService;
