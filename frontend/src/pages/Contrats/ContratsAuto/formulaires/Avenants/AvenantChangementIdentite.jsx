/**
 * AvenantChangementIdentite.jsx
 * Page — Avenant de changement d'identité du souscripteur.
 *
 * Routes :
 *  /contrats/auto/avenant/identite            → mode search
 *  /contrats/auto/avenant/identite/:contratId → contrat pré-chargé
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getContrats, getContratById, createContrat } from '../../../../../services/contrats';
import crmService from '../../../../../services/crm';
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
   SOUS-COMPOSANT : Popup sélection client
══════════════════════════════════════════════════════════════ */
const ClientPickerPopup = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('physique'); // 'physique' | 'entreprise'
  const PAGE_SIZE = 15;
  const inputRef = useRef(null);

  const load = useCallback(async (q, p, tab) => {
    setLoading(true);
    try {
      const params = { page: p, page_size: PAGE_SIZE };
      if (q.trim()) params.search = q.trim();
      if (tab === 'physique') params.est_entreprise = 'false';
      if (tab === 'entreprise') params.est_entreprise = 'true';
      const data = await crmService.getClients(params);
      setRows(toArray(data));
      setTotal(data?.count ?? toArray(data).length);
    } catch (err) {
      console.error('ClientPickerPopup:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load('', 1, 'physique'); setTimeout(() => inputRef.current?.focus(), 60); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(search, 1, activeTab); }, 350);
    return () => clearTimeout(t);
  }, [search, activeTab, load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const handlePage = (p) => { setPage(p); load(search, p, activeTab); };
  const handleTab = (tab) => { setActiveTab(tab); setPage(1); };

  return (
    <div className="cpp-overlay" onClick={onClose}>
      <div className="cpp-popup" onClick={(e) => e.stopPropagation()}>
        <div className="cpp-header">
          <div className="cpp-header-left">
            <i className="bi bi-person-lines-fill" />
            <span>Sélectionner un client</span>
          </div>
          <button type="button" className="cpp-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        {/* Onglets physique / entreprise */}
        <div className="ccp-tabs">
          {[
            { key: 'physique', label: 'Personnes physiques' },
            { key: 'entreprise', label: 'Entreprises' },
          ].map((t) => (
            <button key={t.key} type="button"
              className={`ccp-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => handleTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="cpp-search-bar">
          <i className="bi bi-search cpp-search-ico" />
          <input ref={inputRef} type="text" className="cpp-search-inp"
            placeholder="Rechercher par nom, NIF, téléphone…"
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
            <div className="cpp-empty"><i className="bi bi-inbox" /><span>Aucun client trouvé.</span></div>
          )}
          {!loading && rows.length > 0 && (
            <table className="cpp-table">
              <thead><tr>
                <th>Nom / Raison sociale</th><th>Type</th><th>NIF</th>
                <th>Téléphone</th><th>Email</th><th></th>
              </tr></thead>
              <tbody>
                {rows.map((r) => {
                  const nom = r.nom_complet || [r.prenom_client, r.nom_client].filter(Boolean).join(' ') || '—';
                  return (
                    <tr key={r.id_client} className="cpp-row" onClick={() => onSelect(r)}>
                      <td className="cpp-td-client" style={{ fontWeight: 600 }}>{nom}</td>
                      <td className="cpp-td-av">
                        {r.est_entreprise
                          ? <span className="ccp-tag-ent">Entreprise</span>
                          : <span className="ccp-tag-phys">Physique</span>}
                      </td>
                      <td className="cpp-td-nif">{r.nif_client || '—'}</td>
                      <td className="cpp-td-tel">{r.telephone || '—'}</td>
                      <td className="cpp-td-email">{r.email || '—'}</td>
                      <td className="cpp-td-action">
                        <button type="button" className="cpp-btn-select" onClick={() => onSelect(r)}>Sélectionner</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="cpp-pagination">
            <span className="cpp-total">{total} client{total > 1 ? 's' : ''}</span>
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
            <span className="cpp-total">{total} client{total > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* État initial du formulaire */
const emptyForm = () => ({
  civilite: '',
  est_entreprise: false,
  nom_client: '',
  prenom_client: '',
  nif_client: '',
  adresse: '',
  telephone: '',
  tel_whatsapp: '',
  email: '',
  motif: '',
  piece_justif: '',
  observation: '',
});

/* ══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════════ */
const AvenantChangementIdentite = () => {
  const navigate = useNavigate();
  const { contratId: paramContratId } = useParams();

  const [showPicker, setShowPicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(!!paramContratId);
  const [loadError, setLoadError] = useState(null);
  const [ancienClient, setAncienClient] = useState(null);
  const [nouveauClient, setNouveauClient] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [dateEffet, setDateEffet] = useState(today());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [openSections, setOpenSections] = useState({ contrat: true, ancien: true, nouveau: true, details: true });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const handleClientSelect = (client) => {
    setShowClientPicker(false);
    setNouveauClient(client);
    setForm({
      civilite: client.civilite || '',
      est_entreprise: client.est_entreprise || false,
      nom_client: client.nom_client || '',
      prenom_client: client.prenom_client || '',
      nif_client: client.nif_client || '',
      adresse: client.adresse || '',
      telephone: client.telephone || '',
      tel_whatsapp: client.tel_whatsapp || '',
      email: client.email || '',
      motif: form.motif,
      piece_justif: form.piece_justif,
      observation: form.observation,
    });
  };

  const loadContrat = useCallback(async (id) => {
    setLoading(true);
    setLoadError(null);
    setContrat(null);
    setAncienClient(null);
    setForm(emptyForm());
    try {
      const data = await getContratById(id);
      setContrat(data);
      if (data.ID_Client) {
        try {
          const client = await crmService.getClientById(data.ID_Client);
          setAncienClient(client);
          // Le formulaire "Nouveau souscripteur" reste vide — l'utilisateur saisit les nouvelles données
        } catch (clientErr) {
          console.warn('Impossible de charger le client:', clientErr);
        }
      }
    } catch (err) {
      setLoadError('Impossible de charger les données du contrat.');
      console.error('AvenantChangementIdentite loadContrat:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (paramContratId) loadContrat(paramContratId); }, [paramContratId, loadContrat]);

  const handlePickerSelect = (r) => { setShowPicker(false); loadContrat(r.id_contrat); };
  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const hasChanges = () => {
    // Si un nouveau client distinct a été sélectionné → toujours considéré comme changement
    if (nouveauClient && nouveauClient.id_client !== contrat?.ID_Client) return true;
    if (!ancienClient) return false;
    const fields = ['civilite', 'est_entreprise', 'nom_client', 'prenom_client', 'nif_client', 'adresse', 'telephone', 'tel_whatsapp', 'email'];
    return fields.some((k) => {
      const orig = ancienClient[k] ?? (k === 'est_entreprise' ? false : '');
      const curr = form[k] ?? (k === 'est_entreprise' ? false : '');
      return String(orig) !== String(curr);
    });
  };

  const validate = () => {
    if (!contrat) return 'Aucun contrat sélectionné.';
    if (!dateEffet) return "La date d'effet est requise.";
    if (!form.motif.trim()) return 'Le motif du changement est requis.';
    if (!hasChanges()) return 'Aucune modification des données du souscripteur détectée.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setSaveError(err); return; }
    setSaveError(null);
    setSaving(true);
    try {
      const nextAv = (parseInt(contrat.numAvenant) || 0) + 1;
      // Si un nouveau client distinct a été sélectionné, on change l'ID_Client du contrat
      const targetClientId = (nouveauClient && nouveauClient.id_client !== contrat.ID_Client)
        ? nouveauClient.id_client
        : contrat.ID_Client;
      await createContrat({
        ID_Client: targetClientId, Id_compagnie: contrat.Id_compagnie,
        Id_produit: contrat.Id_produit, CodeAgence: contrat.CodeAgence,
        code_apporteur: contrat.code_apporteur, taux_com_apporteur: contrat.taux_com_apporteur,
        commission_courtier: contrat.commission_courtier, type_contrat: contrat.type_contrat,
        nature_contrat: contrat.nature_contrat, type_doc: 'AVENANT',
        numPolice: contrat.numPolice,
        numAvenant: String(nextAv), Motif_avenant: "Changement d'identité",
        piece_justif: form.piece_justif || null, observation: form.observation || null,
        date_acte: today(), date_effet: dateEffet, Date_echeance: contrat.Date_echeance,
        duree_contrat: contrat.duree_contrat, fractionnement: contrat.fractionnement,
        prime_nette_brute: contrat.prime_nette_brute, montant_reductions: contrat.montant_reductions,
        prime_net_red: contrat.prime_net_red, accessoires: contrat.accessoires,
        taxe: contrat.taxe, CEMAC: contrat.CEMAC, CSS: contrat.CSS,
        TSVL: contrat.TSVL, CCA: contrat.CCA, prime_totale: contrat.prime_totale, estprojet: false,
      });
      // Patch les données modifiées sur le client cible
      await crmService.patchClient(targetClientId, {
        civilite: form.civilite,
        est_entreprise: form.est_entreprise,
        nom_client: form.nom_client,
        prenom_client: form.est_entreprise ? '' : form.prenom_client,
        nif_client: form.nif_client,
        adresse: form.adresse,
        telephone: form.telephone,
        tel_whatsapp: form.tel_whatsapp,
        email: form.email,
      });
      navigate('/contrats/auto');
    } catch (e) {
      setSaveError(`Erreur : ${e.response?.data?.error || e.response?.data?.detail || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && !loading && !!contrat && !!ancienClient;

  /* ══════════════════════════════════════════════════════════════
     RENDU
  ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="av-page">

        {/* ══ HEADER STRIP ══ */}
        <div className="av-header-strip">
          <div className="av-header-left">
            <i className="bi bi-person-badge-fill av-header-ico" />
            <div>
              <div className="av-header-title">Avenant de changement d'identité</div>
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
                    <label className="av-label">Assuré actuel</label>
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

          {/* Section ancien souscripteur */}
          {!loading && ancienClient && (
            <div className={`av-section${openSections.ancien ? ' open' : ''}`}>
              <div className="av-section-hd" onClick={() => toggleSection('ancien')}>
                <div className="av-section-hd-l">
                  <i className="bi bi-person" /> Ancien souscripteur
                </div>
                <div className="av-section-hd-r">
                  <i className={`bi bi-chevron-down av-chev${openSections.ancien ? ' open' : ''}`} />
                </div>
              </div>
              {openSections.ancien && (
                <div className="av-section-bd">
                  <div className="av-grid-2">
                    <div className="av-fg av-span-2">
                      <label className="av-label">Nom souscripteur</label>
                      <input type="text" className="av-input av-input-calc"
                        value={ancienClient.nom_complet || [ancienClient.prenom_client, ancienClient.nom_client].filter(Boolean).join(' ') || '—'}
                        readOnly />
                    </div>
                    <div className="av-fg">
                      <label className="av-label">NIF</label>
                      <input type="text" className="av-input av-input-calc" value={ancienClient.nif_client || '—'} readOnly />
                    </div>
                    <div className="av-fg">
                      <label className="av-label">Adresse</label>
                      <input type="text" className="av-input av-input-calc" value={ancienClient.adresse || '—'} readOnly />
                    </div>
                    <div className="av-fg">
                      <label className="av-label">Tel</label>
                      <input type="text" className="av-input av-input-calc" value={ancienClient.telephone || '—'} readOnly />
                    </div>
                    <div className="av-fg">
                      <label className="av-label">Whatsapp</label>
                      <input type="text" className="av-input av-input-calc" value={ancienClient.tel_whatsapp || '—'} readOnly />
                    </div>
                    <div className="av-fg av-span-2">
                      <label className="av-label">Email</label>
                      <input type="text" className="av-input av-input-calc" value={ancienClient.email || '—'} readOnly />
                    </div>
                    <div className="av-fg av-span-2">
                      <label className="av-checkbox-row" style={{ cursor: 'default' }}>
                        <input type="checkbox" checked={ancienClient.est_entreprise || false} readOnly onChange={() => { }} />
                        <span>Entreprise</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section nouveau souscripteur */}
          <div className={`av-section${openSections.nouveau ? ' open' : ''}`}>
            <div className="av-section-hd" onClick={() => toggleSection('nouveau')}>
              <div className="av-section-hd-l">
                <i className="bi bi-person-check" /> Nouveau souscripteur
              </div>
              <div className="av-section-hd-r">
                <i className={`bi bi-chevron-down av-chev${openSections.nouveau ? ' open' : ''}`} />
              </div>
            </div>
            {openSections.nouveau && (
              <div className="av-section-bd">

                {!contrat && !loading && (
                  <div className="av-placeholder">
                    <i className="bi bi-person-lines-fill" />
                    <span>Les champs s'afficheront après sélection du contrat.</span>
                  </div>
                )}
                {loading && (
                  <div className="av-placeholder">
                    <i className="bi bi-arrow-repeat av-spin" style={{ fontSize: '1.4rem' }} />
                    <span>Chargement…</span>
                  </div>
                )}

                {!loading && contrat && (
                  <div className="av-grid-2">

                    {/* Bouton sélection client + chip client sélectionné */}
                    <div className="av-fg av-span-2">
                      <label className="av-label">Rechercher un client existant</label>
                      <div className="av-client-pick-row">
                        <button type="button" className="av-btn-client-pick"
                          onClick={() => setShowClientPicker(true)}>
                          <i className="bi bi-search" /> Parcourir les clients
                        </button>
                        {nouveauClient && (
                          <div className="av-client-chip">
                            <i className="bi bi-person-check-fill av-client-chip-ico" />
                            <span className="av-client-chip-nm">
                              {nouveauClient.nom_complet || [nouveauClient.prenom_client, nouveauClient.nom_client].filter(Boolean).join(' ') || '—'}
                            </span>
                            {nouveauClient.est_entreprise && (
                              <span className="ccp-tag-ent">Entreprise</span>
                            )}
                            <button type="button" className="av-client-chip-cls"
                              onClick={() => { setNouveauClient(null); setForm(emptyForm()); }}
                              title="Effacer la sélection">
                              <i className="bi bi-x" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="av-fg av-span-2">
                      <label className="av-checkbox-row">
                        <input type="checkbox" checked={form.est_entreprise}
                          onChange={(e) => setField('est_entreprise', e.target.checked)} />
                        <span>Entreprise</span>
                      </label>
                    </div>

                    <div className={`av-fg ${form.est_entreprise ? 'av-span-2' : ''}`}>
                      <label className="av-label">{form.est_entreprise ? 'Raison sociale' : 'Nom'} <span className="av-req">*</span></label>
                      <input type="text" className="av-input" value={form.nom_client}
                        onChange={(e) => setField('nom_client', e.target.value)}
                        placeholder={form.est_entreprise ? 'Raison sociale' : 'Nom de famille'} />
                    </div>

                    {!form.est_entreprise && (
                      <div className="av-fg">
                        <label className="av-label">Prénom</label>
                        <input type="text" className="av-input" value={form.prenom_client}
                          onChange={(e) => setField('prenom_client', e.target.value)}
                          placeholder="Prénom" />
                      </div>
                    )}

                    <div className="av-fg">
                      <label className="av-label">NIF</label>
                      <input type="text" className="av-input" value={form.nif_client}
                        onChange={(e) => setField('nif_client', e.target.value)}
                        placeholder="Numéro d'identification fiscale" />
                    </div>

                    <div className="av-fg av-span-2">
                      <label className="av-label">Adresse</label>
                      <input type="text" className="av-input" value={form.adresse}
                        onChange={(e) => setField('adresse', e.target.value)}
                        placeholder="Adresse postale" />
                    </div>

                    <div className="av-fg">
                      <label className="av-label">Téléphone</label>
                      <input type="text" className="av-input" value={form.telephone}
                        onChange={(e) => setField('telephone', e.target.value)}
                        placeholder="N° de téléphone" />
                    </div>

                    <div className="av-fg">
                      <label className="av-label">WhatsApp</label>
                      <input type="text" className="av-input" value={form.tel_whatsapp}
                        onChange={(e) => setField('tel_whatsapp', e.target.value)}
                        placeholder="N° WhatsApp" />
                    </div>

                    <div className="av-fg av-span-2">
                      <label className="av-label">Email</label>
                      <input type="email" className="av-input" value={form.email}
                        onChange={(e) => setField('email', e.target.value)}
                        placeholder="adresse@email.com" />
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section détails du changement */}
          {!loading && contrat && (
            <div className={`av-section${openSections.details ? ' open' : ''}`}>
              <div className="av-section-hd" onClick={() => toggleSection('details')}>
                <div className="av-section-hd-l">
                  <i className="bi bi-pencil-square" /> Détail du changement d'identité
                </div>
                <div className="av-section-hd-r">
                  <i className={`bi bi-chevron-down av-chev${openSections.details ? ' open' : ''}`} />
                </div>
              </div>
              {openSections.details && (
                <div className="av-section-bd">
                  <div className="av-grid-2">
                    <div className="av-fg av-span-2">
                      <label className="av-label">Motif du changement <span className="av-req">*</span></label>
                      <textarea className="av-input av-textarea" rows={2}
                        value={form.motif} onChange={(e) => setField('motif', e.target.value)}
                        placeholder="Raison du changement d'identité…" />
                    </div>
                    <div className="av-fg av-span-2">
                      <label className="av-label">Pièce justificative</label>
                      <input type="text" className="av-input" value={form.piece_justif}
                        onChange={(e) => setField('piece_justif', e.target.value)}
                        placeholder="Référence ou N° de la pièce justificative" />
                    </div>
                    <div className="av-fg av-span-2">
                      <label className="av-label">Observation</label>
                      <textarea className="av-input av-textarea" rows={2}
                        value={form.observation} onChange={(e) => setField('observation', e.target.value)}
                        placeholder="Observations diverses…" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
            <button type="button" className="av-btn-save" onClick={handleSave} disabled={!canSave || saving}>
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
      {showClientPicker && (
        <ClientPickerPopup onSelect={handleClientSelect} onClose={() => setShowClientPicker(false)} />
      )}
    </>
  );
};

export default AvenantChangementIdentite;
