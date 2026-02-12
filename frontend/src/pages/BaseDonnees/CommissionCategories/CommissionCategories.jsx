import React, { useState, useEffect } from 'react';
import CommissionCategoriesService from '../../../services/commissionCategoriesService';
import CompagniesService from '../../../services/compagnies';
import VehicleCategoriesService from '../../../services/vehicleCategoriesService';
import './CommissionCategories.css';

const CommissionCategories = () => {
    const [commissions, setCommissions] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Filter/Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCommission, setEditingCommission] = useState(null);
    const [formData, setFormData] = useState({
        id_compagnie: '',
        code_cat: '',
        tx_commision: ''
    });

    useEffect(() => {
        fetchInitialData();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            console.log("Fetching initial data...");
            const [commissionsRes, compagniesRes, categoriesRes] = await Promise.all([
                CommissionCategoriesService.getAll(),
                CompagniesService.getCompagnies(),
                VehicleCategoriesService.getAll()
            ]);

            console.log("Commissions Response:", commissionsRes);
            console.log("Compagnies Response:", compagniesRes);
            console.log("Categories Response:", categoriesRes);

            // Resilient data extraction
            const getResults = (res) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (res.data) {
                    if (Array.isArray(res.data.results)) return res.data.results;
                    if (Array.isArray(res.data)) return res.data;
                }
                if (Array.isArray(res.results)) return res.results;
                return [];
            };

            setCommissions(getResults(commissionsRes));
            setCompagnies(getResults(compagniesRes));
            setCategories(getResults(categoriesRes));

        } catch (error) {
            console.error("Erreur lors du chargement des données", error);
        } finally {
            setLoading(false);
        }
    };


    const fetchCommissions = async () => {
        try {
            // setLoading(true); // Opsional to show spinner on refresh
            const response = await CommissionCategoriesService.getAll();
            setCommissions(Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error("Erreur rechargement commissions", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCommissions = commissions.filter(comm =>
        (comm.nom_compagnie && comm.nom_compagnie.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (comm.lib_cat && comm.lib_cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (comm.id_compagnie && comm.id_compagnie.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (comm.code_cat && comm.code_cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (commission = null) => {
        if (commission) {
            setEditingCommission(commission);
            setFormData({
                id_compagnie: commission.id_compagnie,
                code_cat: commission.code_cat,
                tx_commision: commission.tx_commision
            });
        } else {
            setEditingCommission(null);
            setFormData({
                id_compagnie: '',
                code_cat: '',
                tx_commision: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCommission(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                IDUTILISATEUR_save: currentUser?.id
            };

            // Upsert handled by backend create
            await CommissionCategoriesService.create(dataToSend);

            fetchCommissions();
            handleCloseModal();
            // alert("Commission enregistrée avec succès !"); // Optional feedback
        } catch (error) {
            console.error("Erreur lors de l'enregistrement", error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        }
    };

    const handleDelete = async (commission) => {
        if (window.confirm(`Supprimer la commission pour ${commission.nom_compagnie} - ${commission.lib_cat} ?`)) {
            try {
                await CommissionCategoriesService.remove(commission.code_cat, commission.id_compagnie);
                fetchCommissions();
            } catch (error) {
                console.error("Erreur lors de la suppression", error);
                alert("Impossible de supprimer cette commission.");
            }
        }
    };

    const handleReset = async () => {
        setSearchTerm('');
        await fetchInitialData();
    };

    return (
        <div className="commission-categories-container">
            <div className="commission-categories-header-strip">
                <h1>Commission catégorie</h1>
            </div>

            <div className="commission-categories-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher une commission..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="actions-group">
                    <button className="btn-icon-action" title="Réinitialiser et Actualiser" onClick={handleReset}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button className="btn-new" onClick={() => handleOpenModal()}>
                        <i className="bi bi-plus-lg"></i>
                        Nouvelle commission
                    </button>
                </div>
            </div>

            <div className="commission-list-section">
                <div className="table-responsive">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                            <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                            <p>Chargement des commissions...</p>
                        </div>
                    ) : (
                        <table className="commission-table">
                            <thead>
                                <tr>
                                    <th>Compagnie <i className="bi bi-funnel-fill text-muted" style={{ fontSize: '0.8em' }}></i></th>
                                    <th>Libellé catégorie</th>
                                    <th className="text-end">Taux commission</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCommissions.length > 0 ? (
                                    filteredCommissions.map((comm, idx) => (
                                        <tr key={`${comm.code_cat}-${comm.id_compagnie}-${idx}`}>
                                            <td><strong>{comm.nom_compagnie || comm.id_compagnie}</strong></td>
                                            <td>{comm.lib_cat || comm.code_cat}</td>
                                            <td className="text-end fw-bold">
                                                {comm.tx_commision ? parseFloat(comm.tx_commision).toFixed(2).replace('.', ',') : '0,00'} %
                                            </td>
                                            <td className="text-end">
                                                <div className="action-buttons justify-content-end">
                                                    <button
                                                        className="btn-action pill"
                                                        onClick={() => handleOpenModal(comm)}
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        className="btn-action pill delete"
                                                        onClick={() => handleDelete(comm)}
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center p-4 text-muted">
                                            Aucune commission trouvée
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCommission ? 'Modifier la commission' : 'Nouvelle commission'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Compagnie *</label>
                                    <select
                                        name="id_compagnie"
                                        value={formData.id_compagnie}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        disabled={!!editingCommission} // Lock Composite Key on Edit
                                    >
                                        <option value="">Sélectionner...</option>
                                        {compagnies.map(comp => (
                                            <option key={comp.id_compagnie} value={comp.id_compagnie}>
                                                {comp.nom_compagnie}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Catégorie *</label>
                                    <select
                                        name="code_cat"
                                        value={formData.code_cat}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        disabled={!!editingCommission} // Lock Composite Key on Edit
                                    >
                                        <option value="">Sélectionner...</option>
                                        {categories.map(cat => (
                                            <option key={cat.code_cat} value={cat.code_cat}>
                                                {cat.lib_cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Taux commission *</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="tx_commision"
                                            value={formData.tx_commision}
                                            onChange={handleChange}
                                            required
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="form-control text-end"
                                            placeholder="0.00"
                                        />
                                        <span className="input-group-text">%</span>
                                    </div>
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

export default CommissionCategories;
