import React, { useState, useEffect } from 'react';
import './AccessoiresModal.css';
import compagniesService from '../../services/compagnies';

const AccessoiresModal = ({ isOpen, onClose, compagnie }) => {
    const [accessoires, setAccessoires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAccessoire, setEditingAccessoire] = useState(null);
    const [formData, setFormData] = useState({
        interv_min: '',
        interv_max: '',
        montant: ''
    });

    useEffect(() => {
        if (isOpen && compagnie) {
            loadAccessoires();
        }
    }, [isOpen, compagnie]);

    const loadAccessoires = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await compagniesService.getAccessoires(compagnie.id);
            setAccessoires(response.results || response || []);
        } catch (err) {
            console.error('Erreur chargement accessoires:', err);
            setError('Impossible de charger les accessoires');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const min = parseInt(formData.interv_min);
        const max = parseInt(formData.interv_max);

        if (min >= max) {
            alert('L\'intervalle minimum doit être inférieur à l\'intervalle maximum');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                id_compagnie: compagnie.id,
                interv_min: parseInt(formData.interv_min),
                interv_max: parseInt(formData.interv_max),
                montant: parseInt(formData.montant)
            };

            if (editingAccessoire) {
                await compagniesService.updateAccessoire(editingAccessoire.idfraisaccess, dataToSend);
            } else {
                await compagniesService.createAccessoire(dataToSend);
            }

            loadAccessoires();
            resetForm();
        } catch (err) {
            console.error('Erreur sauvegarde accessoire:', err);
            alert('Impossible de sauvegarder l\'accessoire');
        }
    };

    const handleEdit = (accessoire) => {
        setEditingAccessoire(accessoire);
        setFormData({
            interv_min: accessoire.interv_min || '',
            interv_max: accessoire.interv_max || '',
            montant: accessoire.montant || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet accessoire ?')) {
            try {
                await compagniesService.deleteAccessoire(id);
                loadAccessoires();
            } catch (err) {
                console.error('Erreur suppression accessoire:', err);
                alert('Impossible de supprimer l\'accessoire');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            interv_min: '',
            interv_max: '',
            montant: ''
        });
        setEditingAccessoire(null);
        setIsFormOpen(false);
    };

    const formatMontant = (montant) => {
        return new Intl.NumberFormat('fr-FR').format(montant);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="accessoires-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className="bi bi-gear-fill"></i> Répartition des accessoires - {compagnie?.nom}
                    </h2>
                    <button className="btn-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {!isFormOpen ? (
                        <>
                            <div className="accessoires-toolbar">
                                <button
                                    className="btn-new-accessoire"
                                    onClick={() => setIsFormOpen(true)}
                                >
                                    <i className="bi bi-plus-lg"></i> Nouvel accessoire
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading-state">
                                    <i className="bi bi-hourglass-split"></i>
                                    <p>Chargement des accessoires...</p>
                                </div>
                            ) : error ? (
                                <div className="error-state">
                                    <i className="bi bi-exclamation-triangle"></i>
                                    <p>{error}</p>
                                </div>
                            ) : accessoires.length === 0 ? (
                                <div className="empty-state">
                                    <i className="bi bi-inbox"></i>
                                    <p>Aucun accessoire configuré</p>
                                </div>
                            ) : (
                                <table className="accessoires-table">
                                    <thead>
                                        <tr>
                                            <th>Intervalle Min</th>
                                            <th>Intervalle Max</th>
                                            <th>Montant (XAF)</th>
                                            <th>Part accessoire fixe</th>
                                            <th>Part accessoire (%)</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accessoires.map(accessoire => {
                                            const partFixe = accessoire.montant || 0;
                                            const partTaux = accessoire.interv_max > 0
                                                ? ((accessoire.montant / accessoire.interv_max) * 100).toFixed(2)
                                                : 0;

                                            return (
                                                <tr key={accessoire.idfraisaccess}>
                                                    <td>{formatMontant(accessoire.interv_min)}</td>
                                                    <td>{formatMontant(accessoire.interv_max)}</td>
                                                    <td className="font-bold">{formatMontant(accessoire.montant)}</td>
                                                    <td>{formatMontant(partFixe)}</td>
                                                    <td>{partTaux} %</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-edit"
                                                                onClick={() => handleEdit(accessoire)}
                                                                title="Modifier"
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => handleDelete(accessoire.idfraisaccess)}
                                                                title="Supprimer"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </>
                    ) : (
                        <form className="accessoire-form" onSubmit={handleSubmit}>
                            <h3>{editingAccessoire ? 'Modifier l\'accessoire' : 'Nouvel accessoire'}</h3>

                            <div className="form-info">
                                <i className="bi bi-info-circle"></i>
                                <p>Configurez les frais accessoires en fonction de l'intervalle de prime</p>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Intervalle minimum (XAF) *</label>
                                    <input
                                        type="number"
                                        name="interv_min"
                                        value={formData.interv_min}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Intervalle maximum (XAF) *</label>
                                    <input
                                        type="number"
                                        name="interv_max"
                                        value={formData.interv_max}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Montant des frais (XAF) *</label>
                                <input
                                    type="number"
                                    name="montant"
                                    value={formData.montant}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    <i className="bi bi-x-lg"></i> Annuler
                                </button>
                                <button type="submit" className="btn-save">
                                    <i className="bi bi-check-lg"></i> Enregistrer
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccessoiresModal;
