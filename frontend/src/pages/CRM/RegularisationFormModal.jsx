import React, { useState, useEffect } from 'react';
import { createMouvement } from '../../services/finances';
import MovementTypeSelectionModal from './MovementTypeSelectionModal';

const RegularisationFormModal = ({ isOpen, onClose, client, soldeActuel = 0, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        libelle: 'Régularisation de compte – crédit',
        type: 'credit',
        montant: '',
        observation: '',
        date_mouvement: new Date().toISOString().slice(0, 16),
    });

    useEffect(() => {
        if (isOpen && client) {
            const clientName = `${client.nom_client || ''} ${client.prenom_client || ''}`.trim().toUpperCase();
            setFormData({
                libelle: 'Régularisation de compte – crédit',
                type: 'credit',
                montant: '',
                observation: `Régularisation du compte intitulé - [${clientName}]`,
                date_mouvement: new Date().toISOString().slice(0, 16),
            });
            setError('');
        }
    }, [isOpen, client]);

    const handleTypeSelect = (selectedType) => {
        setFormData(prev => ({
            ...prev,
            libelle: selectedType.lib_type_mouvement,
            type: selectedType.type_op ? 'credit' : 'debit',
        }));
        setIsTypeModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.montant || parseFloat(formData.montant) <= 0) {
            setError('Veuillez saisir un montant valide.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createMouvement({
                idtransfert: client.id || client.id_client,
                datemouvement: formData.date_mouvement,
                mont_debit: formData.type === 'debit' ? formData.montant : 0,
                mont_credit: formData.type === 'credit' ? formData.montant : 0,
                observation: formData.observation,
                LibType_Mouvement: formData.libelle,
                IDCaisse: client.id || client.id_client,
                nature_compte: 'CLIENT',
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Erreur régularisation:', err);
            const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Erreur lors de la création de la régularisation.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isCredit = formData.type === 'credit';
    const clientName = client ? `${client.nom_client || ''} ${client.prenom_client || ''}`.trim().toUpperCase() : '';
    const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n ?? 0);

    return (
        <>
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
        }}>
            <style>{`
                @keyframes regSlide {
                    from { opacity: 0; transform: translateY(22px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .reg-modal {
                    background: #fff; width: 520px; max-width: 96vw;
                    border-radius: 18px; overflow: hidden;
                    box-shadow: 0 24px 70px rgba(0,0,0,0.22);
                    animation: regSlide 0.28s ease-out;
                    display: flex; flex-direction: column;
                    max-height: 90vh; min-height: 0;
                }
                .reg-modal form {
                    display: flex; flex-direction: column;
                    flex: 1; overflow: hidden; min-height: 0;
                }
                .reg-hero {
                    padding: 20px 24px 16px;
                    display: flex; align-items: flex-start; justify-content: space-between;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, #5d4037 0%, #3e2723 100%);
                }
                .reg-hero-left { display: flex; align-items: center; gap: 14px; }
                .reg-hero-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: rgba(255,255,255,0.18);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.4rem; color: white; flex-shrink: 0;
                }
                .reg-hero-title { color: white; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.3px; }
                .reg-hero-sub { color: rgba(255,255,255,0.7); font-size: 0.8rem; margin-top: 2px; }
                .reg-close {
                    background: rgba(255,255,255,0.15); border: none; color: white;
                    width: 30px; height: 30px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 1rem; transition: background 0.2s; flex-shrink: 0;
                }
                .reg-close:hover { background: rgba(255,255,255,0.28); }
                .reg-body {
                    padding: 20px 24px 10px; overflow-y: auto; flex: 1;
                    scrollbar-width: thin; scrollbar-color: #d7ccc8 #fff;
                }

                /* Solde banner */
                .reg-solde-banner {
                    display: flex; align-items: center; justify-content: space-between;
                    background: #fdf8f6; border: 1px solid #e8ddd9;
                    border-radius: 10px; padding: 10px 16px;
                    margin-bottom: 14px;
                }
                .reg-solde-label { font-size: 0.78rem; color: #8d6e63; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
                .reg-solde-value {
                    font-size: 1.1rem; font-weight: 800; letter-spacing: -0.3px;
                }
                .reg-solde-value.positive { color: #2e7d32; }
                .reg-solde-value.negative { color: #c62828; }
                .reg-solde-value.zero { color: #9e9e9e; }
                .reg-solde-currency { font-size: 0.75rem; font-weight: 600; color: #a1887f; margin-right: 3px; }

                .reg-client-row {
                    background: #fdf8f6; border: 1px solid #e8ddd9;
                    border-radius: 10px; padding: 10px 14px;
                    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
                }
                .reg-avatar {
                    width: 34px; height: 34px; border-radius: 50%;
                    background: linear-gradient(135deg, #8d6e63, #6d4c41);
                    color: white; display: flex; align-items: center;
                    justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0;
                }
                .reg-client-name { font-size: 0.88rem; font-weight: 700; color: #3e2723; }
                .reg-client-label { font-size: 0.74rem; color: #a1887f; }

                /* Type toggle */
                .reg-type-toggle {
                    display: flex; gap: 8px; margin-bottom: 14px;
                }
                .reg-type-btn {
                    flex: 1; padding: 8px 12px; border-radius: 9px; border: 2px solid transparent;
                    font-size: 0.84rem; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    transition: all 0.18s;
                }
                .reg-type-btn.credit { background: #e8f5e9; color: #2e7d32; border-color: transparent; }
                .reg-type-btn.credit.active { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,0.12); }
                .reg-type-btn.debit  { background: #fdecea; color: #c62828; border-color: transparent; }
                .reg-type-btn.debit.active  { border-color: #c62828; box-shadow: 0 0 0 3px rgba(198,40,40,0.12); }

                .reg-field { margin-bottom: 14px; }
                .reg-label {
                    display: block; font-size: 0.78rem; font-weight: 700;
                    color: #6d4c41; margin-bottom: 6px; letter-spacing: 0.2px; text-transform: uppercase;
                }
                .reg-input, .reg-textarea {
                    width: 100%; padding: 9px 13px;
                    border: 1.5px solid #d7ccc8; border-radius: 9px;
                    font-size: 0.88rem; color: #3e2723; background: #fff;
                    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: inherit; box-sizing: border-box;
                }
                .reg-input:focus, .reg-textarea:focus {
                    border-color: #6d4c41; box-shadow: 0 0 0 3px rgba(109,76,65,0.1);
                }
                .reg-input.readonly { background: #fdf8f6; color: #6d4c41; cursor: default; }
                .reg-textarea { min-height: 80px; resize: vertical; }
                .reg-amount-input { text-align: right; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.5px; }
                .reg-amount-credit { color: #2e7d32; }
                .reg-amount-debit  { color: #c62828; }

                .reg-input-btn { display: flex; gap: 8px; align-items: stretch; }
                .reg-input-btn .reg-input { flex: 1; }
                .reg-btn-browse {
                    background: linear-gradient(135deg, #6d4c41, #5d4037);
                    color: white; border: none; width: 40px; border-radius: 9px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 1rem; transition: opacity 0.2s; flex-shrink: 0;
                }
                .reg-btn-browse:hover { opacity: 0.85; }

                .reg-error {
                    background: #fdecea; border: 1px solid #ef9a9a;
                    border-radius: 8px; padding: 8px 14px;
                    color: #c62828; font-size: 0.82rem;
                    display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
                }
                .reg-divider { border: none; border-top: 1px solid #f0e8e4; margin: 2px 0 14px; }
                .reg-footer {
                    padding: 14px 24px; background: #fafaf9; border-top: 1px solid #f0e8e4;
                    display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;
                }
                .reg-btn {
                    padding: 9px 22px; border-radius: 20px; border: none;
                    cursor: pointer; display: flex; align-items: center; gap: 7px;
                    font-size: 0.88rem; font-weight: 600; transition: all 0.2s;
                }
                .reg-btn-cancel { background: #efebe9; color: #6d4c41; border: 1.5px solid #d7ccc8; }
                .reg-btn-cancel:hover { background: #e8ddd9; }
                .reg-btn-save {
                    background: linear-gradient(135deg, #6d4c41, #4e342e);
                    color: white; box-shadow: 0 2px 8px rgba(109,76,65,0.25);
                }
                .reg-btn-save:hover { box-shadow: 0 4px 14px rgba(109,76,65,0.35); transform: translateY(-1px); }
                .reg-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
            `}</style>

            <div className="reg-modal">
                {/* Hero */}
                <div className="reg-hero">
                    <div className="reg-hero-left">
                        <div className="reg-hero-icon">
                            <i className="bi bi-sliders"></i>
                        </div>
                        <div>
                            <div className="reg-hero-title">Fiche régularisation de compte client</div>
                            <div className="reg-hero-sub">Ajustement manuel du compte</div>
                        </div>
                    </div>
                    <button className="reg-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="reg-body">
                        {/* Client */}
                        <div className="reg-client-row">
                            <div className="reg-avatar">{clientName.charAt(0) || 'C'}</div>
                            <div>
                                <div className="reg-client-name">{clientName || '—'}</div>
                                <div className="reg-client-label">Intitulé du compte</div>
                            </div>
                        </div>

                        {/* Solde actuel */}
                        <div className="reg-solde-banner">
                            <span className="reg-solde-label"><i className="bi bi-wallet2"></i> Solde client</span>
                            <span className={`reg-solde-value ${soldeActuel > 0 ? 'positive' : soldeActuel < 0 ? 'negative' : 'zero'}`}>
                                <span className="reg-solde-currency">XAF</span>
                                {fmt(soldeActuel)}
                            </span>
                        </div>

                        {error && (
                            <div className="reg-error">
                                <i className="bi bi-exclamation-triangle-fill"></i> {error}
                            </div>
                        )}

                        <hr className="reg-divider" />

                        {/* Libellé du mouvement */}
                        <div className="reg-field">
                            <label className="reg-label">Libellé du mouvement</label>
                            <div className="reg-input-btn">
                                <input
                                    type="text"
                                    className="reg-input readonly"
                                    value={formData.libelle}
                                    readOnly
                                    placeholder="Cliquer sur … pour sélectionner"
                                />
                                <button type="button" className="reg-btn-browse" onClick={() => setIsTypeModalOpen(true)} title="Choisir le type">
                                    <i className="bi bi-three-dots"></i>
                                </button>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="reg-field">
                            <label className="reg-label">Date du mouvement</label>
                            <input
                                type="datetime-local"
                                className="reg-input"
                                value={formData.date_mouvement}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_mouvement: e.target.value }))}
                            />
                        </div>

                        {/* Montant */}
                        <div className="reg-field">
                            <label className="reg-label">Montant (XAF)</label>
                            <input
                                type="number"
                                className={`reg-input reg-amount-input ${isCredit ? 'reg-amount-credit' : 'reg-amount-debit'}`}
                                value={formData.montant}
                                onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>

                        {/* Observation */}
                        <div className="reg-field">
                            <label className="reg-label">Observation</label>
                            <textarea
                                className="reg-textarea"
                                value={formData.observation}
                                onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="reg-footer">
                        <button type="button" className="reg-btn reg-btn-cancel" onClick={onClose}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                        <button type="submit" className="reg-btn reg-btn-save" disabled={loading}>
                            <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <MovementTypeSelectionModal
            isOpen={isTypeModalOpen}
            onClose={() => setIsTypeModalOpen(false)}
            onSelect={handleTypeSelect}
        />
        </>
    );
};

export default RegularisationFormModal;
