import React, { useState, useEffect } from 'react';
import { getCaisses, createMouvement } from '../../services/finances';
import MovementTypeSelectionModal from './MovementTypeSelectionModal';

const MovementFormModal = ({ isOpen, onClose, client, soldeActuel = 0, onSuccess }) => {
    const [caisses, setCaisses] = useState([]);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const INITIAL = {
        libelle: '',
        type_mvt_id: '',
        type: '',
        caisse_id: '',
        date_mouvement: new Date().toISOString().slice(0, 16),
        montant: '',
        observation: '',
    };
    const [formData, setFormData] = useState(INITIAL);

    useEffect(() => {
        if (isOpen) {
            loadCaisses();
            setFormData({ ...INITIAL, date_mouvement: new Date().toISOString().slice(0, 16) });
            setError('');
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
            type: selectedType.type_op ? 'Crédit' : 'Débit',
        }));
        setIsTypeModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.libelle) { setError('Veuillez sélectionner un type de mouvement.'); return; }
        if (!formData.montant || parseFloat(formData.montant) <= 0) { setError('Veuillez saisir un montant valide.'); return; }
        setLoading(true);
        setError('');
        try {
            await createMouvement({
                idtransfert: client.id || client.id_client,
                datemouvement: formData.date_mouvement,
                mont_debit: formData.type === 'Débit' ? formData.montant : 0,
                mont_credit: formData.type === 'Crédit' ? formData.montant : 0,
                observation: formData.observation,
                IDTYPE_MVT: formData.type_mvt_id,
                IDCaisse: client.id || client.id_client,
                nature_compte: 'CLIENT',
                LibType_Mouvement: formData.libelle,
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Erreur création mouvement:', err);
            const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Erreur lors de la création du mouvement.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const clientName = client ? `${client.nom_client || ''} ${client.prenom_client || ''}`.trim().toUpperCase() : '';
    const isCredit = formData.type === 'Crédit';
    const isDebit = formData.type === 'Débit';
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
                    @keyframes mvtSlide {
                        from { opacity: 0; transform: translateY(22px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .mvt-modal {
                        background: #fff; width: 580px; max-width: 96vw;
                        border-radius: 18px; overflow: hidden;
                        box-shadow: 0 24px 70px rgba(0,0,0,0.22);
                        animation: mvtSlide 0.28s ease-out;
                        display: flex; flex-direction: column;
                        max-height: 90vh; min-height: 0;
                    }
                    .mvt-modal form {
                        display: flex; flex-direction: column;
                        flex: 1; overflow: hidden; min-height: 0;
                    }

                    /* ── Hero header ── */
                    .mvt-hero {
                        background: linear-gradient(135deg, #5d4037 0%, #3e2723 100%);
                        padding: 20px 24px 18px;
                        display: flex; align-items: flex-start; justify-content: space-between;
                        flex-shrink: 0;
                    }
                    .mvt-hero-left { display: flex; align-items: center; gap: 14px; }
                    .mvt-hero-icon {
                        width: 44px; height: 44px; border-radius: 12px;
                        background: rgba(255,255,255,0.15);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 1.3rem; color: white; flex-shrink: 0;
                    }
                    .mvt-hero-title {
                        color: white; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.3px;
                    }
                    .mvt-hero-sub {
                        color: rgba(255,255,255,0.65); font-size: 0.8rem; margin-top: 2px;
                    }
                    .mvt-close {
                        background: rgba(255,255,255,0.15); border: none; color: white;
                        width: 30px; height: 30px; border-radius: 8px;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; font-size: 1rem; transition: background 0.2s;
                        flex-shrink: 0;
                    }
                    .mvt-close:hover { background: rgba(255,255,255,0.28); }

                    /* ── Type badge strip ── */
                    .mvt-type-strip {
                        padding: 10px 24px 0;
                        display: flex; gap: 8px;
                        flex-shrink: 0;
                    }
                    .mvt-type-chip {
                        padding: 4px 14px; border-radius: 20px;
                        font-size: 0.8rem; font-weight: 700;
                        display: flex; align-items: center; gap: 5px;
                        letter-spacing: 0.3px;
                    }
                    .mvt-type-chip--credit { background: #e8f5e9; color: #2e7d32; }
                    .mvt-type-chip--debit  { background: #fdecea; color: #c62828; }
                    .mvt-type-chip--none   { background: #f5f5f5; color: #999; }

                    /* ── Body ── */
                    .mvt-body {
                        padding: 18px 24px 10px;
                        overflow-y: auto; flex: 1;
                        scrollbar-width: thin; scrollbar-color: #d7ccc8 #fff;
                    }

                    .mvt-client-row {
                        background: #fdf8f6; border: 1px solid #e8ddd9;
                        border-radius: 10px; padding: 10px 14px;
                        display: flex; align-items: center; gap: 10px;
                        margin-bottom: 16px;
                    }
                    .mvt-avatar {
                        width: 34px; height: 34px; border-radius: 50%;
                        background: linear-gradient(135deg, #8d6e63, #6d4c41);
                        color: white; display: flex; align-items: center;
                        justify-content: center; font-size: 0.85rem; font-weight: 700;
                        flex-shrink: 0;
                    }
                    .mvt-client-info-name { font-size: 0.88rem; font-weight: 700; color: #3e2723; }
                    .mvt-client-info-label { font-size: 0.74rem; color: #a1887f; }
                    .mvt-solde-banner {
                        display: flex; align-items: center; justify-content: space-between;
                        background: #fdf8f6; border: 1px solid #e8ddd9;
                        border-radius: 10px; padding: 10px 16px; margin-bottom: 14px;
                    }
                    .mvt-solde-label { font-size: 0.78rem; color: #8d6e63; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
                    .mvt-solde-value { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.3px; }
                    .mvt-solde-value.positive { color: #2e7d32; }
                    .mvt-solde-value.negative { color: #c62828; }
                    .mvt-solde-value.zero { color: #9e9e9e; }
                    .mvt-solde-currency { font-size: 0.75rem; font-weight: 600; color: #a1887f; margin-right: 3px; }

                    .mvt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                    .mvt-field { margin-bottom: 14px; }
                    .mvt-field.full { grid-column: 1 / -1; }

                    .mvt-label {
                        display: block; font-size: 0.78rem; font-weight: 700;
                        color: #6d4c41; margin-bottom: 6px; letter-spacing: 0.2px;
                        text-transform: uppercase;
                    }

                    .mvt-input, .mvt-select, .mvt-textarea {
                        width: 100%; padding: 9px 13px;
                        border: 1.5px solid #d7ccc8; border-radius: 9px;
                        font-size: 0.88rem; color: #3e2723; background: #fff;
                        outline: none; transition: border-color 0.2s, box-shadow 0.2s;
                        font-family: inherit; box-sizing: border-box;
                    }
                    .mvt-input:focus, .mvt-select:focus, .mvt-textarea:focus {
                        border-color: #6d4c41;
                        box-shadow: 0 0 0 3px rgba(109,76,65,0.1);
                    }
                    .mvt-input.readonly { background: #fdf8f6; color: #8d6e63; cursor: default; }
                    .mvt-textarea { min-height: 72px; resize: vertical; }

                    .mvt-input-btn {
                        display: flex; gap: 8px; align-items: stretch;
                    }
                    .mvt-input-btn .mvt-input { flex: 1; }
                    .mvt-btn-browse {
                        background: linear-gradient(135deg, #6d4c41, #5d4037);
                        color: white; border: none;
                        width: 40px; border-radius: 9px;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; font-size: 1rem;
                        transition: opacity 0.2s; flex-shrink: 0;
                    }
                    .mvt-btn-browse:hover { opacity: 0.85; }

                    .mvt-amount-input {
                        text-align: right; font-size: 1.05rem; font-weight: 700;
                        color: #c62828; letter-spacing: 0.5px;
                    }

                    .mvt-error {
                        background: #fdecea; border: 1px solid #ef9a9a;
                        border-radius: 8px; padding: 8px 14px;
                        color: #c62828; font-size: 0.82rem;
                        display: flex; align-items: center; gap: 8px;
                        margin-bottom: 14px;
                    }

                    .mvt-divider {
                        border: none; border-top: 1px solid #f0e8e4;
                        margin: 4px 0 14px;
                    }

                    /* ── Footer ── */
                    .mvt-footer {
                        padding: 14px 24px;
                        background: #fafaf9; border-top: 1px solid #f0e8e4;
                        display: flex; justify-content: flex-end; gap: 10px;
                        flex-shrink: 0;
                    }
                    .mvt-btn {
                        padding: 9px 22px; border-radius: 20px; border: none;
                        cursor: pointer; display: flex; align-items: center; gap: 7px;
                        font-size: 0.88rem; font-weight: 600; transition: all 0.2s;
                    }
                    .mvt-btn-cancel { background: #efebe9; color: #6d4c41; border: 1.5px solid #d7ccc8; }
                    .mvt-btn-cancel:hover { background: #e8ddd9; }
                    .mvt-btn-save {
                        background: linear-gradient(135deg, #6d4c41, #4e342e);
                        color: white; box-shadow: 0 2px 8px rgba(109,76,65,0.25);
                    }
                    .mvt-btn-save:hover { box-shadow: 0 4px 14px rgba(109,76,65,0.35); transform: translateY(-1px); }
                    .mvt-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                `}</style>

                <div className="mvt-modal">
                    {/* Hero */}
                    <div className="mvt-hero">
                        <div className="mvt-hero-left">
                            <div className="mvt-hero-icon"><i className="bi bi-arrow-left-right"></i></div>
                            <div>
                                <div className="mvt-hero-title">Mouvement de compte</div>
                                <div className="mvt-hero-sub">Enregistrer un débit ou crédit client</div>
                            </div>
                        </div>
                        <button className="mvt-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                    </div>

                    {/* Type badge */}
                    <div className="mvt-type-strip">
                        <span className={`mvt-type-chip ${isCredit ? 'mvt-type-chip--credit' : isDebit ? 'mvt-type-chip--debit' : 'mvt-type-chip--none'}`}>
                            {isCredit ? <><i className="bi bi-arrow-down-circle-fill"></i> Crédit</> :
                             isDebit  ? <><i className="bi bi-arrow-up-circle-fill"></i> Débit</> :
                             <><i className="bi bi-question-circle"></i> Type non sélectionné</>}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mvt-body">
                            {/* Client */}
                            <div className="mvt-client-row">
                                <div className="mvt-avatar">{clientName.charAt(0) || 'C'}</div>
                                <div>
                                    <div className="mvt-client-info-name">{clientName || '—'}</div>
                                    <div className="mvt-client-info-label">Compte client</div>
                                </div>
                            </div>

                            {/* Solde actuel */}
                            <div className="mvt-solde-banner">
                                <span className="mvt-solde-label"><i className="bi bi-wallet2"></i> Solde actuel du compte</span>
                                <span className={`mvt-solde-value ${soldeActuel > 0 ? 'positive' : soldeActuel < 0 ? 'negative' : 'zero'}`}>
                                    <span className="mvt-solde-currency">XAF</span>
                                    {fmt(soldeActuel)}
                                </span>
                            </div>

                            {error && (
                                <div className="mvt-error">
                                    <i className="bi bi-exclamation-triangle-fill"></i> {error}
                                </div>
                            )}

                            <hr className="mvt-divider" />

                            <div className="mvt-grid">
                                {/* Libellé du mouvement */}
                                <div className="mvt-field full">
                                    <label className="mvt-label">Libellé du mouvement</label>
                                    <div className="mvt-input-btn">
                                        <input
                                            type="text"
                                            className="mvt-input readonly"
                                            value={formData.libelle}
                                            readOnly
                                            placeholder="Cliquer sur … pour sélectionner"
                                        />
                                        <button type="button" className="mvt-btn-browse" onClick={() => setIsTypeModalOpen(true)} title="Choisir le type">
                                            <i className="bi bi-three-dots"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Caisse */}
                                <div className="mvt-field">
                                    <label className="mvt-label">Caisse impactée</label>
                                    <select
                                        className="mvt-select"
                                        value={formData.caisse_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, caisse_id: e.target.value }))}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {caisses.map(c => (
                                            <option key={c.id_caisse} value={c.id_caisse}>{c.lib_caisse}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div className="mvt-field">
                                    <label className="mvt-label">Date du mouvement</label>
                                    <input
                                        type="datetime-local"
                                        className="mvt-input"
                                        value={formData.date_mouvement}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date_mouvement: e.target.value }))}
                                    />
                                </div>

                                {/* Montant */}
                                <div className="mvt-field full">
                                    <label className="mvt-label">Montant (XAF)</label>
                                    <input
                                        type="number"
                                        className="mvt-input mvt-amount-input"
                                        value={formData.montant}
                                        onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                {/* Observation */}
                                <div className="mvt-field full">
                                    <label className="mvt-label">Observation</label>
                                    <textarea
                                        className="mvt-textarea"
                                        value={formData.observation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
                                        placeholder="Remarques éventuelles..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mvt-footer">
                            <button type="button" className="mvt-btn mvt-btn-cancel" onClick={onClose}>
                                <i className="bi bi-x-lg"></i> Annuler
                            </button>
                            <button type="submit" className="mvt-btn mvt-btn-save" disabled={loading}>
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

export default MovementFormModal;
