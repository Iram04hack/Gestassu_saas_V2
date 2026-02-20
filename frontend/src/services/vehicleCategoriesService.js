import api from './api';

const VEHICLE_CATEGORIES_API_URL = '/produits/categories-vehicules/';

const getAll = async (params = {}) => {
    const response = await api.get(VEHICLE_CATEGORIES_API_URL, { params });
    return response.data;
};

const get = (id) => {
    return api.get(`${VEHICLE_CATEGORIES_API_URL}${id}/`);
};

const create = (data) => {
    return api.post(VEHICLE_CATEGORIES_API_URL, data);
};

const update = (id, data) => {
    return api.put(`${VEHICLE_CATEGORIES_API_URL}${id}/`, data);
};

const remove = (id) => {
    return api.delete(`${VEHICLE_CATEGORIES_API_URL}${id}/`);
};

const VehicleCategoriesService = {
    getAll,
    get,
    create,
    update,
    remove,
};

export default VehicleCategoriesService;
