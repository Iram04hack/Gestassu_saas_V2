import { useState, useCallback, useRef, useEffect } from 'react';
import './Quittances.css';
import api from '../../services/api';
import { getMouvementsByClient } from '../../services/finances';
import MovementFormModal from '../CRM/MovementFormModal';

const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtMoney = (v) => (v != null ? Number(v).toLocaleString('fr-FR') : '-');

const TABS = [
    { key: '0', label: 'En attente' },
    { key: '1', label: 'Soldée' },
    { key: '2', label: 'Annulée' },
];

const ITEMS_PER_PAGE = 25;

const etatBadge = (etatKey) => {
    if (etatKey === '0') return <span className="qtt-etat-badge qtt-etat-attente">En attente</span>;
    if (etatKey === '1') return <span className="qtt-etat-badge qtt-etat-soldee">Soldée</span>;
    if (etatKey === '2') return <span className="qtt-etat-badge qtt-etat-annulee">Annulée</span>;
    return <span className="qtt-etat-badge">-</span>;
};

// ── Formulaire Ajouter un règlement ───────────────────────────────
const ReglementForm = ({ quittance, onClose, onSaved }) => {
    const [payeAssureur, setPayeAssureur] = useState(quittance.est_regle_chez_assureur || false);
    const [montant, setMontant]           = useState('');
    const [dateEncaiss, setDateEncaiss]   = useState(() => new Date().toISOString().slice(0, 16));
    const [observation, setObservation]   = useState(
        `[N° police: ${quittance.num_police || ''}] [N° quittance: ${quittance.numquittance || ''}] [Client: ${quittance.nom_client || ''}]`
    );
    const [saving, setSaving]             = useState(false);
    const [error, setError]               = useState(null);
    const [soldeClient, setSoldeClient]   = useState(null);
    const [soldeLoading, setSoldeLoading] = useState(false);
    const [isApproOpen, setIsApproOpen]   = useState(false);
    const bodyRef = useRef(null);

    const primeTotale   = quittance.prime_totale ?? 0;
    // Utiliser les valeurs calculées côté backend si disponibles (règlement par tranche)
    const dejaEncaisse  = quittance.montant_encaisse ?? 0;
    const resteAPayer   = quittance.reste_a_payer ?? primeTotale;
    const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n ?? 0);

    // Construire un objet client compatible avec MovementFormModal
    const clientForModal = {
        id: quittance.id_client,
        id_client: quittance.id_client,
        nom_client: quittance.nom_client || '',
        prenom_client: '',
    };

    useEffect(() => {
        if (quittance.id_client) {
            setSoldeLoading(true);
            getMouvementsByClient(quittance.id_client)
                .then(data => {
                    const results = data.results || data || [];
                    let credit = 0, debit = 0;
                    results.forEach(m => {
                        credit += parseFloat(m.credit || m.mont_credit || 0);
                        debit  += parseFloat(m.debit  || m.mont_debit  || 0);
                    });
                    setSoldeClient(credit - debit);
                })
                .catch(() => setSoldeClient(null))
                .finally(() => setSoldeLoading(false));
        }
    }, [quittance.id_client]);

    // Totalité = reste à payer réel
    const handleTotalite = () => setMontant(String(resteAPayer));

    const handleSubmit = async () => {
        const montantNum = Number(montant);
        if (!montant || isNaN(montantNum) || montantNum <= 0) {
            setError('Veuillez saisir un montant valide.');
            return;
        }
        if (montantNum > resteAPayer) {
            setError(`Le montant saisi (${fmt(montantNum)} XAF) dépasse le reste à payer (${fmt(resteAPayer)} XAF).`);
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await api.post('/finances/mouvements/', {
                idquittance: quittance.idquittance,
                id_contrat: quittance.id_contrat,
                mont_debit: montant,
                mont_credit: '0',
                datemouvement: dateEncaiss,
                observation,
                nature_compte: 'CLIENT',
                IDCaisse: quittance.id_client || null,
                LibType_Mouvement: 'Règlement de quittance',
            });
            // Le backend solde automatiquement si total encaissé >= prime_totale
            onSaved();
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.error || err?.response?.data?.detail || "Erreur lors de l'enregistrement du règlement.";
            setError(msg);
            if (bodyRef.current) bodyRef.current.scrollTop = 0;
        } finally {
            setSaving(false);
        }
    };

    const handleApproSuccess = () => {
        setIsApproOpen(false);
        // Recharger le solde
        if (quittance.id_client) {
            setSoldeLoading(true);
            getMouvementsByClient(quittance.id_client)
                .then(data => {
                    const results = data.results || data || [];
                    let credit = 0, debit = 0;
                    results.forEach(m => {
                        credit += parseFloat(m.credit || m.mont_credit || 0);
                        debit  += parseFloat(m.debit  || m.mont_debit  || 0);
                    });
                    setSoldeClient(credit - debit);
                })
                .catch(() => {})
                .finally(() => setSoldeLoading(false));
        }
    };

    return (
        <>
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
        }} onClick={onClose}>
            <style>{`
                @keyframes rglSlide {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .rgl-modal {
                    background: #fff; width: 560px; max-width: 96vw;
                    border-radius: 18px; overflow: hidden;
                    box-shadow: 0 24px 70px rgba(0,0,0,0.22);
                    animation: rglSlide 0.28s ease-out;
                    display: flex; flex-direction: column;
                    max-height: 90vh; min-height: 0;
                }
                .rgl-modal form {
                    display: flex; flex-direction: column;
                    flex: 1; overflow: hidden; min-height: 0;
                }
                .rgl-hero {
                    background: linear-gradient(135deg, #5d4037 0%, #3e2723 100%);
                    padding: 20px 24px 18px;
                    display: flex; align-items: flex-start; justify-content: space-between;
                    flex-shrink: 0;
                }
                .rgl-hero-left { display: flex; align-items: center; gap: 14px; }
                .rgl-hero-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: rgba(255,255,255,0.15);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.3rem; color: white; flex-shrink: 0;
                }
                .rgl-hero-title { color: white; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.3px; }
                .rgl-hero-sub   { color: rgba(255,255,255,0.65); font-size: 0.8rem; margin-top: 2px; }
                .rgl-close {
                    background: rgba(255,255,255,0.15); border: none; color: white;
                    width: 30px; height: 30px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 1rem; transition: background 0.2s; flex-shrink: 0;
                }
                .rgl-close:hover { background: rgba(255,255,255,0.28); }

                .rgl-body {
                    padding: 18px 24px 10px;
                    overflow-y: auto; flex: 1;
                    scrollbar-width: thin; scrollbar-color: #d7ccc8 #fff;
                }

                /* Checkbox assureur */
                .rgl-check-label {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.85rem; color: #5d4037; font-weight: 600;
                    margin-bottom: 14px; cursor: pointer;
                    user-select: none;
                }
                .rgl-check-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #6d4c41; cursor: pointer; }

                /* Bannière compte client */
                .rgl-compte-banner {
                    display: flex; align-items: center; justify-content: space-between;
                    background: #fdf8f6; border: 1px solid #e8ddd9;
                    border-radius: 10px; padding: 10px 16px; margin-bottom: 14px;
                }
                .rgl-compte-left { display: flex; flex-direction: column; gap: 2px; }
                .rgl-compte-label { font-size: 0.78rem; color: #8d6e63; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
                .rgl-compte-solde { font-size: 1.05rem; font-weight: 800; letter-spacing: -0.3px; }
                .rgl-compte-solde.positive { color: #2e7d32; }
                .rgl-compte-solde.negative { color: #c62828; }
                .rgl-compte-solde.zero     { color: #9e9e9e; }
                .rgl-compte-currency { font-size: 0.72rem; font-weight: 600; color: #a1887f; margin-right: 3px; }
                .rgl-btn-appro {
                    background: linear-gradient(135deg, #6d4c41, #5d4037);
                    color: white; border: none; border-radius: 20px;
                    padding: 7px 16px; font-size: 0.82rem; font-weight: 600;
                    display: flex; align-items: center; gap: 6px;
                    cursor: pointer; transition: opacity 0.2s; white-space: nowrap;
                }
                .rgl-btn-appro:hover { opacity: 0.85; }

                /* Grille info quittance */
                .rgl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
                .rgl-field { display: flex; flex-direction: column; gap: 4px; }
                .rgl-field.full { grid-column: 1 / -1; }
                .rgl-label {
                    font-size: 0.75rem; font-weight: 700; color: #6d4c41;
                    text-transform: uppercase; letter-spacing: 0.2px;
                }
                .rgl-label.red { color: #c62828; }
                .rgl-input, .rgl-textarea {
                    width: 100%; padding: 8px 12px;
                    border: 1.5px solid #d7ccc8; border-radius: 9px;
                    font-size: 0.88rem; color: #3e2723; background: #fff;
                    outline: none; font-family: inherit; box-sizing: border-box;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .rgl-input:focus, .rgl-textarea:focus {
                    border-color: #6d4c41; box-shadow: 0 0 0 3px rgba(109,76,65,0.1);
                }
                .rgl-input.ro  { background: #fdf8f6; color: #6d4c41; cursor: default; }
                .rgl-input.red-val { color: #c62828; font-weight: 700; text-align: right; }
                .rgl-input-group { display: flex; gap: 8px; align-items: stretch; }
                .rgl-input-group .rgl-input { flex: 1; text-align: right; font-weight: 700; font-size: 1rem; color: #c62828; }
                .rgl-btn-totalite {
                    background: linear-gradient(135deg, #bf360c, #e64a19);
                    color: white; border: none; border-radius: 9px;
                    padding: 0 14px; font-size: 0.82rem; font-weight: 700;
                    cursor: pointer; white-space: nowrap; transition: opacity 0.2s;
                }
                .rgl-btn-totalite:hover { opacity: 0.85; }
                .rgl-textarea { min-height: 72px; resize: vertical; }
                .rgl-divider { border: none; border-top: 1px solid #f0e8e4; margin: 4px 0 14px; }

                .rgl-error {
                    background: #fdecea; border: 1px solid #ef9a9a;
                    border-radius: 8px; padding: 8px 14px;
                    color: #c62828; font-size: 0.82rem;
                    display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
                }
                .rgl-footer {
                    padding: 14px 24px; background: #fafaf9; border-top: 1px solid #f0e8e4;
                    display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;
                }
                .rgl-btn {
                    padding: 9px 22px; border-radius: 20px; border: none;
                    cursor: pointer; display: flex; align-items: center; gap: 7px;
                    font-size: 0.88rem; font-weight: 600; transition: all 0.2s;
                }
                .rgl-btn-cancel { background: #efebe9; color: #6d4c41; border: 1.5px solid #d7ccc8; }
                .rgl-btn-cancel:hover { background: #e8ddd9; }
                .rgl-btn-save {
                    background: linear-gradient(135deg, #6d4c41, #4e342e);
                    color: white; box-shadow: 0 2px 8px rgba(109,76,65,0.25);
                }
                .rgl-btn-save:hover { box-shadow: 0 4px 14px rgba(109,76,65,0.35); transform: translateY(-1px); }
                .rgl-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
            `}</style>

            <div className="rgl-modal" onClick={e => e.stopPropagation()}>
                {/* Hero */}
                <div className="rgl-hero">
                    <div className="rgl-hero-left">
                        <div className="rgl-hero-icon"><i className="bi bi-receipt"></i></div>
                        <div>
                            <div className="rgl-hero-title">Règlement de quittance</div>
                            <div className="rgl-hero-sub">Encaissement de la prime</div>
                        </div>
                    </div>
                    <button className="rgl-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                </div>

                <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                    <div className="rgl-body" ref={bodyRef}>
                        {error && (
                            <div className="rgl-error">
                                <i className="bi bi-exclamation-triangle-fill"></i> {error}
                            </div>
                        )}

                        {/* Checkbox assureur */}
                        <label className="rgl-check-label">
                            <input type="checkbox" checked={payeAssureur} onChange={e => setPayeAssureur(e.target.checked)} />
                            Cette quittance a été payée chez l'assureur
                        </label>

                        {/* Infos quittance (read-only) */}
                        <div className="rgl-grid">
                            <div className="rgl-field">
                                <label className="rgl-label">Nº quittance</label>
                                <input className="rgl-input ro" readOnly value={quittance.numquittance || ''} />
                            </div>
                            <div className="rgl-field">
                                <label className="rgl-label">Nº police</label>
                                <input className="rgl-input ro" readOnly value={quittance.num_police || ''} />
                            </div>
                            <div className="rgl-field">
                                <label className="rgl-label">Compagnie</label>
                                <input className="rgl-input ro" readOnly value={quittance.nom_compagnie || ''} />
                            </div>
                            <div className="rgl-field">
                                <label className="rgl-label">Produit</label>
                                <input className="rgl-input ro" readOnly value={quittance.lib_produit || ''} />
                            </div>
                            <div className="rgl-field full">
                                <label className="rgl-label">Client</label>
                                <input className="rgl-input ro" readOnly value={quittance.nom_client || ''} />
                            </div>
                        </div>

                        {/* Compte client */}
                        <div className="rgl-compte-banner">
                            <div className="rgl-compte-left">
                                <span className="rgl-compte-label"><i className="bi bi-wallet2"></i> Compte client</span>
                                <span className={`rgl-compte-solde ${soldeClient === null ? 'zero' : soldeClient > 0 ? 'positive' : soldeClient < 0 ? 'negative' : 'zero'}`}>
                                    {soldeLoading
                                        ? <span style={{ fontSize: '0.8rem', color: '#a1887f' }}>Chargement…</span>
                                        : soldeClient === null
                                            ? <span style={{ fontSize: '0.8rem', color: '#a1887f' }}>—</span>
                                            : <><span className="rgl-compte-currency">XAF</span>{fmt(soldeClient)}</>
                                    }
                                </span>
                            </div>
                            <button
                                type="button"
                                className="rgl-btn-appro"
                                onClick={() => setIsApproOpen(true)}
                            >
                                <i className="bi bi-plus-circle"></i> Approvisionnement
                            </button>
                        </div>

                        <hr className="rgl-divider" />

                        {/* Montants */}
                        <div className="rgl-grid">
                            <div className="rgl-field">
                                <label className="rgl-label red">Prime totale</label>
                                <input className="rgl-input ro red-val" readOnly value={fmt(primeTotale)} />
                            </div>
                            <div className="rgl-field">
                                <label className="rgl-label">Déjà encaissé</label>
                                <input className="rgl-input ro" style={{ textAlign: 'right', fontWeight: 700, color: '#2e7d32' }} readOnly value={fmt(dejaEncaisse)} />
                            </div>
                            <div className="rgl-field full">
                                <label className="rgl-label" style={{ color: resteAPayer > 0 ? '#c62828' : '#2e7d32' }}>
                                    Reste à payer
                                </label>
                                <input
                                    className="rgl-input ro"
                                    style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: resteAPayer > 0 ? '#c62828' : '#2e7d32' }}
                                    readOnly
                                    value={fmt(resteAPayer)}
                                />
                            </div>
                        </div>
                        <div className="rgl-grid">
                            <div className="rgl-field">
                                <label className="rgl-label red">Mont. encaissé</label>
                                <div className="rgl-input-group">
                                    <input
                                        type="number"
                                        className="rgl-input"
                                        min="0"
                                        value={montant}
                                        onChange={e => setMontant(e.target.value)}
                                        placeholder="0"
                                        required
                                    />
                                    <button type="button" className="rgl-btn-totalite" onClick={handleTotalite}>Totalité</button>
                                </div>
                            </div>
                            <div className="rgl-field">
                                <label className="rgl-label">Date encaiss.</label>
                                <input
                                    type="datetime-local"
                                    className="rgl-input"
                                    value={dateEncaiss}
                                    onChange={e => setDateEncaiss(e.target.value)}
                                />
                            </div>
                            <div className="rgl-field full">
                                <label className="rgl-label">Observation</label>
                                <textarea
                                    className="rgl-textarea"
                                    rows={3}
                                    value={observation}
                                    onChange={e => setObservation(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rgl-footer">
                        <button type="button" className="rgl-btn rgl-btn-cancel" onClick={onClose} disabled={saving}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                        <button type="submit" className="rgl-btn rgl-btn-save" disabled={saving}>
                            <i className="bi bi-check-lg"></i> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* Modal d'approvisionnement du compte client */}
        <MovementFormModal
            isOpen={isApproOpen}
            onClose={() => setIsApproOpen(false)}
            client={clientForModal}
            soldeActuel={soldeClient ?? 0}
            onSuccess={handleApproSuccess}
        />
        </>
    );
};

