import React, { useState, useEffect, useCallback } from 'react';
import './TarifsAuto.css';
import tarifsAutoService from '../../../services/tarifsAutoService';
import productsService from '../../../services/products';
import compagniesService from '../../../services/compagnies';
import vehicleCategoriesService from '../../../services/vehicleCategoriesService';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';

// Helper : normalise une réponse API en tableau
const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

// Valeurs initiales — noms EXACTS des colonnes de tarif_auto
const INITIAL_FORM = {
    Id_compagnie: '',
    id_produit: '',
    groupe: '',
    code_cat: '',
    energie: '',
    ID_Garantie: '',
    // Plages UI (génèrent plusieurs enregistrements)
    pf_min: 1,
    pf_max: 1,
    valeur_min: 0,
    valeur_max: 0,
    // Prime
    prime_fixe: '',
    prime_taux: '',
    prime_minimun: '',
    prime_taux_sur: 'Valeur vénale',
    prime_taux_garantie: '',
    capital: '',
    surprime_passager: '',
    surprime_passager_fixe: '',
    nb_passager_surprime: '',
    surprime_remorque: '',
    // Franchise
    franchise_fixe: '',
    taux_franchise: '',
    franchise_min: '',
    franchise_max: '',
};

const TarifsAuto = () => {
    const [viewMode, setViewMode] = useState('list');
    const [openSections, setOpenSections] = useState({ criteres: true, prime: true, franchise: true });

    // Données de référence
    const [compagnies, setCompagnies] = useState([]);
    const [produits, setProduits] = useState([]);
    const [categories, setCategories] = useState([]);
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
            const data = await tarifsAutoService.getTarifs();
            setTarifs(toArray(data));
        } catch (err) {
            console.error('Erreur chargement tarifs:', err);
            setError('Impossible de charger la grille de tarification.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [comps, cats] = await Promise.all([
                    compagniesService.getCompagnies(),
                    vehicleCategoriesService.getAll(),
                ]);
                setCompagnies(toArray(comps));
                setCategories(toArray(cats));
            } catch (err) {
                console.error('Erreur init:', err);
            }
        };
        init();
        loadTarifs();
    }, [loadTarifs]);

    // ── Produits filtrés par compagnie (groupe Automobile G01) ───────────────
    const loadProduits = async (compagnieId) => {
        if (!compagnieId) { setProduits([]); return; }
        try {
            const data = await productsService.getProducts({
                Id_compagnie: compagnieId,
                code_groupe_prod: 'G01',   // G01 = Assurance Automobile
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
            if (name === 'Id_compagnie') {
                next.id_produit = '';
                next.ID_Garantie = '';
                loadProduits(value);
                setGaranties([]);
            }
            if (name === 'id_produit') {
                next.ID_Garantie = '';
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
            ...INITIAL_FORM,
            Id_compagnie: tarif.id_compagnie || '',
            id_produit: tarif.id_produit || '',
            groupe: tarif.groupe || '',
            code_cat: tarif.code_cat || '',
            energie: tarif.energie || '',
            ID_Garantie: tarif.id_garantie || '',
            pf_min: tarif.puissance_fiscale ?? 1,
            pf_max: tarif.puissance_fiscale ?? 1,
            valeur_min: tarif.valeur_vehicule ?? 0,
            valeur_max: tarif.valeur_vehicule ?? 0,
            prime_fixe: tarif.prime_fixe ?? '',
            prime_taux: tarif.prime_taux ?? '',
            prime_minimun: tarif.prime_minimun ?? '',
            prime_taux_sur: tarif.prime_taux_sur || 'Valeur vénale',
            prime_taux_garantie: tarif.prime_taux_garantie || '',
            capital: tarif.capital ?? '',
            surprime_passager: tarif.surprime_passager ?? '',
            surprime_passager_fixe: tarif.surprime_passager_fixe || '',
            nb_passager_surprime: tarif.nb_passager_surprime ?? '',
            surprime_remorque: tarif.surprime_remorque ?? '',
            franchise_fixe: tarif.franchise_fixe ?? '',
            taux_franchise: tarif.taux_franchise ?? '',
            franchise_min: tarif.franchise_min ?? '',
            franchise_max: tarif.franchise_max ?? '',
        });
        setEditId(tarif.idtarif);
        setIsEditing(true);
        setSaveMsg('');
        setOpenSections({ criteres: true, prime: true, franchise: true });
        if (tarif.id_compagnie) loadProduits(tarif.id_compagnie);
        if (tarif.id_produit) loadGaranties(tarif.id_produit);
        setViewMode('form');
    };

    // ── Construire un payload ────────────────────────────────────────────────
    const buildPayload = (idtarif, pf, valeur) => ({
        idtarif,
        id_compagnie: formData.Id_compagnie || null,
        id_produit: formData.id_produit || null,
        groupe: formData.groupe || null,
        code_cat: formData.code_cat || null,
        energie: formData.energie || null,
        id_garantie: formData.ID_Garantie || null,
        puissance_fiscale: pf,
        valeur_vehicule: valeur,
        prime_fixe: formData.prime_fixe !== '' ? parseInt(formData.prime_fixe) || null : null,
        prime_taux: formData.prime_taux !== '' ? parseFloat(formData.prime_taux) || null : null,
        prime_minimun: formData.prime_minimun !== '' ? parseInt(formData.prime_minimun) || null : null,
        prime_taux_sur: formData.prime_taux_sur || null,
        prime_taux_garantie: formData.prime_taux_garantie || null,
        capital: formData.capital !== '' ? parseInt(formData.capital) || null : null,
        surprime_passager: formData.surprime_passager !== '' ? parseFloat(formData.surprime_passager) || null : null,
        surprime_passager_fixe: formData.surprime_passager_fixe || null,
        nb_passager_surprime: formData.nb_passager_surprime !== '' ? parseInt(formData.nb_passager_surprime) || null : null,
        surprime_remorque: formData.surprime_remorque !== '' ? parseFloat(formData.surprime_remorque) || null : null,
        franchise_fixe: formData.franchise_fixe !== '' ? parseInt(formData.franchise_fixe) || null : null,
        taux_franchise: formData.taux_franchise !== '' ? parseFloat(formData.taux_franchise) || null : null,
        franchise_min: formData.franchise_min !== '' ? parseInt(formData.franchise_min) || null : null,
        franchise_max: formData.franchise_max !== '' ? parseInt(formData.franchise_max) || null : null,
        effacer: false,
    });

    // ── Soumission ───────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const pfMin = parseInt(formData.pf_min) || 1;
        const pfMax = parseInt(formData.pf_max) || 1;
        const valMin = parseInt(formData.valeur_min) || 0;

        if (pfMin < 1) { alert('La puissance fiscale minimum doit être au moins 1.'); return; }
        if (pfMax < pfMin) { alert('PF Max doit être ≥ PF Min.'); return; }

        setSaving(true);
        setSaveMsg('');
        try {
            if (isEditing) {
                const payload = buildPayload(editId, pfMin, valMin);
                await tarifsAutoService.updateTarif(editId, payload);
                setSaveMsg(`✓ Tarif modifié avec succès.`);
            } else {
                let count = 0;
                for (let pf = pfMin; pf <= pfMax; pf++) {
                    const idtarif = `TAR-${Date.now()}-PF${pf}`;
                    const payload = buildPayload(idtarif, pf, valMin > 0 ? valMin : null);
                    await tarifsAutoService.createTarif(payload);
                    count++;
                    await new Promise(r => setTimeout(r, 5));
                }
                setSaveMsg(`✓ ${count} tarif(s) créé(s) (PF ${pfMin} → ${pfMax}).`);
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
        if (!window.confirm('Supprimer ce tarif ?')) return;
        try {
            await tarifsAutoService.deleteTarif(id);
            loadTarifs();
        } catch {
            alert('Impossible de supprimer ce tarif.');
        }
    };

    const filtered = tarifs.filter(t => {
        const matchSearch =
            (t.groupe || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.nom_compagnie || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.lib_produit || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCompagnie = !filterCompagnie || String(t.Id_compagnie) === String(filterCompagnie);
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
                <h1>Tarifs Automobile</h1>
            </div>

            {/* ── Toolbar ── */}
            <div className="tarifs-toolbar">
                {viewMode === 'list' ? (
                    <>
                        <div className="search-group">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Rechercher (Compagnie, Produit, Groupe...)"
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
                                <th>Groupe</th>
                                <th>Catégorie</th>
                                <th>Motorisation</th>
                                <th title="Puissance Fiscale">PF</th>
                                <th>Valeur</th>
                                <th>Garantie</th>
                                <th>Prime</th>
                                <th>Taux prime</th>
                                <th>Applique sur</th>
                                <th>Garantie Réf.</th>
                                <th title="Surprime passager (%)">Surp. Passager (tx)</th>
                                <th title="Surprime passager fixe">Surp. Passager Fixe</th>
                                <th title="Nb passagers surprime">Nb Pass. Surp.</th>
                                <th title="Surprime remorque">Surp. Remorque</th>
                                <th>Prime Min</th>
                                <th>Fr. Fixe</th>
                                <th>Tx Franchise</th>
                                <th>Fr. Min</th>
                                <th>Fr. Max</th>
                                <th>Capital</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="22" className="table-empty">
                                    <i className="bi bi-hourglass-split"></i>
                                    <span>Chargement...</span>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="22" className="table-empty">
                                    <i className="bi bi-inbox"></i>
                                    <span>Aucun tarif{filterCompagnie ? ' pour cette compagnie' : ''}. {!filterCompagnie && 'Cliquez sur "Nouveau Tarif" pour commencer.'}</span>
                                </td></tr>
                            ) : paginatedData.map(t => (
                                <tr key={t.idtarif}>
                                    <td className="col-actions">
                                        <div className="action-buttons">
                                            <button className="btn-details" onClick={() => openEdit(t)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn-icon-danger" onClick={() => handleDelete(t.idtarif)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td>{t.nom_compagnie || t.Id_compagnie || '-'}</td>
                                    <td>{t.groupe || '-'}</td>
                                    <td>{t.lib_cat || t.code_cat || '-'}</td>
                                    <td>{t.energie || '-'}</td>
                                    <td className="num-cell">{t.puissance_fiscale ?? '-'}</td>
                                    <td className="num-cell">{t.valeur_vehicule != null ? Number(t.valeur_vehicule).toLocaleString() : '-'}</td>
                                    <td>{t.lib_garantie || t.ID_Garantie || '-'}</td>
                                    <td className="num-cell">{t.prime_fixe != null ? Number(t.prime_fixe).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.prime_taux != null ? `${t.prime_taux}%` : '-'}</td>
                                    <td>{t.prime_taux_sur || '-'}</td>
                                    <td className="num-cell">{t.prime_taux_garantie != null ? `${t.prime_taux_garantie}%` : '-'}</td>
                                    <td className="num-cell">{t.surprime_passager != null ? `${t.surprime_passager}%` : '-'}</td>
                                    <td className="num-cell">{t.surprime_passager_fixe != null ? Number(t.surprime_passager_fixe).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.nb_passager_surprime ?? '-'}</td>
                                    <td className="num-cell">{t.surprime_remorque != null ? `${t.surprime_remorque}%` : '-'}</td>
                                    <td className="num-cell">{t.prime_minimun != null ? Number(t.prime_minimun).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.franchise_fixe != null ? Number(t.franchise_fixe).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.taux_franchise != null ? `${t.taux_franchise}%` : '-'}</td>
                                    <td className="num-cell">{t.franchise_min != null ? Number(t.franchise_min).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.franchise_max != null ? Number(t.franchise_max).toLocaleString() : '-'}</td>
                                    <td className="num-cell">{t.capital != null ? Number(t.capital).toLocaleString() : '-'}</td>
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
                                            name="Id_compagnie"
                                            value={formData.Id_compagnie}
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
                                            disabled={!formData.Id_compagnie}
                                        />
                                        {!formData.Id_compagnie && <span className="field-hint">Choisissez d'abord une compagnie</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Groupe tarifaire</label>
                                        <CustomSelect
                                            name="groupe"
                                            value={formData.groupe}
                                            onChange={handleChange}
                                            placeholder="— Sélectionner —"
                                            options={[
                                                { value: 'Groupe A', label: 'Groupe A' },
                                                { value: 'Groupe B', label: 'Groupe B' },
                                            ]}
                                            searchable={false}
                                        />
                                    </div>
                                    <div className="form-group span-2">
                                        <label>Catégorie de véhicule</label>
                                        <CustomSelect
                                            name="code_cat"
                                            value={formData.code_cat}
                                            onChange={handleChange}
                                            placeholder="— Toutes catégories —"
                                            options={categories.map(c => ({ value: c.code_cat, label: c.lib_cat }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Motorisation</label>
                                        <CustomSelect
                                            name="energie"
                                            value={formData.energie}
                                            onChange={handleChange}
                                            placeholder="— Sélectionner —"
                                            options={[
                                                { value: 'Essence', label: 'Essence' },
                                                { value: 'Diesel', label: 'Diesel' },
                                                { value: 'Hybride', label: 'Hybride' },
                                                { value: 'Electrique', label: 'Électrique' },
                                            ]}
                                            searchable={false}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Garantie</label>
                                        <CustomSelect
                                            name="ID_Garantie"
                                            value={formData.ID_Garantie}
                                            onChange={handleChange}
                                            placeholder="— Aucune —"
                                            options={garanties.map(g => ({ value: g.id_garantie, label: g.libelle_garantie }))}
                                            disabled={!formData.id_produit}
                                        />
                                        {!formData.id_produit && <span className="field-hint">Sélectionnez d'abord un produit</span>}
                                    </div>
                                    <div className="accordion-sub-section span-2">
                                        <div className="accordion-sub-label">PLAGES DE VALEURS</div>
                                        <div className="accordion-sub-grid">
                                            <div className="form-group">
                                                <label>Valeur Min (FCFA)</label>
                                                <input type="number" name="valeur_min" value={formData.valeur_min} onChange={handleChange} min="0" placeholder="0" />
                                                <span className="field-hint">0 = pas de borne inférieure</span>
                                            </div>
                                            <div className="form-group">
                                                <label>Valeur Max (FCFA)</label>
                                                <input type="number" name="valeur_max" value={formData.valeur_max} onChange={handleChange} min="0" placeholder="0" />
                                                <span className="field-hint">0 = pas de borne supérieure</span>
                                            </div>
                                            <div className="form-group">
                                                <label>PF Min <span className="required">*</span></label>
                                                <input type="number" name="pf_min" value={formData.pf_min} onChange={handleChange} min="1" placeholder="1" />
                                            </div>
                                            <div className="form-group">
                                                <label>PF Max <span className="required">*</span></label>
                                                <input type="number" name="pf_max" value={formData.pf_max} onChange={handleChange} min="1" placeholder="1" />
                                            </div>
                                        </div>
                                    </div>
                                    {!isEditing && parseInt(formData.pf_max) > parseInt(formData.pf_min) && (
                                        <div className="accordion-info-box span-2">
                                            <i className="bi bi-info-circle"></i>
                                            <strong>{parseInt(formData.pf_max) - parseInt(formData.pf_min) + 1}</strong> enregistrements seront créés (PF {formData.pf_min} → {formData.pf_max})
                                        </div>
                                    )}
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
                                        <label>Prime Fixe (FCFA)</label>
                                        <input type="number" name="prime_fixe" value={formData.prime_fixe} onChange={handleChange} min="0" placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Capital (FCFA)</label>
                                        <input type="number" name="capital" value={formData.capital} onChange={handleChange} min="0" placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Prime Taux (%)</label>
                                        <input type="number" step="0.01" name="prime_taux" value={formData.prime_taux} onChange={handleChange} min="0" placeholder="0,00" />
                                    </div>
                                    <div className="form-group">
                                        <label>Prime Min. (FCFA)</label>
                                        <input type="number" name="prime_minimun" value={formData.prime_minimun} onChange={handleChange} min="0" placeholder="0" />
                                    </div>
                                    <div className="form-group span-2">
                                        <label>S'applique sur</label>
                                        <div className="radio-group">
                                            {['Valeur vénale', 'Valeur à neuf', 'Autre garanties'].map(opt => (
                                                <label key={opt} className="radio-label">
                                                    <input type="radio" name="prime_taux_sur" value={opt} checked={formData.prime_taux_sur === opt} onChange={handleChange} />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group span-2">
                                        <label>Taux garantie (prime_taux_garantie)</label>
                                        <input type="text" name="prime_taux_garantie" value={formData.prime_taux_garantie} onChange={handleChange} placeholder="ex: 1.5" />
                                    </div>
                                    <div className="accordion-sub-section span-2">
                                        <div className="accordion-sub-label">SURPRIMES</div>
                                        <div className="accordion-sub-grid">
                                            <div className="form-group">
                                                <label>Surprime passager (%)</label>
                                                <input type="number" step="0.01" name="surprime_passager" value={formData.surprime_passager} onChange={handleChange} min="0" placeholder="0,00" />
                                            </div>
                                            <div className="form-group">
                                                <label>Surprime passager fixe</label>
                                                <input type="text" name="surprime_passager_fixe" value={formData.surprime_passager_fixe} onChange={handleChange} placeholder="0" />
                                            </div>
                                            <div className="form-group">
                                                <label>Nb passagers surprime</label>
                                                <input type="number" name="nb_passager_surprime" value={formData.nb_passager_surprime} onChange={handleChange} min="0" placeholder="0" />
                                            </div>
                                            <div className="form-group">
                                                <label>Surprime remorque (%)</label>
                                                <input type="number" step="0.01" name="surprime_remorque" value={formData.surprime_remorque} onChange={handleChange} min="0" placeholder="0,00" />
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
                                        <label>Franchise Fixe (FCFA)</label>
                                        <input type="number" name="franchise_fixe" value={formData.franchise_fixe} onChange={handleChange} min="0" placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Franchise Min. (FCFA)</label>
                                        <input type="number" name="franchise_min" value={formData.franchise_min} onChange={handleChange} min="0" placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Taux Franchise (%)</label>
                                        <input type="number" step="0.01" name="taux_franchise" value={formData.taux_franchise} onChange={handleChange} min="0" placeholder="0,00" />
                                    </div>
                                    <div className="form-group">
                                        <label>Franchise Max. (FCFA)</label>
                                        <input type="number" name="franchise_max" value={formData.franchise_max} onChange={handleChange} min="0" placeholder="0" />
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

export default TarifsAuto;
