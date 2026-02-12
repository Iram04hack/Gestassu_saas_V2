import React, { useState, useEffect } from 'react';
import VehicleCategoriesService from '../../../services/vehicleCategoriesService';
import './VehicleCategories.css';

const VehicleCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        code_cat: '',
        lib_cat: '',
        description_cat: '',
        enable_flotte: false
    });
    const [editingId, setEditingId] = useState(null);

    const [showFilters, setShowFilters] = useState(false);
    const [filterFlotte, setFilterFlotte] = useState('all'); // 'all', 'true', 'false'

    useEffect(() => {
        fetchCategories();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setCurrentUser(user);
        }
    }, [filterFlotte]); // Reload when filter changes

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterFlotte !== 'all') {
                params.enable_flotte = filterFlotte;
            }

            const response = await VehicleCategoriesService.getAll(params);
            // Handle pagination (DRF returns { count, next, previous, results })
            const data = response.data.results || response.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des catégories", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCategories = categories.filter(cat =>
        (cat.lib_cat && cat.lib_cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cat.code_cat && cat.code_cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingId(category.code_cat);
            setFormData({
                code_cat: category.code_cat,
                lib_cat: category.lib_cat || '',
                description_cat: category.description_cat || '',
                enable_flotte: category.enable_flotte || false
            });
        } else {
            setEditingId(null);
            setFormData({
                code_cat: '',
                lib_cat: '',
                description_cat: '',
                enable_flotte: false
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                IDUTILISATEUR_save: currentUser?.id
            };

            if (editingId) {
                await VehicleCategoriesService.update(editingId, dataToSend);
            } else {
                await VehicleCategoriesService.create(dataToSend);
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            console.error("Erreur lors de l'enregistrement", error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
            try {
                // Soft delete usually handled by backend, but here we call delete endpoint
                await VehicleCategoriesService.remove(id);
                fetchCategories();
            } catch (error) {
                console.error("Erreur lors de la suppression", error);
                alert("Impossible de supprimer cette catégorie.");
            }
        }
    };

    return (
        <div className="vehicle-categories-container">
            <div className="vehicle-categories-header-strip">
                <h1>Liste des catégories</h1>
            </div>

            <div className="vehicle-categories-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="actions-group">
                    <div style={{ position: 'relative' }}>
                        <button
                            className={`btn-icon-action ${showFilters ? 'active' : ''}`}
                            title="Filtrer"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <i className="bi bi-funnel"></i>
                        </button>

                        {/* Simple Filter Popover */}
                        {showFilters && (
                            <div className="filter-popover">
                                <div className="filter-group">
                                    <label>Réduction Flotte :</label>
                                    <select
                                        value={filterFlotte}
                                        onChange={(e) => setFilterFlotte(e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="all">Tout</option>
                                        <option value="true">Oui</option>
                                        <option value="false">Non</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn-icon-action" title="Actualiser" onClick={fetchCategories}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button className="btn-new" onClick={() => handleOpenModal()}>
                        <i className="bi bi-plus-lg"></i>
                        Nouvelle catégorie
                    </button>
                </div>
            </div>

            <div className="vehicle-categories-table-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                        <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                        <p>Chargement des catégories...</p>
                    </div>
                ) : (
                    <table className="vehicle-categories-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Libellé catégorie</th>
                                <th className="text-center th-red-flotte">Red. Flotte</th>
                                <th>Description</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.code_cat}>
                                        <td><strong>{cat.code_cat}</strong></td>
                                        <td>{cat.lib_cat}</td>
                                        <td className="text-center">
                                            {cat.enable_flotte ? (
                                                <i className="bi bi-check-circle-fill text-success" title="Activé"></i>
                                            ) : (
                                                <i className="bi bi-circle text-muted" title="Désactivé"></i>
                                            )}
                                        </td>
                                        <td>{cat.description_cat}</td>
                                        <td>
                                            <div className="action-buttons justify-content-end">
                                                <button
                                                    className="btn-action pill"
                                                    onClick={() => handleOpenModal(cat)}
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    className="btn-action pill delete"
                                                    onClick={() => handleDelete(cat.code_cat)}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-muted">
                                        Aucune catégorie trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="code_cat">Code *</label>
                                    <input
                                        type="text"
                                        id="code_cat"
                                        name="code_cat"
                                        className="form-control"
                                        value={formData.code_cat}
                                        onChange={handleChange}
                                        required
                                        disabled={!!editingId} // Disable editing PK
                                        placeholder="Ex: CAT-01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lib_cat">Libellé catégorie *</label>
                                    <input
                                        type="text"
                                        id="lib_cat"
                                        name="lib_cat"
                                        className="form-control"
                                        value={formData.lib_cat}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: Véhicule de tourisme"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description_cat">Description</label>
                                    <textarea
                                        id="description_cat"
                                        name="description_cat"
                                        className="form-control"
                                        rows="3"
                                        value={formData.description_cat}
                                        onChange={handleChange}
                                        placeholder="Description optionnelle..."
                                    ></textarea>
                                </div>
                                <div className="form-group toggle-group mt-3">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            id="enable_flotte"
                                            name="enable_flotte"
                                            checked={formData.enable_flotte}
                                            onChange={handleChange}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                    <label htmlFor="enable_flotte" className="toggle-label">
                                        Autoriser la réduction flotte
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-submit">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleCategories;
