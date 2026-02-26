/**
 * RisquePickerModal — Modale de sélection de véhicules depuis la table «risques»
 * Usage:
 *   <RisquePickerModal
 *     open={showPicker}
 *     onClose={() => setShowPicker(false)}
 *     onConfirm={(selectedRisques) => { ... }}
 *   />
 */
import { useState, useEffect, useCallback } from 'react';
import { getRisques } from '../../services/contrats';
import './RisquePickerModal.css';

/* Helpers */
const toArray = (r) => {
    if (!r) return [];
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.results)) return r.results;
    return [];
};

export default function RisquePickerModal({ open, onClose, onConfirm }) {
    const [search, setSearch] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState({}); // { id_risque: risqueObj }

    const load = useCallback(async (q) => {
        setLoading(true);
        try {
            const res = await getRisques({ search: q, page_size: 50 });
            setItems(toArray(res));
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /* Chargement initial + debounce recherche */
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => load(search), 350);
        return () => clearTimeout(t);
    }, [open, search, load]);

    /* Reset à l'ouverture */
    useEffect(() => {
        if (open) { setSearch(''); setSelected({}); }
    }, [open]);

    const toggle = (r) => {
        setSelected(prev => {
            const next = { ...prev };
            if (next[r.id_risque]) delete next[r.id_risque];
            else next[r.id_risque] = r;
            return next;
        });
    };

    const handleConfirm = () => {
        onConfirm(Object.values(selected));
        onClose();
    };

    if (!open) return null;

    const selCount = Object.keys(selected).length;

    return (
        <div className="rpm-overlay" onClick={onClose}>
            <div className="rpm-dialog" onClick={e => e.stopPropagation()}>
                {/* ── En-tête ── */}
                <div className="rpm-header">
                    <div className="rpm-title">
                        <i className="bi bi-car-front-fill"></i>
                        <span>Sélectionner des véhicules</span>
                    </div>
                    <button className="rpm-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* ── Barre de recherche ── */}
                <div className="rpm-search-bar">
                    <i className="bi bi-search rpm-search-icon"></i>
                    <input
                        className="rpm-search-input"
                        type="text"
                        placeholder="Rechercher par immatriculation, marque, modèle…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                    {search && (
                        <button className="rpm-clear" onClick={() => setSearch('')}>
                            <i className="bi bi-x"></i>
                        </button>
                    )}
                </div>

                {/* ── Liste ── */}
                <div className="rpm-body">
                    {loading ? (
                        <div className="rpm-loader">
                            <span className="rpm-spinner"></span>
                            <span>Chargement…</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rpm-empty">
                            <i className="bi bi-car-front"></i>
                            <span>Aucun véhicule trouvé</span>
                        </div>
                    ) : (
                        <table className="rpm-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Immatriculation</th>
                                    <th>Marque / Modèle</th>
                                    <th>Catégorie</th>
                                    <th>Énergie</th>
                                    <th>Places</th>
                                    <th>Puissance</th>
                                    <th>Châssis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(r => {
                                    const isSel = !!selected[r.id_risque];
                                    return (
                                        <tr
                                            key={r.id_risque}
                                            className={isSel ? 'rpm-row-sel' : ''}
                                            onClick={() => toggle(r)}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="rpm-checkbox"
                                                    checked={isSel}
                                                    onChange={() => toggle(r)}
                                                    onClick={e => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="rpm-immat">{r.veh_immat || '—'}</td>
                                            <td>
                                                <span className="rpm-marque">{r.veh_marque || '—'}</span>
                                                {r.veh_modele && <span className="rpm-modele">{r.veh_modele}</span>}
                                            </td>
                                            <td>{r.veh_cat || '—'}</td>
                                            <td>{r.veh_energie || '—'}</td>
                                            <td>{r.veh_nbplace || '—'}</td>
                                            <td>{r.veh_puissance ? `${r.veh_puissance} CV` : '—'}</td>
                                            <td className="rpm-chassis">{r.veh_chassis || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Pied ── */}
                <div className="rpm-footer">
                    <span className="rpm-sel-count">
                        {selCount > 0
                            ? `${selCount} véhicule${selCount > 1 ? 's' : ''} sélectionné${selCount > 1 ? 's' : ''}`
                            : 'Aucune sélection'
                        }
                    </span>
                    <div className="rpm-actions">
                        <button className="rpm-btn rpm-btn-cancel" onClick={onClose}>Annuler</button>
                        <button
                            className="rpm-btn rpm-btn-confirm"
                            disabled={selCount === 0}
                            onClick={handleConfirm}
                        >
                            <i className="bi bi-check2"></i>
                            Ajouter {selCount > 0 ? `(${selCount})` : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
