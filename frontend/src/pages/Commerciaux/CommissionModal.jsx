import React, { useState, useEffect } from 'react';
import commerciauxService from '../../services/commerciauxService';

const CommissionModal = ({ isOpen, onClose, apporteur }) => {
    const [commissions, setCommissions] = useState([]);
    const [formData, setFormData] = useState({
        type_contrat: '',
        mode_remuneration: 'pourcentage',
        taux_commission: 10,
        commission_fixe: 0
    });

    useEffect(() => {
        if (apporteur) {
            loadCommissions();
        }
    }, [apporteur]);

    const loadCommissions = async () => {
        try {
            const response = await commerciauxService.getCommissions({
                code_apporteur: apporteur.code_apporteur
            });
            // Handle pagination or direct array
            const data = response.data.results || response.data || [];
            setCommissions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur chargement commissions:', error);
            setCommissions([]);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await commerciauxService.createCommission({
                ...formData,
                code_apporteur: apporteur.code_apporteur
            });

            loadCommissions();
            setFormData({
                type_contrat: '',
                mode_remuneration: 'pourcentage',
                taux_commission: 10,
                commission_fixe: 0
            });
        } catch (error) {
            console.error('Erreur ajout commission:', error);
            alert('Erreur lors de l\'ajout de la commission');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette commission ?')) {
            try {
                await commerciauxService.deleteCommission(id);
                loadCommissions();
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content" style={{ maxWidth: '900px' }}>
                <div className="modal-header">
                    <h2>Commission du commercial</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="commission-layout">
                        {/* Left: Form */}
                        <div className="commission-form">
                            <h3 style={{ color: '#8d6e63', marginBottom: '15px' }}>Ajouter une commission</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Type de contrat *</label>
                                    <select
                                        name="type_contrat"
                                        value={formData.type_contrat}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="Assurance Automobile">Assurance Automobile</option>
                                        <option value="Assurance Multirisque Habitation">Assurance Multirisque Habitation</option>
                                        <option value="Assurance Multirisque Professionnelle">Assurance Multirisque Professionnelle</option>
                                        <option value="Assurance Santé">Assurance Santé</option>
                                        <option value="RC Scolaire">RC Scolaire</option>
                                        <option value="RC Entreprise">RC Entreprise</option>
                                        <option value="RC Décennale">RC Décennale</option>
                                        <option value="Tous Risques Chantiers">Tous Risques Chantiers</option>
                                        <option value="Assurance Globale Dommage">Assurance Globale Dommage</option>
                                        <option value="Assurance Incendie">Assurance Incendie</option>
                                        <option value="Assurance Perte Exploitation">Assurance Perte Exploitation</option>
                                        <option value="Transport Facultés Maritimes">Transport Facultés Maritimes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Mode de rémunération</label>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="radio"
                                                name="mode_remuneration"
                                                value="fixe"
                                                checked={formData.mode_remuneration === 'fixe'}
                                                onChange={handleChange}
                                            />
                                            Commission fixe
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="radio"
                                                name="mode_remuneration"
                                                value="pourcentage"
                                                checked={formData.mode_remuneration === 'pourcentage'}
                                                onChange={handleChange}
                                            />
                                            Pourcentage
                                        </label>
                                    </div>
                                </div>

                                {formData.mode_remuneration === 'fixe' ? (
                                    <div className="form-group">
                                        <label>Commission fixe</label>
                                        <input
                                            type="number"
                                            name="commission_fixe"
                                            value={formData.commission_fixe}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Taux commission (%)</label>
                                        <input
                                            type="number"
                                            name="taux_commission"
                                            value={formData.taux_commission}
                                            onChange={handleChange}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button type="button" className="btn-cancel" style={{ flex: 1 }}>
                                        <i className="bi bi-x-circle"></i> Annuler
                                    </button>
                                    <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                                        <i className="bi bi-check-circle"></i> Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right: List */}
                        <div className="commission-list">
                            <h3 style={{ color: '#8d6e63', marginBottom: '15px' }}>Commissions configurées</h3>
                            {commissions.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                    Aucune commission configurée
                                </p>
                            ) : (
                                commissions.map(commission => (
                                    <div key={commission.id_commission} className="commission-item">
                                        <div>
                                            <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                                                {commission.type_contrat}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                {commission.mode_remuneration === 'fixe'
                                                    ? `${commission.commission_fixe} FCFA`
                                                    : `${commission.taux_commission}%`
                                                }
                                            </div>
                                        </div>
                                        <button
                                            className="btn-icon-action delete"
                                            onClick={() => handleDelete(commission.id_commission)}
                                            style={{ padding: '6px 10px' }}
                                        >
                                            <i className="bi bi-trash"></i>
                                            Supprimer
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionModal;