// ── Modale de confirmation générique ──────────────────────────────
const ConfirmModal = ({ variant, title, message, onConfirm, onCancel, loading }) => (
    <div className="qtt-confirm-overlay" onClick={onCancel}>
        <div className="qtt-confirm-box" onClick={e => e.stopPropagation()}>
            <div className={`qtt-confirm-header qtt-confirm-header--${variant}`}>
                <i className={variant === 'danger' ? 'bi bi-trash3' : 'bi bi-x-octagon'}></i>
                <span>{title}</span>
            </div>
            <div className="qtt-confirm-body">{message}</div>
            <div className="qtt-confirm-actions">
                <button className="qtt-popup-btn qtt-popup-btn--cancel" onClick={onCancel} disabled={loading}>
                    Annuler
                </button>
                <button
                    className={`qtt-popup-btn ${variant === 'danger' ? 'qtt-popup-btn--danger' : 'qtt-popup-btn--warning'}`}
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading
                        ? <><i className="bi bi-hourglass-split"></i> En cours…</>
                        : <><i className={variant === 'danger' ? 'bi bi-trash3' : 'bi bi-check2'}></i> Confirmer</>}
                </button>
            </div>
        </div>
    </div>
);

// ── Popup Détails ──────────────────────────────────────────────────
const DetailPopup = ({ quittance, onClose, onReload }) => {
    if (!quittance) return null;

    const [quittanceData, setQuittanceData] = useState(quittance);

    const primeTotale = quittanceData.prime_totale ?? 0;
    const etat    = quittanceData._tabKey;
    const solde   = quittanceData.montant_encaisse ?? (etat === '1' ? primeTotale : 0);
    const impaie  = quittanceData.reste_a_payer   ?? (etat === '0' ? primeTotale : 0);
    const heroBg  = etat === '1' ? 'qtt-hero--soldee' : etat === '2' ? 'qtt-hero--annulee' : 'qtt-hero--attente';
    const [mouvements, setMouvements]       = useState([]);
    const [mvtLoading, setMvtLoading]       = useState(true);
    const [showReglement, setShowReglement] = useState(false);
    const [confirm, setConfirm]             = useState(null); // { type: 'annuler'|'supprimer' }
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError]     = useState(null);

    const reloadMvt = () => {
        setMvtLoading(true);
        api.get('/finances/mouvements/', {
            params: { idquittance: quittanceData.idquittance, page_size: 50 }
        })
        .then(r => setMouvements(toArray(r.data)))
        .catch(() => setMouvements([]))
        .finally(() => setMvtLoading(false));
    };

    const reloadQuittance = () => {
        api.get(`/finances/quittances/${quittanceData.idquittance}/`)
            .then(r => {
                const etatMap = { 1: '1', '-1': '2', 0: '0' };
                const newTabKey = etatMap[r.data.etat_quittance] ?? quittanceData._tabKey;
                setQuittanceData({ ...r.data, _tabKey: newTabKey });
            })
            .catch(() => {});
    };

    useEffect(() => { reloadMvt(); }, [quittanceData.idquittance]);

    const handleReglementSaved = () => {
        setShowReglement(false);
        reloadMvt();
        reloadQuittance();
        onReload();
    };

    const handleConfirmAction = async () => {
        if (!confirm) return;
        setActionLoading(true);
        setActionError(null);
        try {
            if (confirm.type === 'annuler') {
                await api.post(`/finances/quittances/${quittanceData.idquittance}/annuler/`);
            } else if (confirm.type === 'supprimer') {
                await api.delete(`/finances/quittances/${quittanceData.idquittance}/`);
            }
            setConfirm(null);
            onReload();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.error || 'Une erreur est survenue.';
            setActionError(msg);
        } finally {
            setActionLoading(false);
        }
    };

    if (showReglement) {
        return (
            <ReglementForm
                quittance={quittanceData}
                onClose={() => setShowReglement(false)}
                onSaved={handleReglementSaved}
            />
        );
    }

    const isAnnulee = etat === '2';

    return (
        <div className="qtt-popup-overlay" onClick={onClose}>
            <div className="qtt-popup" onClick={e => e.stopPropagation()}>

                {/* ── Hero ── */}
                <div className={`qtt-hero ${heroBg}`}>
                    <div className="qtt-hero-top">
                        <span className="qtt-hero-label">Quittance</span>
                        {etatBadge(etat)}
                        <button className="qtt-popup-close" onClick={onClose} title="Fermer">
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <div className="qtt-hero-num">{quittanceData.numquittance || '—'}</div>
                    <div className="qtt-hero-client">
                        <i className="bi bi-person"></i>
                        {quittanceData.nom_client || '-'}
                    </div>
                    <div className="qtt-hero-amounts">
                        <div className="qtt-hero-amount">
                            <span className="qtt-hero-amount-label">Prime totale</span>
                            <span className="qtt-hero-amount-value">{fmtMoney(primeTotale)}</span>
                        </div>
                        <div className="qtt-hero-amount-sep"></div>
                        <div className="qtt-hero-amount">
                            <span className="qtt-hero-amount-label">Soldé</span>
                            <span className="qtt-hero-amount-value qtt-hero-amount--green">{fmtMoney(solde)}</span>
                        </div>
                        <div className="qtt-hero-amount-sep"></div>
                        <div className="qtt-hero-amount">
                            <span className="qtt-hero-amount-label">Impayé</span>
                            <span className="qtt-hero-amount-value qtt-hero-amount--red">{fmtMoney(impaie)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Corps ── */}
                <div className="qtt-popup-body">

                    {actionError && (
                        <div className="qtt-form-error">
                            <i className="bi bi-exclamation-triangle"></i> {actionError}
                        </div>
                    )}

                    {/* Infos contrat — grille 2 colonnes compacte */}
                    <div className="qtt-info-grid">
                        <div className="qtt-info-col">
                            <div className="qtt-info-row">
                                <span className="qtt-info-label"><i className="bi bi-shield"></i> Nº Police</span>
                                <span className="qtt-info-value qtt-info-value--bold">{quittanceData.num_police || '-'}</span>
                            </div>
                            <div className="qtt-info-row">
                                <span className="qtt-info-label"><i className="bi bi-building"></i> Compagnie</span>
                                <span className="qtt-info-value">{quittanceData.nom_compagnie || '-'}</span>
                            </div>
                            <div className="qtt-info-row">
                                <span className="qtt-info-label"><i className="bi bi-tag"></i> Produit</span>
                                <span className="qtt-info-value">{quittanceData.lib_produit || '-'}</span>
                            </div>
                        </div>
                        <div className="qtt-info-col">
                            <div className="qtt-info-row">
                                <span className="qtt-info-label"><i className="bi bi-calendar-check"></i> Date d'effet</span>
                                <span className="qtt-info-value">{formatDate(quittanceData.date_effet)}</span>
                            </div>
                            <div className="qtt-info-row">
                                <span className="qtt-info-label"><i className="bi bi-calendar-x"></i> Échéance</span>
                                <span className="qtt-info-value">{formatDate(quittanceData.date_echeance)}</span>
                            </div>
                            <div className="qtt-info-row">
                                <span className="qtt-info-label"><i className="bi bi-person-badge"></i> Émis par</span>
                                <span className="qtt-info-value">{quittanceData.emis_par || '-'}</span>
                            </div>
                        </div>
                    </div>
                    {quittanceData.observation_quittance && (
                        <div className="qtt-obs-block">
                            <i className="bi bi-chat-left-text"></i>
                            <span>{quittanceData.observation_quittance}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="qtt-popup-actions">
                        <button
                            className="qtt-popup-btn qtt-popup-btn--primary"
                            onClick={() => setShowReglement(true)}
                            disabled={isAnnulee}
                        >
                            <i className="bi bi-plus-circle"></i> Ajouter un règlement
                        </button>
                        <button
                            className="qtt-popup-btn qtt-popup-btn--warning"
                            onClick={() => setConfirm({ type: 'annuler' })}
                            disabled={isAnnulee}
                        >
                            <i className="bi bi-x-circle"></i> Annuler
                        </button>
                        <button
                            className="qtt-popup-btn qtt-popup-btn--danger"
                            onClick={() => setConfirm({ type: 'supprimer' })}
                        >
                            <i className="bi bi-trash"></i> Supprimer
                        </button>
                    </div>

                    {/* Historique des règlements — occupe tout l'espace restant */}
                    <div className="qtt-mvt-section qtt-mvt-section--flex">
                        <div className="qtt-mvt-header">
                            <i className="bi bi-clock-history"></i>
                            <span>{mvtLoading ? 'Chargement…' : `${mouvements.length} Règlement(s)`}</span>
                        </div>
                        <div className="qtt-mvt-list qtt-mvt-list--grow">
                            {mvtLoading ? (
                                <div className="qtt-mvt-empty"><i className="bi bi-hourglass-split"></i></div>
                            ) : mouvements.length === 0 ? (
                                <div className="qtt-mvt-empty">Aucun règlement enregistré.</div>
                            ) : mouvements.map((m, i) => (
                                <div key={m.idmouvement || i} className="qtt-mvt-card">
                                    <div className="qtt-mvt-left">
                                        <span className="qtt-mvt-num">N°{m.num_mvt || m.idmouvement?.slice(0, 6) || '—'}</span>
                                        <span className="qtt-mvt-badge-debit">Débit</span>
                                        <div className="qtt-mvt-date">
                                            <i className="bi bi-calendar3"></i>
                                            {formatDateTime(m.datemouvement)}
                                        </div>
                                        {m.sync && <i className="bi bi-check2 qtt-mvt-sync" title="Synchronisé"></i>}
                                    </div>
                                    <div className="qtt-mvt-center">
                                        <span className="qtt-mvt-lib">{m.lib_type_mvt || 'Règlement de quittance'}</span>
                                        {m.observation && <span className="qtt-mvt-obs">{m.observation}</span>}
                                    </div>
                                    {m.nom_utilisateur && (
                                        <div className="qtt-mvt-enreg">
                                            <span className="qtt-mvt-enreg-label">Enregistré par</span>
                                            <span className="qtt-mvt-enreg-val">{m.nom_utilisateur}</span>
                                        </div>
                                    )}
                                    <div className="qtt-mvt-right">
                                        <span className="qtt-mvt-montant">{fmtMoney(m.debit ?? m.mont_debit)}</span>
                                        <span className="qtt-mvt-solde-label">Solde caisse : {fmtMoney(m.solde_caisse ?? 0)}</span>
                                    </div>
                                    <div className="qtt-mvt-actions">
                                        <button className="qtt-mvt-btn" title="Imprimer" disabled>
                                            <i className="bi bi-printer"></i>
                                        </button>
                                        <button className="qtt-mvt-btn qtt-mvt-btn--del" title="Supprimer" disabled>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale de confirmation */}
            {confirm?.type === 'annuler' && (
                <ConfirmModal
                    variant="warning"
                    title="Annuler la quittance"
                    message={<>Êtes-vous sûr de vouloir annuler la quittance <strong>N°{quittanceData.numquittance}</strong> ? Cette action est irréversible.</>}
                    onConfirm={handleConfirmAction}
                    onCancel={() => { setConfirm(null); setActionError(null); }}
                    loading={actionLoading}
                />
            )}
            {confirm?.type === 'supprimer' && (
                <ConfirmModal
                    variant="danger"
                    title="Supprimer la quittance"
                    message={<>Êtes-vous sûr de vouloir supprimer définitivement la quittance <strong>N°{quittanceData.numquittance}</strong> ? Cette action est irréversible.</>}
                    onConfirm={handleConfirmAction}
                    onCancel={() => { setConfirm(null); setActionError(null); }}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

// ── Composant principal ────────────────────────────────────────────
const Quittances = () => {
    const [activeTab, setActiveTab]   = useState('0');
    const [quittances, setQuittances] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [tabCounts, setTabCounts]   = useState({ '0': 0, '1': 0, '2': 0 });
    const [currentPage, setCurrentPage] = useState(1);

    const [searchTerm, setSearchTerm]     = useState('');
    const [filterDateDu, setFilterDateDu] = useState('');
    const [filterDateAu, setFilterDateAu] = useState('');

    const [selectedQuittance, setSelectedQuittance] = useState(null);

    const lastParamsRef = useRef(null);

    const buildBaseFilters = useCallback((dateDu, dateAu, search) => {
        const f = {};
        if (search && search.trim()) f.search = search.trim();
        if (dateDu) f.date_du = dateDu;
        if (dateAu) f.date_au = dateAu;
        return f;
    }, []);

    const loadQuittances = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        lastParamsRef.current = params;
        try {
            const resp = await api.get('/finances/quittances/', { params });
            const data = resp.data;
            setQuittances(toArray(data));
            setTotalCount(data.count || 0);
        } catch (err) {
            setError('Impossible de charger les quittances.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCounts = useCallback(async (dateDu, dateAu, search) => {
        const base = buildBaseFilters(dateDu, dateAu, search);
        try {
            const [r0, r1, r2] = await Promise.all([
                api.get('/finances/quittances/', { params: { ...base, etat_quittance: '0', page_size: 1 } }),
                api.get('/finances/quittances/', { params: { ...base, etat_quittance: '1', page_size: 1 } }),
                api.get('/finances/quittances/', { params: { ...base, etat_quittance: '2', page_size: 1 } }),
            ]);
            setTabCounts({
                '0': r0.data.count || 0,
                '1': r1.data.count || 0,
                '2': r2.data.count || 0,
            });
        } catch {
            // non critique
        }
    }, [buildBaseFilters]);

    const buildParams = useCallback((page, tab, dateDu, dateAu, search) => ({
        etat_quittance: tab,
        page,
        page_size: ITEMS_PER_PAGE,
        ordering: '-date_enreg',
        ...buildBaseFilters(dateDu, dateAu, search),
    }), [buildBaseFilters]);

    const initialLoadDone = useRef(false);
    if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        const p = buildParams(1, '0', '', '', '');
        setTimeout(() => {
            loadCounts('', '', '');
            loadQuittances(p);
        }, 0);
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        loadQuittances(buildParams(1, tab, filterDateDu, filterDateAu, searchTerm));
    };

    const handleFilter = () => {
        setCurrentPage(1);
        loadCounts(filterDateDu, filterDateAu, searchTerm);
        loadQuittances(buildParams(1, activeTab, filterDateDu, filterDateAu, searchTerm));
    };

    const handleReset = () => {
        setSearchTerm('');
        setFilterDateDu('');
        setFilterDateAu('');
        setCurrentPage(1);
        loadCounts('', '', '');
        loadQuittances(buildParams(1, activeTab, '', '', ''));
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        loadQuittances({ ...lastParamsRef.current, page: newPage });
    };

    const openDetail = (q) => setSelectedQuittance({ ...q, _tabKey: activeTab });

    // Recharge la liste après un règlement (la quittance peut avoir changé de statut)
    const handleReload = () => {
        loadCounts(filterDateDu, filterDateAu, searchTerm);
        loadQuittances({ ...lastParamsRef.current });
    };

    const COL_COUNT = 13;

    return (
        <div className="qtt-container">
            {/* Header — titre seul sur sa ligne */}
            <div className="qtt-header-strip">
                <h1>Liste des quittances</h1>
            </div>

            {/* Barre de filtres */}
            <div className="qtt-toolbar">
                <div className="qtt-search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Nº quittance / Nº police"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleFilter()}
                    />
                </div>
                <div className="qtt-date-group">
                    <label>Du :</label>
                    <input type="date" value={filterDateDu} onChange={e => setFilterDateDu(e.target.value)} />
                </div>
                <div className="qtt-date-group">
                    <label>Au :</label>
                    <input type="date" value={filterDateAu} onChange={e => setFilterDateAu(e.target.value)} />
                </div>
                <button className="qtt-btn-filter" onClick={handleFilter}>
                    <i className="bi bi-funnel"></i> Filtrer
                </button>
                <button className="qtt-btn-reset" onClick={handleReset}>
                    <i className="bi bi-arrow-clockwise"></i> Réinitialiser
                </button>
            </div>

            {/* Tabs */}
            <div className="qtt-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`qtt-tab${activeTab === tab.key ? ' active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label}
                        <span className="qtt-tab-count">({tabCounts[tab.key] ?? 0})</span>
                    </button>
                ))}
            </div>

            {error && <div className="qtt-error">{error}</div>}

            {/* Table */}
            <div className="qtt-table-wrap">
                <table className="qtt-table">
                    <colgroup>
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '160px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '140px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '130px' }} />
                        <col style={{ width: '90px' }} />
                        <col style={{ width: '90px' }} />
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '80px' }} />
                        <col />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Nº Quittance</th>
                            <th>Souscripteur</th>
                            <th>Nº Police</th>
                            <th>Lib. Produit</th>
                            <th>Nature</th>
                            <th>Type de doc.</th>
                            <th>Effet</th>
                            <th>Échéance</th>
                            <th className="qtt-th-right">Prime Totale</th>
                            <th>Émis par</th>
                            <th>Agence</th>
                            <th className="qtt-th-center">Réglé assureur</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={COL_COUNT} className="qtt-empty">
                                <i className="bi bi-hourglass-split"></i>
                                <span>Chargement...</span>
                            </td></tr>
                        ) : quittances.length === 0 ? (
                            <tr><td colSpan={COL_COUNT} className="qtt-empty">
                                <i className="bi bi-inbox"></i>
                                <span>Aucune quittance trouvée.</span>
                            </td></tr>
                        ) : quittances.map(q => (
                            <tr key={q.idquittance} className="qtt-row">
                                <td data-tip={q.numquittance || '—'}><div className="cell-inner qtt-td-num">{q.numquittance || <span className="qtt-no-num">—</span>}</div></td>
                                <td data-tip={q.nom_client || '-'}><div className="cell-inner">{q.nom_client || '-'}</div></td>
                                <td data-tip={q.num_police || '-'}><div className="cell-inner qtt-td-police">{q.num_police || '-'}</div></td>
                                <td data-tip={q.lib_produit || '-'}><div className="cell-inner">{q.lib_produit || '-'}</div></td>
                                <td data-tip={q.nature_contrat || '-'}><div className="cell-inner">{q.nature_contrat || '-'}</div></td>
                                <td data-tip={q.type_doc || '-'}><div className="cell-inner">{q.type_doc || '-'}</div></td>
                                <td data-tip={formatDate(q.date_effet)}><div className="cell-inner">{formatDate(q.date_effet)}</div></td>
                                <td data-tip={formatDate(q.date_echeance)}><div className="cell-inner">{formatDate(q.date_echeance)}</div></td>
                                <td className="qtt-td-prime">{fmtMoney(q.prime_totale)}</td>
                                <td data-tip={q.emis_par || '-'}><div className="cell-inner">{q.emis_par || '-'}</div></td>
                                <td data-tip={q.agence || '-'}><div className="cell-inner">{q.agence || '-'}</div></td>
                                <td className="qtt-td-center">
                                    {q.est_regle_chez_assureur
                                        ? <i className="bi bi-check-circle-fill qtt-icon-yes"></i>
                                        : <i className="bi bi-circle qtt-icon-no"></i>}
                                </td>
                                <td>
                                    <button className="qtt-btn-detail" onClick={() => openDetail(q)} title="Voir les détails">
                                        <i className="bi bi-eye"></i> Détails
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && totalCount > 0 && (
                <div className="qtt-pagination">
                    <span className="qtt-pagination-info">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur {totalCount}
                    </span>
                    <div className="qtt-pagination-controls">
                        <button className="qtt-page-btn" disabled={currentPage <= 1} onClick={() => handlePageChange(1)} title="Première page">
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button className="qtt-page-btn" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)} title="Précédente">
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <span className="qtt-page-label">Page {currentPage} / {totalPages}</span>
                        <button className="qtt-page-btn" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)} title="Suivante">
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button className="qtt-page-btn" disabled={currentPage >= totalPages} onClick={() => handlePageChange(totalPages)} title="Dernière page">
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {selectedQuittance && (
                <DetailPopup
                    quittance={selectedQuittance}
                    onClose={() => setSelectedQuittance(null)}
                    onReload={handleReload}
                />
            )}
        </div>
    );
};

export default Quittances;
