/**
 * AvenantChangementImmat.jsx
 * Page — Avenant de changement d'immatriculation.
 *
 * Routes :
 *  /contrats/auto/avenant/immat          → mode search (pas de contrat pré-sélectionné)
 *  /contrats/auto/avenant/immat/:contratId → contrat pré-chargé
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getContrats, getContratById, createContrat, patchRisque } from '../../../../../services/contrats';
import './avenants.css';

const today = () => new Date().toISOString().split('T')[0];
const fmtNum = (n) => (parseFloat(n) || 0).toLocaleString('fr-FR');
const toArray = (d) => (Array.isArray(d) ? d : d?.results ?? []);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

/* ══════════════════════════════════════════════════════════════
   SOUS-COMPOSANT : Popup sélection contrat
══════════════════════════════════════════════════════════════ */
const ContratPickerPopup = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const inputRef = useRef(null);

  const load = useCallback(async (q, p) => {
    setLoading(true);
    try {
      const params = { code_groupe_prod: 'G01', estprojet: 'false', page: p, page_size: PAGE_SIZE };
      if (q.trim()) params.search = q.trim();
      const data = await getContrats(params);
      setRows(toArray(data));
      setTotal(data?.count ?? toArray(data).length);
    } catch (err) {
      console.error('ContratPickerPopup:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load('', 1); setTimeout(() => inputRef.current?.focus(), 60); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(search, 1); }, 350);
    return () => clearTimeout(t);
  }, [search, load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const handlePage = (p) => { setPage(p); load(search, p); };

  return (
    <div className="cpp-overlay" onClick={onClose}>
      <div className="cpp-popup" onClick={(e) => e.stopPropagation()}>
        <div className="cpp-header">
          <div className="cpp-header-left">
            <i className="bi bi-file-earmark-text" />
            <span>Sélectionner un contrat</span>
          </div>
          <button type="button" className="cpp-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="cpp-search-bar">
          <i className="bi bi-search cpp-search-ico" />
          <input ref={inputRef} type="text" className="cpp-search-inp"
            placeholder="Rechercher par N° Police, client…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button type="button" className="cpp-search-cls" onClick={() => setSearch('')}>
              <i className="bi bi-x" />
            </button>
          )}
        </div>
        <div className="cpp-table-wrap">
          {loading && <div className="cpp-loading"><i className="bi bi-arrow-repeat cpp-spin" /> Chargement…</div>}
          {!loading && rows.length === 0 && (
            <div className="cpp-empty"><i className="bi bi-inbox" /><span>Aucun contrat trouvé.</span></div>
          )}
          {!loading && rows.length > 0 && (
            <table className="cpp-table">
              <thead><tr>
                <th>N° Police</th><th>N°Avenant</th><th>Date</th>
                <th>Produit</th><th>Compagnie</th><th>Client</th>
                <th>Effet</th><th>Échéance</th><th></th>
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_contrat} className="cpp-row" onClick={() => onSelect(r)}>
                    <td className="cpp-td-police">{r.numPolice || '—'}</td>
                    <td className="cpp-td-av">{r.numAvenant ?? '0'}</td>
                    <td className="cpp-td-date">{r.date_acte ? fmtDate(r.date_acte) : '—'}</td>
                    <td className="cpp-td-prod">{r.nom_produit || '—'}</td>
                    <td className="cpp-td-comp">{r.nom_compagnie || '—'}</td>
                    <td className="cpp-td-client">{r.nom_client_complet || '—'}</td>
                    <td className="cpp-td-date">{r.date_effet ? fmtDate(r.date_effet) : '—'}</td>
                    <td className="cpp-td-date">{r.Date_echeance ? fmtDate(r.Date_echeance) : '—'}</td>
                    <td className="cpp-td-action">
                      <button type="button" className="cpp-btn-select" onClick={() => onSelect(r)}>Sélectionner</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="cpp-pagination">
            <span className="cpp-total">{total} contrat{total > 1 ? 's' : ''}</span>
            <div className="cpp-pages">
              <button type="button" className="cpp-pg-btn" disabled={page === 1} onClick={() => handlePage(page - 1)}>
                <i className="bi bi-chevron-left" />
              </button>
              <span className="cpp-pg-info">Page {page} / {totalPages}</span>
              <button type="button" className="cpp-pg-btn" disabled={page === totalPages} onClick={() => handlePage(page + 1)}>
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
        {totalPages <= 1 && total > 0 && (
          <div className="cpp-pagination">
            <span className="cpp-total">{total} contrat{total > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════════ */
const AvenantChangementImmat = () => {
  const navigate = useNavigate();
  const { contratId: paramContratId } = useParams();

  const [showPicker, setShowPicker] = useState(false);
  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(!!paramContratId);
  const [loadError, setLoadError] = useState(null);
  const [dateEffet, setDateEffet] = useState(today());
  const [vehicules, setVehicules] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [openSections, setOpenSections] = useState({ contrat: true, vehicules: true });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const loadContrat = useCallback(async (id) => {
    setLoading(true);
    setLoadError(null);
    setContrat(null);
    setVehicules([]);
    try {
      const data = await getContratById(id);
      setContrat(data);
      setVehicules(
        (data.risques || []).map((r) => ({
          id_risque: r.id_risque,
          veh_immat: r.veh_immat || '',
          veh_chassis: r.veh_chassis || '',
          veh_marque: r.veh_marque || '',
          veh_modele: r.veh_modele || '',
          veh_cat: r.veh_cat || '',
          newImmat: '',
          editing: false,
          changed: false,
        }))
      );
    } catch (err) {
      setLoadError('Impossible de charger les données du contrat.');
      console.error('AvenantChangementImmat loadContrat:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (paramContratId) loadContrat(paramContratId); }, [paramContratId, loadContrat]);

  const handlePickerSelect = (r) => {
    setShowPicker(false);
    loadContrat(r.id_contrat);
  };

  const toggleEdit = (idx) => setVehicules((p) => p.map((v, i) => i === idx ? { ...v, editing: !v.editing } : v));
  const handleImmatChange = (idx, val) => setVehicules((p) => p.map((v, i) =>
    i === idx ? { ...v, newImmat: val.toUpperCase(), changed: val.trim() !== '' } : v));
  const confirmEdit = (idx) => setVehicules((p) => p.map((v, i) => i === idx ? { ...v, editing: false } : v));

  const nbChanges = vehicules.filter((v) => v.changed && v.newImmat.trim()).length;

  const validate = () => {
    if (!contrat) return 'Aucun contrat sélectionné.';
    if (!dateEffet) return "La date d'effet est requise.";
    if (nbChanges === 0) return 'Aucune nouvelle immatriculation saisie.';
    const list = vehicules.filter((v) => v.changed).map((v) => v.newImmat.trim());
    if (new Set(list).size !== list.length) return 'Deux véhicules ont la même nouvelle immatriculation.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setSaveError(err); return; }
    setSaveError(null);
    setSaving(true);
    try {
      const nextAv = (parseInt(contrat.numAvenant) || 0) + 1;
      await createContrat({
        ID_Client: contrat.ID_Client, Id_compagnie: contrat.Id_compagnie,
        Id_produit: contrat.Id_produit, CodeAgence: contrat.CodeAgence,
        code_apporteur: contrat.code_apporteur, taux_com_apporteur: contrat.taux_com_apporteur,
        commission_courtier: contrat.commission_courtier, type_contrat: contrat.type_contrat,
        nature_contrat: contrat.nature_contrat, type_doc: 'AVENANT',
        numPolice: contrat.numPolice,
        numAvenant: String(nextAv), Motif_avenant: "Changement d'immatriculation",
        date_acte: today(), date_effet: dateEffet, Date_echeance: contrat.Date_echeance,
        duree_contrat: contrat.duree_contrat, fractionnement: contrat.fractionnement,
        prime_nette_brute: contrat.prime_nette_brute, montant_reductions: contrat.montant_reductions,
        prime_net_red: contrat.prime_net_red, accessoires: contrat.accessoires,
        taxe: contrat.taxe, CEMAC: contrat.CEMAC, CSS: contrat.CSS, TSVL: contrat.TSVL,
        CCA: contrat.CCA, prime_totale: contrat.prime_totale, estprojet: false,
      });
      const patches = vehicules
        .filter((v) => v.changed && v.newImmat.trim())
        .map((v) => patchRisque(v.id_risque, { veh_immat: v.newImmat.trim() }));
      if (patches.length) await Promise.all(patches);
      navigate('/contrats/auto');
    } catch (e) {
      setSaveError(`Erreur : ${e.response?.data?.error || e.response?.data?.detail || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && !loading && !!contrat && nbChanges > 0;

  /* ══════════════════════════════════════════════════════════════
     RENDU
  ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="av-page">

        {/* ══ HEADER STRIP ══ */}
        <div className="av-header-strip">
          <div className="av-header-left">
            <i className="bi bi-car-front-fill av-header-ico" />
            <div>
              <div className="av-header-title">Avenant de changement d'immatriculation</div>
            </div>
          </div>
          <div className="av-header-right">
            {contrat && !loading && (
              <span className="av-badge">Avenant n°{(parseInt(contrat.numAvenant) || 0) + 1}</span>
            )}
          </div>
        </div>

        {/* ══ TOOLBAR ══ */}
        <div className="av-toolbar">
          <button className="av-btn-back" onClick={() => navigate('/contrats/auto')}>
            <i className="bi bi-arrow-left" /> Retour aux contrats
          </button>
        </div>

        {/* ══ CORPS ══ */}
        <div className="av-body">

          {/* Section infos contrat */}
          <div className={`av-section${openSections.contrat ? ' open' : ''}`}>
            <div className="av-section-hd" onClick={() => toggleSection('contrat')}>
              <div className="av-section-hd-l">
                <i className="bi bi-file-earmark-text" /> Contrat
              </div>
              <div className="av-section-hd-r">
                <i className={`bi bi-chevron-down av-chev${openSections.contrat ? ' open' : ''}`} />
              </div>
            </div>
            {openSections.contrat && (
              <div className="av-section-bd">
                <div className="av-grid-3">

                  <div className="av-fg">
                    <label className="av-label">N° Police</label>
                    <div className="av-police-row">
                      <input type="text" className="av-input av-input-ro"
                        value={loading ? '…' : (contrat?.numPolice || '')}
                        readOnly placeholder="Aucun contrat sélectionné" />
                      {!paramContratId && (
                        <button type="button" className="av-btn-pick"
                          onClick={(e) => { e.stopPropagation(); setShowPicker(true); }} title="Parcourir les contrats">
                          <i className="bi bi-search" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="av-fg">
                    <label className="av-label">Date Effet <span className="av-req">*</span></label>
                    <input type="date" className="av-input" value={dateEffet}
                      onChange={(e) => setDateEffet(e.target.value)}
                      min={contrat?.date_effet || undefined} />
                  </div>

                  <div className="av-fg">
                    <label className="av-label">Date Échéance</label>
                    <input type="text" className="av-input av-input-ro"
                      value={contrat ? fmtDate(contrat.Date_echeance) : ''} readOnly />
                  </div>

                  <div className="av-fg">
                    <label className="av-label">Compagnie</label>
                    <input type="text" className="av-input av-input-calc"
                      value={contrat?.nom_compagnie || ''} readOnly />
                  </div>

                  <div className="av-fg av-span-2">
                    <label className="av-label">Assuré</label>
                    <input type="text" className="av-input av-input-calc"
                      value={contrat?.nom_client_complet || ''} readOnly />
                  </div>

                </div>

                {loading && <div className="av-state-msg"><i className="bi bi-arrow-repeat av-spin" /> Chargement…</div>}
                {!loading && loadError && <div className="av-alert-err"><i className="bi bi-exclamation-triangle-fill" /> {loadError}</div>}
                {!loading && !paramContratId && !contrat && !loadError && (
                  <div className="av-hint">
                    <i className="bi bi-info-circle" />
                    Cliquez sur <strong><i className="bi bi-search" /></strong> pour sélectionner un contrat.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section véhicules */}
          <div className={`av-section${openSections.vehicules ? ' open' : ''}`}>
            <div className="av-section-hd" onClick={() => toggleSection('vehicules')}>
              <div className="av-section-hd-l">
                <i className="bi bi-card-list" /> Véhicules
                {nbChanges > 0 && (
                  <span className="av-changes-chip">{nbChanges} modifié{nbChanges > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="av-section-hd-r">
                <i className={`bi bi-chevron-down av-chev${openSections.vehicules ? ' open' : ''}`} />
              </div>
            </div>
            {openSections.vehicules && (
              <div className="av-section-bd--table">
                {!contrat && !loading && (
                  <div className="av-placeholder">
                    <i className="bi bi-car-front" />
                    <span>Les véhicules s'afficheront après sélection du contrat.</span>
                  </div>
                )}
                {loading && (
                  <div className="av-placeholder">
                    <i className="bi bi-arrow-repeat av-spin" style={{ fontSize: '1.4rem' }} />
                    <span>Chargement…</span>
                  </div>
                )}
                {!loading && contrat && (
                  <div className="av-table-wrap">
                    <table className="av-table">
                      <thead>
                        <tr>
                          <th>Cat.</th><th>Immat. actuelle</th><th>Nouvelle immat.</th>
                          <th>Châssis</th><th>Marque / Modèle</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicules.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', color: '#a1887f', padding: '28px 14px' }}>
                            <i className="bi bi-inbox" /> Aucun véhicule associé
                          </td></tr>
                        )}
                        {vehicules.map((v, idx) => (
                          <tr key={v.id_risque} className={v.changed ? 'av-tr-changed' : ''}>
                            <td className="av-td-cat">{v.veh_cat || '—'}</td>
                            <td className="av-td-immat-old">{v.veh_immat || '—'}</td>
                            <td className="av-td-immat-new">
                              {v.editing ? (
                                <input type="text" className="av-immat-input"
                                  value={v.newImmat} placeholder="Nouvelle immat." autoFocus
                                  onChange={(e) => handleImmatChange(idx, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmEdit(idx);
                                    if (e.key === 'Escape') toggleEdit(idx);
                                  }} />
                              ) : (
                                v.changed
                                  ? <span className="av-new-badge">{v.newImmat}</span>
                                  : <span className="av-new-empty">—</span>
                              )}
                            </td>
                            <td className="av-td-chassis">{v.veh_chassis || '—'}</td>
                            <td className="av-td-marque">{[v.veh_marque, v.veh_modele].filter(Boolean).join(' ') || '—'}</td>
                            <td className="av-td-action">
                              {v.editing
                                ? <button type="button" className="av-btn-ok" onClick={() => confirmEdit(idx)}><i className="bi bi-check-lg" /></button>
                                : <button type="button" className="av-btn-edit" onClick={() => toggleEdit(idx)}><i className="bi bi-pencil" /></button>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bande finances */}
          {!loading && contrat && (
            <div className="av-finance-bar">
              {[
                { lbl: 'Accessoires', val: contrat.accessoires },
                { lbl: 'TSVL', val: contrat.TSVL },
                { lbl: 'CSS', val: contrat.CSS },
                { lbl: 'CEMAC', val: contrat.CEMAC },
                { lbl: 'CCA', val: contrat.CCA },
                { lbl: 'Taxe', val: contrat.taxe },
              ].map(({ lbl, val }) => (
                <div key={lbl} className="av-fin-cell">
                  <span className="av-fin-lbl">{lbl}</span>
                  <span className="av-fin-val">{fmtNum(val)}</span>
                </div>
              ))}
              <div className="av-fin-cell av-fin-cell--total">
                <span className="av-fin-lbl">Prime nette brute</span>
                <span className="av-fin-val">{fmtNum(contrat.prime_nette_brute)}</span>
              </div>
              <div className="av-fin-cell av-fin-cell--total av-fin-cell--ttc">
                <span className="av-fin-lbl">Prime totale</span>
                <span className="av-fin-val">{fmtNum(contrat.prime_totale)} F</span>
              </div>
            </div>
          )}

        </div>

        {/* ══ FOOTER SOMBRE ══ */}
        <div className="av-footer">
          <div className="av-footer-info">
            {contrat && !loading
              ? <><i className="bi bi-file-earmark-check" /> Police {contrat.numPolice || '—'} · Avenant n°{(parseInt(contrat.numAvenant) || 0) + 1}</>
              : <><i className="bi bi-info-circle" /> Aucun contrat sélectionné</>
            }
          </div>
          <div className="av-footer-mid">
            {saveError && (
              <div className="av-footer-err">
                <i className="bi bi-exclamation-triangle-fill" /> {saveError}
              </div>
            )}
          </div>
          <div className="av-footer-actions">
            <button type="button" className="av-btn-cancel" onClick={() => navigate('/contrats/auto')} disabled={saving}>
              <i className="bi bi-x-circle" /> Annuler
            </button>
            <button type="button" className="av-btn-save" onClick={handleSave} disabled={!canSave}>
              {saving
                ? <><i className="bi bi-arrow-repeat av-spin" /> Enregistrement…</>
                : <><i className="bi bi-check-circle-fill" /> Enregistrer</>
              }
            </button>
          </div>
        </div>

      </div>

      {showPicker && (
        <ContratPickerPopup onSelect={handlePickerSelect} onClose={() => setShowPicker(false)} />
      )}
    </>
  );
};

export default AvenantChangementImmat;
