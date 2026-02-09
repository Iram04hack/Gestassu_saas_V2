import React, { useState, useEffect } from 'react';
import { getCaisses, createMouvement } from '../../services/finances';
import MovementTypeSelectionModal from './MovementTypeSelectionModal';

const MovementFormModal = ({ isOpen, onClose, client, onSuccess }) => {
    const [caisses, setCaisses] = useState([]);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        libelle: '',
        type_mvt_id: '',
        type: '', // 'Crédit' or 'Débit'
        caisse_id: '',
        type_impact: '',
        date_mouvement: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
        montant: '',
        observation: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadCaisses();
            // Reset form
            setFormData({
                libelle: '',
                type_mvt_id: '',
                type: '',
                caisse_id: '',
                type_impact: '',
                date_mouvement: new Date().toISOString().slice(0, 16),
                montant: '',
                observation: ''
            });
        }
    }, [isOpen]);

    const loadCaisses = async () => {
        try {
            const data = await getCaisses();
            setCaisses(data.results || data || []);
        } catch (err) {
            console.error('Erreur chargement caisses:', err);
        }
    };

    const handleTypeSelect = (selectedType) => {
        setFormData(prev => ({
            ...prev,
            libelle: selectedType.lib_type_mouvement,
            type_mvt_id: selectedType.id_type_mvt,
            type: selectedType.type_op ? 'Crédit' : 'Débit'
        }));
        setIsTypeModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mapping frontend data to backend model (Mouvement)
            const payload = {
                idtransfert: client.id, // Client ID
                datemouvement: formData.date_mouvement,
                mont_debit: formData.type === 'Débit' ? formData.montant : 0,
                mont_credit: formData.type === 'Crédit' ? formData.montant : 0,
                observation: formData.observation,
                IDTYPE_MVT: formData.type_mvt_id,
                IDCaisse: formData.caisse_id,
                nature_compte: 'CLIENT',
                LibType_Mouvement: formData.libelle,
                // IDUTILISATEUR_save: 'current_user_id', // Should be handled by backend
            };

            await createMouvement(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Erreur création mouvement:', err);
            alert('Erreur lors de la création du mouvement');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                }
                .movement-modal-content {
                    background: white; width: 600px; max-width: 95vw;
                    border-radius: 4px; overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                .movement-modal-header {
                    background: #5d4037; color: white; padding: 15px;
                    font-size: 1.1rem; font-weight: 500;
                }
                .movement-modal-body { padding: 20px; }
                .form-group {
                    display: flex; margin-bottom: 15px; align-items: center;
                }
                .form-label {
                    width: 160px; font-size: 0.9rem; color: #333; font-weight: 500;
                }
                .form-input-group {
                    flex: 1; display: flex; gap: 5px; align-items: center;
                }
                .form-input {
                    flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 2px;
                }
                .form-input.warning-bg { background-color: #fff9c4; } /* Yellowish bg like image */
                .form-input.readonly { background-color: #fff9c4; border: 1px solid #ccc; }
                
                .btn-dots {
                    background: #5d4037; color: white; border: none;
                    width: 30px; height: 30px; border-radius: 2px;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                }
                .amount-input {
                    text-align: right; color: #d32f2f; font-weight: bold;
                }
                .movement-modal-footer {
                    padding: 15px; background: #f5f5f5; display: flex; justify-content: center; gap: 15px;
                }
                .btn-cancel {
                    background: #5d4037; color: white; padding: 8px 20px; border-radius: 20px; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px;
                }
                .btn-save {
                    background: #5d4037; color: white; padding: 8px 20px; border-radius: 20px; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px;
                }
            `}</style>

            <div className="movement-modal-content">
                <div className="movement-modal-header">
                    Fiche mouvement de compte client
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="movement-modal-body">
                        <div className="form-group">
                            <label className="form-label">Intitulé du compte :</label>
                            <div style={{ fontWeight: 'bold' }}>
                                {client ? `${client.nom_client || ''} ${client.prenom_client || ''}`.toUpperCase() : ''}
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
                                    value={formData.libelle}
                                    readOnly
                                    placeholder="Sélectionner..."
                                />
                                <button type="button" className="btn-dots" onClick={() => setIsTypeModalOpen(true)}>
                                    <i className="bi bi-three-dots"></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Type de mouvement :</label>
                            <div className="form-input-group" style={{ maxWidth: '150px' }}>
                                <input
                                    type="text"
                                    className="form-input warning-bg"
                                    value={formData.type}
                                    readOnly
                                    style={{
                                        color: formData.type === 'Crédit' ? 'green' : (formData.type === 'Débit' ? 'red' : 'inherit'),
                                        fontWeight: 'bold'
                                    }}
                                />
                                {formData.type && (
                                    <i className={`bi ${formData.type === 'Crédit' ? 'bi-arrow-down-circle-fill text-success' : 'bi-arrow-up-circle-fill text-danger'}`}></i>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Caisse impacté :</label>
                            <div className="form-input-group">
                                <select
                                    className="form-input"
                                    value={formData.caisse_id}
                                    onChange={(e) => setFormData({ ...formData, caisse_id: e.target.value })}
                                >
                                    <option value="">Sélectionner une caisse...</option>
                                    {caisses.map(c => (
                                        <option key={c.id_caisse} value={c.id_caisse}>{c.lib_caisse}</option>
                                    ))}
                                </select>
                                <button type="button" className="btn-dots"><i className="bi bi-three-dots"></i></button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Type d'impact :</label>
                            <select className="form-input warning-bg" style={{ maxWidth: '100px' }}>
                                <option></option>
                            </select>
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

                    <div className="movement-modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>

            <MovementTypeSelectionModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onSelect={handleTypeSelect}
            />
        </div>
    );
};

export default MovementFormModal;
