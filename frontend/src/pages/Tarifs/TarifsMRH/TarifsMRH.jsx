import React, { useState, useEffect, useCallback } from 'react';
import './TarifsMRH.css';
import tarifsMRHService from '../../../services/tarifsMRHService';
import productsService from '../../../services/products';
import compagniesService from '../../../services/compagnies';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';

// Helper : normalise une réponse API en tableau
const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

// Valeurs initiales du formulaire
const INITIAL_FORM = {
    idcompagnie: '',
    id_produit: '',
    id_garantie: '',
    capital_min: '',
    capital_max: '',
    taux: '',
    prime_fixe: '',
    montant_plafond: '',
    surprime_taux: '',
    surprime_fixe: '',
    taux_franchise: '',
    franchise_fixe: '',
    franchise_min: '',
    franchise_max: '',
};

const TarifsMRH = () => {
    const [viewMode, setViewMode] = useState('list');
    const [openSections, setOpenSections] = useState({ criteres: true, prime: true, franchise: true });

    // Données de référence
    const [compagnies, setCompagnies] = useState([]);
    const [produits, setProduits] = useState([]);
    const [garanties, setGaranties] = useState([]);

    // Grille
    const [tarifs, setTarifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtre par compagnie
    const [filterCompagnie, setFilterCompagnie] = useState('');
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Formulaire
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // ── Chargement des tarifs ────────────────────────────────────────────────
    const loadTarifs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await tarifsMRHService.getTarifs();
            setTarifs(toArray(data));
        } catch (err) {
            console.error('Erreur chargement tarifs MRH:', err);
            setError('Impossible de charger la grille de tarification MRH.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const comps = await compagniesService.getCompagnies();
                setCompagnies(toArray(comps));
            } catch (err) {
                console.error('Erreur init:', err);
            }
        };
        init();
        loadTarifs();
    }, [loadTarifs]);

    // ── Produits filtrés par compagnie (groupe MRH G02) ───────────────────
    const loadProduits = async (compagnieId) => {
        if (!compagnieId) { setProduits([]); return; }
        try {
            const data = await productsService.getProducts({
                Id_compagnie: compagnieId,
                code_groupe_prod: 'G02',   // G02 = Multirisque Habitation
            });
            setProduits(toArray(data));
        } catch (err) {
            console.error('Erreur produits:', err);
            setProduits([]);
        }
    };

    // ── Garanties filtrées par produit ───────────────────────────────────────
    const loadGaranties = async (produitId) => {
        if (!produitId) { setGaranties([]); return; }
        try {
            const data = await productsService.getGaranties({ id_produit: produitId });
            setGaranties(toArray(data));
        } catch (err) {
            console.error('Erreur garanties:', err);
            setGaranties([]);
        }
    };

    // ── Gestion des changements ──────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'idcompagnie') {
                next.id_produit = '';
                next.id_garantie = '';
                loadProduits(value);
                setGaranties([]);
            }
            if (name === 'id_produit') {
                next.id_garantie = '';
                loadGaranties(value);
            }
            return next;
        });
    };

    // ── Toggle section accordéon ────────────────────────────────────────────
    const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    // ── Ouvrir formulaire ────────────────────────────────────────────────────
    const openNew = () => {
        setFormData(INITIAL_FORM);
        setProduits([]);
        setGaranties([]);
        setIsEditing(false);
        setEditId(null);
        setSaveMsg('');
        setOpenSections({ criteres: true, prime: true, franchise: true });
        setViewMode('form');
    };

    const openEdit = (tarif) => {
        setFormData({
            idcompagnie: tarif.idcompagnie || '',
            id_produit: tarif.id_produit || '',
            id_garantie: tarif.id_garantie || '',
            capital_min: tarif.capital_min || '',
            capital_max: tarif.capital_max || '',
            taux: tarif.taux ?? '',
            prime_fixe: tarif.prime_fixe ?? '',
            montant_plafond: tarif.montant_plafond ?? '',
            surprime_taux: tarif.surprime_taux ?? '',
            surprime_fixe: tarif.surprime_fixe ?? '',
            taux_franchise: tarif.taux_franchise ?? '',
            franchise_fixe: tarif.franchise_fixe ?? '',
            franchise_min: tarif.franchise_min ?? '',
            franchise_max: tarif.franchise_max ?? '',
        });
        setEditId(tarif.idtarif_mrh);
        setIsEditing(true);
        setSaveMsg('');
        setOpenSections({ criteres: true, prime: true, franchise: true });
        if (tarif.idcompagnie) loadProduits(tarif.idcompagnie);
        if (tarif.id_produit) loadGaranties(tarif.id_produit);
        setViewMode('form');
    };

    // ── Construire le payload ────────────────────────────────────────────────
    const buildPayload = () => ({
        id_garantie: formData.id_garantie || null,
        idtarif_mrh: isEditing ? editId : `TMRH-${Date.now()}`,
        id_produit: formData.id_produit || null,
        idcompagnie: formData.idcompagnie || null,
        capital_min: formData.capital_min || null,
        capital_max: formData.capital_max || null,
        taux: formData.taux !== '' ? parseFloat(formData.taux) || null : null,
        prime_fixe: formData.prime_fixe !== '' ? parseInt(formData.prime_fixe) || null : null,
        montant_plafond: formData.montant_plafond !== '' ? parseInt(formData.montant_plafond) || null : null,
        surprime_taux: formData.surprime_taux !== '' ? parseFloat(formData.surprime_taux) || null : null,
        surprime_fixe: formData.surprime_fixe !== '' ? parseInt(formData.surprime_fixe) || null : null,
        taux_franchise: formData.taux_franchise !== '' ? parseFloat(formData.taux_franchise) || null : null,
        franchise_fixe: formData.franchise_fixe !== '' ? parseInt(formData.franchise_fixe) || null : null,
        franchise_min: formData.franchise_min !== '' ? parseInt(formData.franchise_min) || null : null,
        franchise_max: formData.franchise_max !== '' ? parseInt(formData.franchise_max) || null : null,
        effacer: false,
    });

    // ── Soumission ───────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!formData.id_garantie) {
            alert('Veuillez sélectionner une garantie.');
            return;
        }

        setSaving(true);
        setSaveMsg('');
        try {
            const payload = buildPayload();
            if (isEditing) {
                await tarifsMRHService.updateTarif(editId, payload);
                setSaveMsg('✓ Tarif MRH modifié avec succès.');
            } else {
                await tarifsMRHService.createTarif(payload);
                setSaveMsg('✓ Tarif MRH créé avec succès.');
            }
            loadTarifs();
        } catch (err) {
            console.error('Erreur sauvegarde:', err);
            const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Erreur lors de l'enregistrement:\n${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce tarif MRH ?')) return;
        try {
            await tarifsMRHService.deleteTarif(id);
            loadTarifs();
        } catch {
            alert('Impossible de supprimer ce tarif.');
        }
    };

    const filtered = tarifs.filter(t => {
        const matchSearch =
            (t.nom_compagnie || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.lib_produit || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.lib_garantie || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCompagnie = !filterCompagnie || String(t.idcompagnie) === String(filterCompagnie);
        return matchSearch && matchCompagnie;
    });

    // Pagination calculée
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

    // Reset page quand le filtre change
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCompagnie]);

    // ════════════════════════════════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════════════════════════════════
    return (
        <div className="tarifs-auto-container">

            {/* ── Header ── */}
            <div className="tarifs-header-strip">
                <h1>Tarifs Multirisque Habitation</h1>
            </div>

            {/* ── Toolbar ── */}
            <div className="tarifs-toolbar">
                {viewMode === 'list' ? (
                    <>
                        <div className="search-group">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Rechercher (Compagnie, Produit, Garantie...)"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="tarifs-actions-group">
                            {/* ── Bouton filtre compagnie ── */}
                            <div className="filter-wrapper" style={{ position: 'relative' }}>
                                <button
                                    className={`btn-icon-action${filterCompagnie ? ' btn-filter-active' : ''}`}
                                    title="Filtrer par compagnie"
                                    onClick={() => setFilterPanelOpen(p => !p)}
                                >
                                    <i className="bi bi-funnel"></i>
                                    {filterCompagnie && <span className="filter-dot"></span>}
                                </button>
                                {filterPanelOpen && (
                                    <div className="filter-panel">
                                        <div className="filter-panel-header">
                                            <span>Filtrer par compagnie</span>
                                            {filterCompagnie && (
                                                <button
                                                    className="filter-clear-btn"
                                                    onClick={() => { setFilterCompagnie(''); setFilterPanelOpen(false); }}
                                                >
                                                    <i className="bi bi-x"></i> Effacer
                                                </button>
                                            )}
                                        </div>
                                        <div className="filter-panel-list">
                                            {compagnies.map(c => (
                                                <div
                                                    key={c.id_compagnie}
                                                    className={`filter-option${String(filterCompagnie) === String(c.id_compagnie) ? ' selected' : ''}`}
                                                    onClick={() => { setFilterCompagnie(c.id_compagnie); setFilterPanelOpen(false); }}
                                                >
                                                    {String(filterCompagnie) === String(c.id_compagnie) && (
                                                        <i className="bi bi-check2"></i>
                                                    )}
                                                    {c.nom_compagnie}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="btn-icon-action" title="Actualiser" onClick={() => { loadTarifs(); setSearchTerm(''); setFilterCompagnie(''); }}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                            <button className="btn-new" onClick={openNew}>
                                <i className="bi bi-plus-lg"></i> Nouveau Tarif
                            </button>
                        </div>
                    </>
                ) : (
                    <button className="btn-back" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Retour à la liste
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* ════════════════════════════════════════════════════════════
                VUE LISTE
            ════════════════════════════════════════════════════════════ */}
            {viewMode === 'list' && (
                <div className="tarifs-table-container">
                    <table className="tarifs-table">
                        <thead>
                            <tr>
                                <th className="col-actions"></th>
                                <th>Compagnie</th>
                                <th>Produit</th>
                                <th>Garantie</th>
                                <th>Capital Min</th>
                                <th>Capital Max</th>
                                <th>Taux</th>
                                <th>Prime Fixe</th>
                                <th>Plafond</th>
                                <th>Surp. Taux</th>
                                <th>Surp. Fixe</th>
                                <th>Fr. Fixe</th>
                                <th>Tx Franchise</th>
                                <th>Fr. Min</th>
                                <th>Fr. Max</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="15" className="table-empty">
                                    <i className="bi bi-hourglass-split"></i>
                                    <span>Chargement...</span>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="15" className="table-empty">
                                    <i className="bi bi-inbox"></i>
                                    <span>Aucun tarif{filterCompagnie ? ' pour cette compagnie' : ''}. {!filterCompagnie && 'Cliquez sur "Nouveau Tarif" pour commencer.'}</span>
                                </td></tr>
                            ) : paginatedData.map((t, index) => (
                                <tr key={t.idtarif_mrh || `mrh-${index}`}>
                                    <td className="col-actions">
                                        <div className="action-buttons">
                                            <button className="btn-details" onClick={() => openEdit(t)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn-icon-danger" onClick={() => handleDelete(t.idtarif_mrh)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td>{t.nom_compagnie || t.idcompagnie || '-'}</td>
                                    <td>{t.lib_produit || t.id_produit || '-'}</td>
                                    <td>{t.lib_garantie || t.id_garantie || '-'}</td>
                                    <td className="num-cell">{t.capital_min || '-'}</td>
                                    <td className="num-cell">{t.capital_max || '-'}</td>
                                    <td className="num-cell">{t.taux != null ? `${t.taux}%` : '-'}</td>
                                    <td className="num-cell">{t.prime_fixe != null ? Number(t.prime_fixe).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.montant_plafond != null ? Number(t.montant_plafond).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.surprime_taux != null ? `${t.surprime_taux}%` : '-'}</td>
                                    <td className="num-cell">{t.surprime_fixe != null ? Number(t.surprime_fixe).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.franchise_fixe != null ? Number(t.franchise_fixe).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.taux_franchise != null ? `${t.taux_franchise}%` : '-'}</td>
                                    <td className="num-cell">{t.franchise_min != null ? Number(t.franchise_min).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.franchise_max != null ? Number(t.franchise_max).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ── Pagination ── */}
                    {!loading && filtered.length > 0 && (
                        <div className="pagination-bar">
                            <span className="pagination-info">
                                {(safePage - 1) * itemsPerPage + 1}–{Math.min(safePage * itemsPerPage, filtered.length)} sur {filtered.length}
                            </span>
                            <div className="pagination-controls">
                                <button
                                    className="pagination-btn"
                                    disabled={safePage <= 1}
                                    onClick={() => setCurrentPage(1)}
                                    title="Première page"
                                >
                                    <i className="bi bi-chevron-double-left"></i>
                                </button>
                                <button
                                    className="pagination-btn"
                                    disabled={safePage <= 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    title="Page précédente"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <span className="pagination-page">Page {safePage} / {totalPages}</span>
                                <button
                                    className="pagination-btn"
                                    disabled={safePage >= totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    title="Page suivante"
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                                <button
                                    className="pagination-btn"
                                    disabled={safePage >= totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    title="Dernière page"
                                >
                                    <i className="bi bi-chevron-double-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                FORMULAIRE ACCORDÉON
            ════════════════════════════════════════════════════════════ */}
            {viewMode === 'form' && (
                <div className="form-accordion-container">

                    {/* ── Section 1 : Critères ── */}
                    <div className={`accordion-section ${openSections.criteres ? 'open' : ''}`}>
                        <div className="accordion-header" onClick={() => toggleSection('criteres')}>
                            <div className="accordion-header-left">
                                <i className="bi bi-card-list"></i>
                                <span>Critères de tarification</span>
                            </div>
                            <i className={`bi bi-chevron-down accordion-chevron ${openSections.criteres ? 'open' : ''}`}></i>
                        </div>
                        {openSections.criteres && (
                            <div className="accordion-body">
                                <div className="accordion-fields-grid">
                                    <div className="form-group span-2">
                                        <label>Compagnie <span className="required">*</span></label>
                                        <CustomSelect
                                            name="idcompagnie"
                                            value={formData.idcompagnie}
                                            onChange={handleChange}
                                            placeholder="— Sélectionner une compagnie —"
                                            options={compagnies.map(c => ({ value: c.id_compagnie, label: c.nom_compagnie }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Produit <span className="required">*</span></label>
                                        <CustomSelect
                                            name="id_produit"
                                            value={formData.id_produit}
                                            onChange={handleChange}
                                            placeholder="— Sélectionner un produit —"
                                            options={produits.map(p => ({ value: p.id_produit, label: p.lib_produit }))}
                                            disabled={!formData.idcompagnie}
                                        />
                                        {!formData.idcompagnie && <span className="field-hint">Choisissez d'abord une compagnie</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Garantie <span className="required">*</span></label>
                                        <CustomSelect
                                            name="id_garantie"
                                            value={formData.id_garantie}
                                            onChange={handleChange}
                                            placeholder="— Sélectionner une garantie —"
                                            options={garanties.map(g => ({ value: g.id_garantie, label: g.libelle_garantie }))}
                                            disabled={!formData.id_produit}
                                        />
                                        {!formData.id_produit && <span className="field-hint">Sélectionnez d'abord un produit</span>}
                                    </div>
                                    <div className="accordion-sub-section span-2">
                                        <div className="accordion-sub-label">CAPITAL ASSURÉ</div>
                                        <div className="accordion-sub-grid">
                                            <div className="form-group">
                                                <label>Capital Min (FCFA)</label>
                                                <input type="text" name="capital_min" value={formData.capital_min} onChange={handleChange} placeholder="0" />
                                            </div>
                                            <div className="form-group">
                                                <label>Capital Max (FCFA)</label>
                                                <input type="text" name="capital_max" value={formData.capital_max} onChange={handleChange} placeholder="0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Section 2 : Prime ── */}
                    <div className={`accordion-section ${openSections.prime ? 'open' : ''}`}>
                        <div className="accordion-header" onClick={() => toggleSection('prime')}>
                            <div className="accordion-header-left">
                                <i className="bi bi-cash-coin"></i>
                                <span>Prime correspondante</span>
                            </div>
                            <i className={`bi bi-chevron-down accordion-chevron ${openSections.prime ? 'open' : ''}`}></i>
                        </div>
                        {openSections.prime && (
                            <div className="accordion-body">
                                <div className="accordion-fields-grid">
                                    <div className="form-group">
                                        <label>Taux de prime (%)</label>
                                        <input type="number" step="0.01" name="taux" value={formData.taux} onChange={handleChange} placeholder="0,00" />
                                    </div>
                                    <div className="form-group">
                                        <label>Prime Fixe (FCFA)</label>
                                        <input type="number" name="prime_fixe" value={formData.prime_fixe} onChange={handleChange} placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Montant Plafond (FCFA)</label>
                                        <input type="number" name="montant_plafond" value={formData.montant_plafond} onChange={handleChange} placeholder="0" />
                                    </div>
                                    <div className="accordion-sub-section span-2">
                                        <div className="accordion-sub-label">SURPRIMES</div>
                                        <div className="accordion-sub-grid">
                                            <div className="form-group">
                                                <label>Taux Surprime (%)</label>
                                                <input type="number" step="0.01" name="surprime_taux" value={formData.surprime_taux} onChange={handleChange} placeholder="0,00" />
                                            </div>
                                            <div className="form-group">
                                                <label>Surprime Fixe (FCFA)</label>
                                                <input type="number" name="surprime_fixe" value={formData.surprime_fixe} onChange={handleChange} placeholder="0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Section 3 : Franchise ── */}
                    <div className={`accordion-section ${openSections.franchise ? 'open' : ''}`}>
                        <div className="accordion-header" onClick={() => toggleSection('franchise')}>
                            <div className="accordion-header-left">
                                <i className="bi bi-shield-half"></i>
                                <span>Franchise</span>
                            </div>
                            <i className={`bi bi-chevron-down accordion-chevron ${openSections.franchise ? 'open' : ''}`}></i>
                        </div>
                        {openSections.franchise && (
                            <div className="accordion-body">
                                <div className="accordion-fields-grid">
                                    <div className="form-group">
                                        <label>Taux Franchise (%)</label>
                                        <input type="number" step="0.01" name="taux_franchise" value={formData.taux_franchise} onChange={handleChange} placeholder="0,00" />
                                    </div>
                                    <div className="form-group">
                                        <label>Franchise Fixe (FCFA)</label>
                                        <input type="number" name="franchise_fixe" value={formData.franchise_fixe} onChange={handleChange} placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Franchise Min. (FCFA)</label>
                                        <input type="number" name="franchise_min" value={formData.franchise_min} onChange={handleChange} placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Franchise Max. (FCFA)</label>
                                        <input type="number" name="franchise_max" value={formData.franchise_max} onChange={handleChange} placeholder="0" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Bouton Enregistrer ── */}
                    {saveMsg && (
                        <div className="accordion-success-msg">
                            <i className="bi bi-check-circle"></i> {saveMsg}
                        </div>
                    )}
                    <div className="accordion-submit-row">
                        <button className="btn-submit" onClick={handleSubmit} disabled={saving}>
                            {saving
                                ? <><i className="bi bi-hourglass-split"></i> Enregistrement...</>
                                : <><i className="bi bi-check2-circle"></i> {isEditing ? 'Modifier' : 'Enregistrer'}</>
                            }
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TarifsMRH;
