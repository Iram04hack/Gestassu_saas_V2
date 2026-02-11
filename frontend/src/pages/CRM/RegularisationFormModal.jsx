import React, { useState, useEffect } from 'react';
import { createMouvement } from '../../services/finances';

const RegularisationFormModal = ({ isOpen, onClose, client, onSuccess, type = 'credit' }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        montant: '',
        observation: '',
        date_mouvement: new Date().toISOString().slice(0, 16),
    });

    useEffect(() => {
        if (isOpen && client) {
            // Pré-remplir l'observation avec le nom du client
            const clientName = `${client.nom_client || ''} ${client.prenom_client || ''}`.trim().toUpperCase();
            setFormData({
                montant: '',
                observation: `Régularisation du compte intitulé - [${clientName}]`,
                date_mouvement: new Date().toISOString().slice(0, 16),
            });
        }
    }, [isOpen, client]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                idtransfert: client.id,
                datemouvement: formData.date_mouvement,
                mont_debit: type === 'debit' ? formData.montant : 0,
                mont_credit: type === 'credit' ? formData.montant : 0,
                observation: formData.observation,
                LibType_Mouvement: `Régularisation de compte – ${type === 'credit' ? 'crédit' : 'débit'}`,
                nature_compte: 'CLIENT',
            };

            await createMouvement(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Erreur création régularisation:', err);
            alert('Erreur lors de la création de la régularisation');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const clientName = client ? `${client.nom_client || ''} ${client.prenom_client || ''}`.trim().toUpperCase() : '';

    return (
        <div className="modal-overlay">
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .regularisation-modal-content {
                    background: white;
                    width: 650px;
                    max-width: 95vw;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
                    animation: slideUp 0.3s ease-out;
                }
                
                .regularisation-modal-header {
                    background: linear-gradient(135deg, #6d4c41 0%, #5d4037 100%);
                    color: white;
                    padding: 18px 24px;
                    font-size: 1.15rem;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                
                .regularisation-modal-body {
                    padding: 24px;
                    max-height: 65vh;
                    overflow-y: auto;
                }
                
                .regularisation-modal-body::-webkit-scrollbar {
                    width: 8px;
                }
                
                .regularisation-modal-body::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                
                .regularisation-modal-body::-webkit-scrollbar-thumb {
                    background: #8d6e63;
                    border-radius: 4px;
                }
                
                .form-group {
                    display: flex;
                    margin-bottom: 18px;
                    align-items: center;
                    transition: all 0.2s ease;
                }
                
                .form-label {
                    width: 180px;
                    font-size: 0.9rem;
                    color: #4a4a4a;
                    font-weight: 600;
                    padding-right: 12px;
                }
                
                .form-input-group {
                    flex: 1;
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                
                .form-input {
                    flex: 1;
                    padding: 10px 14px;
                    border: 1.5px solid #d7ccc8;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    background: white;
                }
                
                .form-input:focus {
                    outline: none;
                    border-color: #6d4c41;
                    box-shadow: 0 0 0 3px rgba(109, 76, 65, 0.1);
                }
                
                .form-input.warning-bg {
                    background-color: #fff9c4;
                    border-color: #f9e79f;
                }
                
                .form-input.readonly {
                    background-color: #fff9c4;
                    border-color: #f9e79f;
                    cursor: not-allowed;
                }
                
                textarea.form-input {
                    resize: vertical;
                    min-height: 80px;
                    font-family: inherit;
                }
                
                .btn-dots {
                    background: linear-gradient(135deg, #6d4c41 0%, #5d4037 100%);
                    color: white;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .btn-dots:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                
                .btn-dots:active {
                    transform: translateY(0);
                }
                
                .amount-input {
                    text-align: right;
                    color: #d32f2f;
                    font-weight: 700;
                    font-size: 1rem;
                }
                
                .badge-type {
                    padding: 6px 16px;
                    border-radius: 20px;
                    color: white;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 90px;
                    justify-content: center;
                    font-weight: 600;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                    transition: all 0.2s ease;
                }
                
                .badge-type:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                }
                
                .badge-credit {
                    background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
                }
                
                .badge-debit {
                    background: linear-gradient(135deg, #ef5350 0%, #f44336 100%);
                }
                
                .regularisation-modal-footer {
                    padding: 18px 24px;
                    background: #fafafa;
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    border-top: 1px solid #e0e0e0;
                }
                
                .btn-cancel,
                .btn-save {
                    background: linear-gradient(135deg, #6d4c41 0%, #5d4037 100%);
                    color: white;
                    padding: 10px 24px;
                    border-radius: 24px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(109, 76, 65, 0.2);
                }
                
                .btn-cancel {
                    background: linear-gradient(135deg, #757575 0%, #616161 100%);
                }
                
                .btn-cancel:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(117, 117, 117, 0.3);
                }
                
                .btn-save:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(109, 76, 65, 0.3);
                }
                
                .btn-cancel:active,
                .btn-save:active {
                    transform: translateY(0);
                }
                
                .btn-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
            `}</style>

            <div className="regularisation-modal-content">
                <div className="regularisation-modal-header">
                    Fiche régularisation de compte client
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="regularisation-modal-body">
                        <div className="form-group">
                            <label className="form-label">Intitulé du compte :</label>
                            <div style={{ fontWeight: 'bold' }}>
                                {clientName}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Solde client :</label>
                            <input
                                type="text"
                                className="form-input warning-bg amount-input"
                                value="0,00"
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Libellé du mouvement :</label>
                            <div className="form-input-group">
                                <input
                                    type="text"
                                    className="form-input warning-bg"
                                    value={`Régularisation de compte – ${type === 'credit' ? 'crédit' : 'débit'}`}
                                    readOnly
                                />
                                <button type="button" className="btn-dots">
                                    <i className="bi bi-three-dots"></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Type de mouvement :</label>
                            <div className="form-input-group" style={{ maxWidth: '150px' }}>
                                <span className={`badge-type ${type === 'credit' ? 'badge-credit' : 'badge-debit'}`}>
                                    {type === 'credit' ? 'Crédit' : 'Débit'}
                                    <i className={`bi ${type === 'credit' ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'}`}></i>
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date mouvement :</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={formData.date_mouvement}
                                onChange={(e) => setFormData({ ...formData, date_mouvement: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Montant :</label>
                            <input
                                type="number"
                                className="form-input amount-input"
                                value={formData.montant}
                                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                                placeholder="0,00"
                                required
                            />
                        </div>

                        <div className="form-group" style={{ alignItems: 'flex-start' }}>
                            <label className="form-label">Observation :</label>
                            <textarea
                                className="form-input"
                                rows="4"
                                value={formData.observation}
                                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <div className="regularisation-modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegularisationFormModal;
