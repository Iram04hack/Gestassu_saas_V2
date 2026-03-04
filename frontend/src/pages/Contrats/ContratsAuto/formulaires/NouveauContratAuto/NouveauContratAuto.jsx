import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../../../../../components/CustomSelect/CustomSelect';
import RisquePickerModal from '../../../../../components/RisquePickerModal/RisquePickerModal';
import crmService from '../../../../../services/crm';
import { getAgences, getCompagnies, getProduits, createContrat, importRisquesExcel, getRisquesChoices, getInfoSociete, genererQuittance } from '../../../../../services/contrats';
import commerciauxService from '../../../../../services/commerciauxService';
import VehicleCategoriesService from '../../../../../services/vehicleCategoriesService';
import productsService from '../../../../../services/products';
import tarifsAutoService from '../../../../../services/tarifsAutoService';
import compagniesService from '../../../../../services/compagnies';
import './NouveauContratAuto.css';

/* ─── Helpers ─── */
const toArray = (d) => Array.isArray(d) ? d : (d?.results || []);
const today = () => new Date().toISOString().split('T')[0];
const fmtNum = (n) => (parseFloat(n) || 0).toLocaleString('fr-FR');

const getTauxFractionnement = (duree) => {
    const n = parseInt(duree) || 0;
    if (n === 1) return { taux: 0.28, pct: 28, label: '1 mois', cls: 'fract-low' };
    if (n >= 2 && n <= 3) return { taux: 0.44, pct: 44, label: '2-3 mois', cls: 'fract-med' };
    if (n >= 4 && n <= 6) return { taux: 0.68, pct: 68, label: '4-6 mois', cls: 'fract-high' };
    if (n >= 7 && n <= 12) return { taux: 1.00, pct: 100, label: 'Annuel', cls: 'fract-full' };
    return { taux: 0, pct: 0, label: '—', cls: '' };
};

/* Valeurs par défaut (utilisées si l'API ne retourne rien) */
const DEFAULT_ENERGIE_OPTIONS = [
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Électrique', label: 'Électrique' },
    { value: 'Essence', label: 'Essence' },
    { value: 'Hybride', label: 'Hybride' },
];
const DEFAULT_USAGE_OPTIONS = [
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Personnel', label: 'Personnel' },
    { value: 'Taxi', label: 'Taxi' },
    { value: 'Transport en commun', label: 'Transport en commun' },
    { value: 'Utilitaire', label: 'Utilitaire' },
];

const FRAIS_FIELDS = [
    { name: 'accessoires', label: 'Accessoires' },
    { name: 'taxe', label: 'Taxe' },
    { name: 'CEMAC', label: 'CEMAC' },
    { name: 'CSS', label: 'CSS' },
    { name: 'TSVL', label: 'TSVL' },
    { name: 'CCA', label: 'CCA' },
];

const INITIAL_FORM = {
    CodeAgence: '',
    Id_compagnie: '',
    Id_produit: '',
    type_contrat: 'Mono',
    nature_contrat: 'Sans Tacite Reconduction',
    type_doc: 'AFFAIRE NOUVELLE',
    date_acte: today(),
    date_effet: '',
    duree_contrat: 12,
    Date_echeance: '',
    fractionnement: 1.00,
    numAvenant: 0,          // gen_numpolice doc §7 : initialisé à 0 (affaire nouvelle)
    code_apporteur: '',
    taux_com_apporteur: 0,
    commission_courtier: 0,
    prime_nette_brute: 0,
    montant_reductions: 0,
    prime_net_red: 0,
    accessoires: 0,
    taxe: 0,
    CEMAC: 0,
    CSS: 0,
    TSVL: 0,
    CCA: 0,
    prime_totale: 0,
};

const makeGarantieRow = (g) => ({
    id_garantie: g.id_garantie || g.ID_Garantie || '',
    nom: g.libelle_garantie || g.lib_garantie || g.nom_garantie || g.id_garantie || '—',
    est_obligatoire: !!g.est_obligatoire,
    selected: !!g.est_obligatoire,  // seules les obligatoires cochées par défaut (comme WinDev)
    inclus_pf: !!(g.inclus_pf || g.inclus_PF),
    inclus_vv: !!(g.inclus_vv || g.inclus_ValeurVenal),
    inclus_surprime: !!g.inclus_surprime,
    reduc_com_flotte: !!g.reduc_com_flotte,  // §11.2 : éligibilité réduction commerciale flotte
    capital: '',
    franchise: '',
    prime_annuelle: '',
});

const makeVehicle = (garantiesTemplate = []) => ({
    _id: `${Date.now()}_${Math.random()}`,
    veh_immat: '',
    veh_marque: '',
    veh_modele: '',
    veh_cat: '',
    veh_nbplace: '',
    veh_energie: '',
    veh_usage: '',
    veh_chassis: '',
    veh_puissance: '',
    veh_valeur_venale: '',
    veh_valeur_neuve: '',
    veh_nbremorque: '',
    garanties: garantiesTemplate.map(makeGarantieRow),
});

/* ─── §11.2 Helpers réductions flotte ─── */
const getTauxRedFlotte = (nb) => {
    if (nb < 10) return 0;
    if (nb <= 30) return 5;
    return 10;
};

const getTauxRedCom = (nb) => {
    if (nb < 11) return 0;
    if (nb <= 30) return 10;
    if (nb <= 50) return 15;
    if (nb <= 100) return 20;
    if (nb <= 200) return 25;
    if (nb <= 500) return 30;
    return 35;
};

/* 5 lignes de réduction fixes — libellés identiques au desktop WinDev */
const REDUCTIONS_INITIALES = [
    { key: 'bonus',      label: 'Bonus',      taux: 0 },
    { key: 'red_com',    label: 'Red Com',     taux: 0 },
    { key: 'red_flotte', label: 'Red Flotte',  taux: 0 },
    { key: 'stat_auto',  label: 'Stat Auto',   taux: 0 },
    { key: 'stat_ip',    label: 'Stat IP',     taux: 0 },
];

/* ════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ════════════════════════════════════════════════ */
const NouveauContratAuto = () => {
    const navigate = useNavigate();

    const [openSections, setOpenSections] = useState({
        souscripteur: true,
        couverture: true,
        apporteur: false,
        garanties: true,
        vehicules: true,
        reductions: false,
        synthese: true,
    });

    const [showVehiclePicker, setShowVehiclePicker] = useState(false);


    /* ── Client ── */
    const [allClients, setAllClients] = useState({ physique: [], entreprise: [] });
    const [clientSearch, setClientSearch] = useState('');
    const [clientTab, setClientTab] = useState('physique');
    const [selectedClient, setSelectedClient] = useState(null);
    const [loadingClients, setLoadingClients] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    /* ── Données de référence ── */
    const [agences, setAgences] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [produits, setProduits] = useState([]);
    const [apporteurs, setApporteurs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [garantiesTemplate, setGarantiesTemplate] = useState([]);
    const [garantiesRows, setGarantiesRows] = useState([]); // état éditable des garanties
    const [energieOptions, setEnergieOptions] = useState(DEFAULT_ENERGIE_OPTIONS);
    const [usageOptions, setUsageOptions] = useState(DEFAULT_USAGE_OPTIONS);

    /* ── Formulaire ── */
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [vehicules, setVehicules] = useState([]);
    const [reductions, setReductions] = useState(REDUCTIONS_INITIALES);

    /* ── UI ── */
    const [saveMode, setSaveMode] = useState(null); // 'projet' | 'contrat' | null
    const saving = saveMode !== null;
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(null);
    const [savedProjet, setSavedProjet] = useState(false);
    const [calcLoading, setCalcLoading] = useState(false);
    const [calcMsg, setCalcMsg] = useState(null); // { type: 'err'|'ok'|'warn', text: '' }
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState(null); // { created, skipped, errors } | null
    const excelInputRef = useRef(null);

    /* ── Véhicule en cours d'édition (table inline) ── */
    const [editingVehicleIdx, setEditingVehicleIdx] = useState(null);

    /* ── Véhicule sélectionné dans la vue Garanties (null = totaux) ── */
    const [selectedVehiculeIdx, setSelectedVehiculeIdx] = useState(null);

    /* ── Taux de taxe produit (%) — auto-rempli depuis produit, modifiable ── */
    const [tauxTaxe, setTauxTaxe] = useState(0);

    /* ── §13 Accessoires — message d'auto-lookup ── */
    const [accessoireAutoMsg, setAccessoireAutoMsg] = useState(null);

    const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

    /* ══ Chargement initial: clients + données de référence ══ */
    useEffect(() => {
        const load = async () => {
            setLoadingClients(true);
            try {
                const [clients, ag, comp, ap, cats, choices, societeRes] = await Promise.all([
                    crmService.getClients({ page_size: 1000 }),
                    getAgences(),
                    getCompagnies(),
                    commerciauxService.getApporteurs(),
                    VehicleCategoriesService.getAll(),
                    getRisquesChoices(),
                    getInfoSociete(),
                ]);
                const all = toArray(clients);
                setAllClients({
                    physique: all.filter(c => !c.est_entreprise),
                    entreprise: all.filter(c => c.est_entreprise),
                });
                setAgences(toArray(ag));
                setCompagnies(toArray(comp));
                setApporteurs(toArray(ap.data));
                setCategories(toArray(cats));
                if (choices?.energies?.length) {
                    setEnergieOptions(choices.energies.map(v => ({ value: v, label: v })));
                }
                if (choices?.usages?.length) {
                    setUsageOptions(choices.usages.map(v => ({ value: v, label: v })));
                }
                // Récupération CEMAC et CCA depuis info_societe
                const societeList = toArray(societeRes);
                if (societeList.length > 0) {
                    const s = societeList[0];
                    setFormData(p => ({
                        ...p,
                        CEMAC: parseInt(s.param_CEMAC) || 0,
                        CCA: parseInt(s.param_CCA) || 0,
                    }));
                }
            } catch (e) {
                console.error('Erreur chargement initial :', e);
            } finally {
                setLoadingClients(false);
            }
        };
        load();
    }, []);

    /* ══ Produits filtrés par compagnie ══ */
    useEffect(() => {
        if (!formData.Id_compagnie) { setProduits([]); return; }
        getProduits({
            Id_compagnie: formData.Id_compagnie,
            code_groupe_prod: 'G01',   // G01 = groupe produits Automobile
        })
            .then(res => {
                // Filtre de sécurité côté frontend :
                // on conserve aussi les produits dont la branche mentionne "auto"
                // (au cas où le code_groupe_prod varie selon la compagnie)
                const all = toArray(res);
                const autos = all.filter(p => {
                    const grp = (p.code_groupe_prod || '').toLowerCase();
                    const br = (p.branche || '').toLowerCase();
                    return grp === 'g01' || br.includes('auto');
                });
                setProduits(autos.length > 0 ? autos : all); // fallback si aucun résultat filtré
            })
            .catch(() => setProduits([]));
    }, [formData.Id_compagnie]);

    /* ══ Garanties liées au produit sélectionné ══ */
    useEffect(() => {
        setSelectedVehiculeIdx(null); // réinitialiser la sélection au changement de produit
        if (!formData.Id_produit) {
            setGarantiesTemplate([]);
            setGarantiesRows([]);
            setVehicules(p => p.map(v => ({ ...v, garanties: [] })));
            return;
        }
        productsService.getGaranties({ id_produit: formData.Id_produit })
            .then(res => {
                const list = toArray(res);
                const rows = list.map(makeGarantieRow);
                setGarantiesTemplate(list);
                setGarantiesRows(rows);
                setVehicules(p => p.map(v => ({ ...v, garanties: rows.map(r => ({ ...r })) })));
            })
            .catch((err) => {
                console.error('[NCA] Erreur chargement garanties:', err?.response?.status, err?.response?.data || err.message);
            });
    }, [formData.Id_produit]);

    /* ══ Taux taxe depuis le produit sélectionné ══ */
    useEffect(() => {
        if (!formData.Id_produit) { setTauxTaxe(0); return; }
        const produit = produits.find(p => p.id_produit === formData.Id_produit);
        if (produit?.taux_taxe !== undefined && produit?.taux_taxe !== null) {
            setTauxTaxe(parseFloat(produit.taux_taxe) || 0);
        }
    }, [formData.Id_produit, produits]);

    /* ══ §13 Accessoires — auto-lookup depuis FRAIS_ACCESSOIRE ══
       Déclenché dès que la prime nette brute change ou que la compagnie change.
       Cherche la tranche [interv_min, interv_max] correspondant à la PNB et pré-remplit
       le champ Accessoires. L'utilisateur peut corriger manuellement. */
    useEffect(() => {
        const pnb = parseFloat(formData.prime_nette_brute) || 0;
        if (!formData.Id_compagnie || pnb <= 0) {
            setAccessoireAutoMsg(null);
            return;
        }
        compagniesService.getAccessoires(formData.Id_compagnie)
            .then(res => {
                const list = toArray(res);
                const found = list.find(a =>
                    pnb >= (parseInt(a.interv_min) || 0) &&
                    pnb <= (parseInt(a.interv_max) || Infinity)
                );
                if (found) {
                    setFormData(p => ({ ...p, accessoires: found.montant }));
                    setAccessoireAutoMsg(
                        `Auto : ${parseInt(found.montant).toLocaleString('fr-FR')} F` +
                        ` (tranche ${parseInt(found.interv_min).toLocaleString('fr-FR')}` +
                        ` – ${parseInt(found.interv_max).toLocaleString('fr-FR')} F)`
                    );
                } else {
                    setAccessoireAutoMsg('Aucune tranche trouvée pour cette prime — saisie manuelle requise.');
                }
            })
            .catch(() => setAccessoireAutoMsg(null));
    }, [formData.prime_nette_brute, formData.Id_compagnie]);

    /* ══ Helper : met à jour une garantie dans garantiesRows ET dans tous les véhicules ══ */
    const updateGarantieRow = (gIdx, field, value) => {
        setGarantiesRows(prev => prev.map((r, i) => i !== gIdx ? r : { ...r, [field]: value }));
        setVehicules(p => p.map(v => ({
            ...v,
            garanties: v.garanties.map((gg, j) => j !== gIdx ? gg : { ...gg, [field]: value }),
        })));
    };

    const toggleGarantieRow = (gIdx) => {
        setGarantiesRows(prev => {
            const newRows = prev.map((r, i) => i !== gIdx ? r : { ...r, selected: !r.selected });
            setVehicules(p => p.map(v => ({
                ...v,
                garanties: v.garanties.map((gg, j) => j !== gIdx ? gg : { ...gg, selected: !gg.selected }),
            })));
            return newRows;
        });
    };


    /* ══ Date d'échéance + fractionnement ══ */
    useEffect(() => {
        if (!formData.date_effet || !formData.duree_contrat) return;
        const d = new Date(formData.date_effet);
        d.setMonth(d.getMonth() + (parseInt(formData.duree_contrat) || 0));
        const fract = getTauxFractionnement(formData.duree_contrat);
        setFormData(p => ({
            ...p,
            Date_echeance: d.toISOString().split('T')[0],
            fractionnement: fract.taux,
        }));
        // §3.7 — Avertissement si durée hors plage barème (> 12 mois)
        const n = parseInt(formData.duree_contrat) || 0;
        if (n > 12) {
            setCalcMsg({ type: 'warn', text: `Durée de ${n} mois : le barème de fractionnement couvre 1 à 12 mois maximum. Le taux appliqué est 100 % (≥ 7 mois). Vérifiez la durée saisie.` });
        }
    }, [formData.date_effet, formData.duree_contrat]);

    /* ══ Montant total des réductions ══ */
    useEffect(() => {
        const pnb = parseFloat(formData.prime_nette_brute) || 0;
        const total = reductions.reduce((s, r) => s + pnb * (parseFloat(r.taux) || 0) / 100, 0);
        setFormData(p => ({ ...p, montant_reductions: Math.round(total) }));
        // §19.8 — Alerte si le total des réductions dépasse la prime nette brute
        if (pnb > 0 && total > pnb) {
            setCalcMsg({ type: 'warn', text: `Total réductions (${Math.round(total).toLocaleString('fr-FR')} F) supérieur à la prime nette brute (${pnb.toLocaleString('fr-FR')} F). La prime nette réduite sera ramenée à 0.` });
        }
    }, [reductions, formData.prime_nette_brute]);

    /* ══ calcul_synthese ══
       CSS  = 1 % × (prime_net_red + accessoires)
       Taxe = taux_taxe% × (prime_net_red + accessoires)
       TTC  = prime_net_red + accessoires + taxe + CSS + CEMAC + TSVL + CCA
    ══ */
    useEffect(() => {
        const pnb = parseFloat(formData.prime_nette_brute) || 0;
        const red = parseFloat(formData.montant_reductions) || 0;
        const pnr = Math.max(0, pnb - red);
        const acc = parseFloat(formData.accessoires) || 0;
        const base = pnr + acc;
        const cssAmt = Math.round(0.01 * base);
        const taxeAmt = Math.round(tauxTaxe * base);  // tauxTaxe est déjà un taux décimal (ex: 0.08 = 8%)
        const tsvl = parseFloat(formData.TSVL) || 0;
        const cemac = parseFloat(formData.CEMAC) || 0;
        const cca = parseFloat(formData.CCA) || 0;
        const ttc = pnr + acc + taxeAmt + cssAmt + cemac + tsvl + cca;
        setFormData(p => ({
            ...p,
            prime_net_red: Math.round(pnr),
            taxe: taxeAmt,
            CSS: cssAmt,
            prime_totale: Math.round(ttc),
        }));
    }, [
        formData.prime_nette_brute, formData.montant_reductions,
        formData.accessoires, formData.TSVL, formData.CEMAC, formData.CCA,
        tauxTaxe,
    ]);

    /* ── Handlers généraux ── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'Id_compagnie') {
            setProduits([]);
            setFormData(p => ({ ...p, Id_compagnie: value, Id_produit: '' }));
        } else {
            setFormData(p => ({ ...p, [name]: value }));
        }
    };

    const selectClient = async (client) => {
        setClientSearch('');
        setSelectedClient(client);         // afficher le chip immédiatement
        setLoadingDetail(true);
        try {
            const full = await crmService.getClientById(client.id_client || client.ID_Client);
            setSelectedClient(full);
        } catch {
            // on conserve les données de la liste en cas d'erreur
        } finally {
            setLoadingDetail(false);
        }
    };

    /* ── Handlers véhicules ── */
    const addVehicle = () => {
        setVehicules(p => {
            const newList = [...p, makeVehicle(garantiesTemplate)];
            setEditingVehicleIdx(newList.length - 1);
            return newList;
        });
    };
    const removeVehicle = (idx) => {
        setVehicules(prev => {
            const newList = prev.filter((_, i) => i !== idx);

            // Recalcule les totaux dans garantiesRows depuis les véhicules restants
            setGarantiesRows(rows => rows.map((row, gIdx) => {
                const totalPrime = newList.reduce((s, v) => {
                    const g = v.garanties[gIdx];
                    return s + (g ? parseFloat(g.prime_annuelle) || 0 : 0);
                }, 0);
                return totalPrime > 0 ? { ...row, prime_annuelle: totalPrime } : { ...row, prime_annuelle: '' };
            }));

            return newList;
        });

        setEditingVehicleIdx(prev => {
            if (prev === null) return null;
            if (prev === idx) return null;
            if (prev > idx) return prev - 1;
            return prev;
        });

        setSelectedVehiculeIdx(prev => {
            if (prev === null) return null;
            if (prev === idx) return null;
            if (prev > idx) return prev - 1;
            return prev;
        });
    };

    /** Importe des risques depuis la modale et les convertit en véhicules */
    const addRisquesAsVehicles = (risques) => {
        if (!risques.length) return;

        // En mode Mono : max 1 véhicule au total
        if (formData.type_contrat === 'Mono') {
            const slots = Math.max(0, 1 - vehicules.length);
            if (slots === 0) {
                setCalcMsg({ type: 'warn', text: 'Mode Mono : un seul véhicule est autorisé. Retirez le véhicule existant pour en importer un autre.' });
                return;
            }
            risques = risques.slice(0, slots);
        }

        // Garantit que chaque valeur énergie/usage du véhicule est bien présente
        // dans les options du CustomSelect (au cas où la BD contient des valeurs
        // inconnues des défauts ou de l'API choices).
        const missingEnergies = [];
        const missingUsages = [];
        risques.forEach(r => {
            if (r.veh_energie && !energieOptions.some(o => o.value === r.veh_energie)) {
                if (!missingEnergies.some(o => o.value === r.veh_energie)) {
                    missingEnergies.push({ value: r.veh_energie, label: r.veh_energie });
                }
            }
            if (r.veh_usage && !usageOptions.some(o => o.value === r.veh_usage)) {
                if (!missingUsages.some(o => o.value === r.veh_usage)) {
                    missingUsages.push({ value: r.veh_usage, label: r.veh_usage });
                }
            }
        });
        if (missingEnergies.length > 0) {
            setEnergieOptions(prev =>
                [...prev, ...missingEnergies].sort((a, b) => a.label.localeCompare(b.label))
            );
        }
        if (missingUsages.length > 0) {
            setUsageOptions(prev =>
                [...prev, ...missingUsages].sort((a, b) => a.label.localeCompare(b.label))
            );
        }

        const newVehs = risques.map(r => ({
            ...makeVehicle(garantiesTemplate),
            _id: `risque_${r.id_risque}_${Date.now()}`,
            id_risque: r.id_risque,
            veh_immat: r.veh_immat || '',
            veh_marque: r.veh_marque || '',
            veh_modele: r.veh_modele || '',
            veh_chassis: r.veh_chassis || '',
            veh_type: r.veh_type || '',
            veh_nbplace: r.veh_nbplace ?? '',
            veh_puissance: r.veh_puissance || '',
            veh_cat: r.veh_cat || '',
            veh_energie: r.veh_energie || '',
            veh_usage: r.veh_usage || '',
            veh_valeur_venale: r.veh_valeur_venale || '',
            veh_valeur_neuve: r.veh_valeur_neuve || '',
            veh_nbremorque: r.veh_nbremorque ?? '',
        }));
        setVehicules(p => [...p, ...newVehs]);
        setOpenSections(s => ({ ...s, vehicules: true }));
    };

    /** Import Excel : envoie le fichier au backend, affiche le résultat, ouvre la bibliothèque si des véhicules ont été créés */
    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImportLoading(true);
        setImportResult(null);
        try {
            const result = await importRisquesExcel(file);
            setImportResult(result);
            // Si de nouveaux véhicules ont été créés, ouvre directement la bibliothèque
            if (result.created?.length > 0) {
                setShowVehiclePicker(true);
            }
        } catch (err) {
            setImportResult({ error: err?.response?.data?.error || err.message || 'Erreur import' });
        } finally {
            setImportLoading(false);
            // Réinitialise l'input pour permettre de re-sélectionner le même fichier
            e.target.value = '';
        }
    };


    const handleVehicleChange = (idx, name, value) =>
        setVehicules(p => p.map((v, i) => i !== idx ? v : { ...v, [name]: value }));

    const calculerPrimeDepuisGaranties = async () => {
        setCalcMsg(null);

        // ── Validation obligatoire : date d'effet ────────────────────────
        if (!formData.date_effet) {
            setCalcMsg({ type: 'err', text: "La date d'effet est obligatoire avant de calculer la prime. Renseignez-la dans la section Couverture." });
            return;
        }
        if (!formData.Id_compagnie || !formData.Id_produit) {
            setCalcMsg({ type: 'err', text: 'Sélectionnez une compagnie et un produit avant de calculer.' });
            return;
        }
        if (vehicules.length === 0) {
            setCalcMsg({ type: 'err', text: 'Ajoutez au moins un véhicule avant de calculer.' });
            return;
        }
        if (garantiesRows.filter(g => g.selected).length === 0) {
            setCalcMsg({ type: 'err', text: 'Aucune garantie sélectionnée.' });
            return;
        }

        // Avertissement si certains véhicules n'ont pas catégorie / énergie
        const vehsIncomplets = vehicules.filter(v => !v.veh_cat || !v.veh_energie);
        if (vehsIncomplets.length > 0) {
            setCalcMsg({ type: 'warn', text: `${vehsIncomplets.length} véhicule(s) sans catégorie ou énergie — leur tarif ne sera peut-être pas trouvé. Complétez la fiche véhicule.` });
        }

        const f = getTauxFractionnement(formData.duree_contrat);
        const estEntreprise = selectedClient?.est_entreprise ?? (clientTab === 'entreprise');

        setCalcLoading(true);

        // ── Tentative de calcul via API tarif_auto ─────────────────────────
        if (formData.Id_produit && formData.Id_compagnie) {
            try {
                const payload = {
                    id_compagnie: formData.Id_compagnie,
                    id_produit: formData.Id_produit,
                    est_entreprise: estEntreprise,   // Groupe A/B — doc §3
                    fractionnement: f.taux,           // coefficient période — doc §9
                    vehicules: vehicules.map((v, vIdx) => ({
                        veh_idx: vIdx,
                        cat: v.veh_cat || '',
                        energie: v.veh_energie || '',
                        puissance_fiscale: parseInt(v.veh_puissance || 0),   // PF — doc §3
                        valeur_venale: parseFloat(v.veh_valeur_venale || 0), // VV — doc §3
                        valeur_neuve: parseFloat(v.veh_valeur_neuve || 0),   // VN — doc §3
                        nbplace: parseInt(v.veh_nbplace || 0),               // surprime passagers — doc §6
                        nbremorque: parseInt(v.veh_nbremorque || 0),         // surprime remorque — doc §6
                        garanties: v.garanties
                            .filter(g => g.selected)
                            .map(g => ({
                                id_garantie: g.id_garantie || g.id || '',
                                inclus_pf: g.inclus_pf || false,             // PF dans clé — doc §4
                                inclus_vv: g.inclus_vv || false,             // VV dans clé — doc §4
                                inclus_surprime: g.inclus_surprime || false, // surprime VV — doc §6
                            })),
                    })),
                };

                const result = await tarifsAutoService.calculerPrimes(payload);

                // Mettre à jour les véhicules avec les primes calculées
                setVehicules(prev => prev.map((v, vIdx) => {
                    const vehResult = result.vehicules.find(r => r.veh_idx === vIdx);
                    if (!vehResult) return v;
                    const primesByGarantie = {};
                    vehResult.garanties.forEach(gr => { primesByGarantie[gr.id_garantie] = gr; });
                    return {
                        ...v,
                        garanties: v.garanties.map(g => {
                            const gr = primesByGarantie[g.id_garantie || g.id];
                            if (!gr || !gr.tarif_trouve) return g;
                            return { ...g, prime_annuelle: gr.prime_annuelle, franchise: gr.franchise, capital: gr.capital || g.capital };
                        }),
                    };
                }));

                // Synchroniser garantiesRows avec les TOTAUX sur tous les véhicules
                if (result.vehicules.length > 0) {
                    // Agréger prime_annuelle et franchise par id_garantie (somme sur tous véhicules)
                    const totaux = {};
                    result.vehicules.forEach(vRes => {
                        vRes.garanties.forEach(gr => {
                            if (!gr.tarif_trouve) return;
                            if (!totaux[gr.id_garantie]) {
                                totaux[gr.id_garantie] = { prime_annuelle: 0, franchise: gr.franchise, capital: gr.capital || 0 };
                            }
                            totaux[gr.id_garantie].prime_annuelle += gr.prime_annuelle;
                        });
                    });
                    setGarantiesRows(prev => prev.map(row => {
                        const t = totaux[row.id_garantie];
                        if (!t) return row;
                        return { ...row, prime_annuelle: t.prime_annuelle, franchise: t.franchise, capital: t.capital || row.capital };
                    }));
                }
                // Réinitialiser la sélection de véhicule → vue totaux
                setSelectedVehiculeIdx(null);

                // Prime nette brute = somme des prime_periode — doc §9
                const total = result.vehicules.reduce((s, vRes) =>
                    s + vRes.garanties.reduce((ss, gr) => ss + (gr.prime_periode || 0), 0), 0);

                // Compter les garanties trouvées
                const totalGar = result.vehicules.reduce((s, vRes) => s + vRes.garanties.length, 0);
                const trouvees = result.vehicules.reduce((s, vRes) => s + vRes.garanties.filter(g => g.tarif_trouve).length, 0);

                setFormData(p => ({ ...p, prime_nette_brute: Math.round(total) }));
                setCalcLoading(false);

                // Affichage des infos de debug si des garanties n'ont pas été trouvées
                if (result.debug_non_trouvees?.length > 0) {
                    console.group('[NCA] Garanties non trouvées — diagnostic');
                    result.debug_non_trouvees.forEach(d => {
                        console.warn(`Garantie ${d.id_garantie} — clé envoyée:`, d.clé_envoyée);
                        if (d.ligne_proche) {
                            console.info(`  → Ligne proche trouvée avec groupe="${d.ligne_proche.groupe}", pf=${d.ligne_proche.puissance_fiscale}, vv=${d.ligne_proche.valeur_vehicule}`);
                        } else {
                            console.error(`  → Aucune ligne proche (vérifiez code_cat, energie, id_compagnie, id_produit)`);
                        }
                    });
                    console.groupEnd();
                }

                if (trouvees === 0) {
                    setCalcMsg({ type: 'warn', text: `Aucun tarif trouvé (${totalGar} garantie(s) testée(s)). Vérifiez que catégorie, énergie et compagnie correspondent bien aux lignes tarifaires.` });
                } else {
                    setCalcMsg({ type: 'ok', text: `Prime calculée : ${(Math.round(total)).toLocaleString('fr-FR')} F (${trouvees}/${totalGar} garantie(s) tarifée(s)).` });
                }
                return;
            } catch (err) {
                console.warn('API calculer_primes indisponible, calcul local :', err);
                // continue vers le fallback
            }
        }

        // ── Fallback : calcul local (prime_annuelle × fractionnement) — doc §9
        const total = vehicules.reduce((s, v) =>
            s + v.garanties
                .filter(g => g.selected)
                .reduce((ss, g) => ss + (parseFloat(g.prime_annuelle) || 0), 0), 0);
        const totalArrondi = Math.round(total * f.taux);
        setFormData(p => ({ ...p, prime_nette_brute: totalArrondi }));
        setCalcLoading(false);
        setCalcMsg({ type: 'warn', text: `Calcul local appliqué (API indisponible) : ${totalArrondi.toLocaleString('fr-FR')} F. Vérifiez les primes saisies manuellement.` });
    };

    /* ══ §11.2 Réductions flotte — pré-calcul automatique des lignes Red Flotte et Red Com ══
       En mode Flotte, met à jour les taux de 'red_flotte' et 'red_com' dans les lignes fixes.
       En mode Mono ou sans véhicule, remet ces taux à 0. */
    useEffect(() => {
        if (formData.type_contrat !== 'Flotte' || vehicules.length === 0) {
            setReductions(prev => prev.map(r =>
                (r.key === 'red_flotte' || r.key === 'red_com') ? { ...r, taux: 0 } : r
            ));
            return;
        }
        const nb = vehicules.length;
        const tauxFlotte = getTauxRedFlotte(nb);
        const hasRedCom = garantiesRows.some(g => g.selected && g.reduc_com_flotte);
        const tauxCom = hasRedCom ? getTauxRedCom(nb) : 0;

        setReductions(prev => prev.map(r => {
            if (r.key === 'red_flotte') return { ...r, taux: tauxFlotte };
            if (r.key === 'red_com')    return { ...r, taux: tauxCom };
            return r;
        }));
    }, [formData.type_contrat, vehicules.length, garantiesRows]);

    /* ── Handler réductions — seul le taux est modifiable, ciblé par key ── */
    const handleReductionChange = (key, value) =>
        setReductions(p => p.map(r => r.key !== key ? r : { ...r, taux: value }));

    /* ── Changement de type Mono / Flotte ── */
    const handleTypeContratChange = (type) => {
        if (type === 'Mono' && vehicules.length > 1) {
            setCalcMsg({ type: 'warn', text: `Passage en mode Mono : seul le premier véhicule sera retenu à l'enregistrement. Supprimez les véhicules en trop si nécessaire.` });
        }
        setFormData(p => ({ ...p, type_contrat: type }));
    };

    /* ── Soumission ── */
    const handleSave = async (estprojet) => {
        setSaveError(null);
        setSaveSuccess(null);

        // ── Validation frontend ──────────────────────────────────────────
        if (!estprojet) {
            // Contrat définitif : tous les champs critiques requis
            const errs = [];
            if (!selectedClient) errs.push('Souscripteur non sélectionné');
            if (!formData.Id_compagnie) errs.push('Compagnie manquante');
            if (!formData.Id_produit) errs.push('Produit manquant');
            if (!formData.date_effet) errs.push("Date d'effet manquante");
            if (vehicules.length === 0) errs.push('Aucun véhicule ajouté');
            if (errs.length > 0) {
                setSaveError(errs.join(' · '));
                return;
            }
        } else {
            // Projet : seul le souscripteur est requis
            if (!selectedClient) {
                setSaveError("Sélectionnez un souscripteur avant d'enregistrer en projet.");
                return;
            }
        }

        setSaveMode(estprojet ? 'projet' : 'contrat');
        try {
            // En mode Mono, on n'envoie qu'un seul véhicule
            const vehs = formData.type_contrat === 'Mono' ? vehicules.slice(0, 1) : vehicules;
            const result = await createContrat({
                ...formData,
                estprojet,
                ID_Client: selectedClient?.id_client || selectedClient?.ID_Client || '',
                vehicules: vehs,
                reductions,
            });
            if (!estprojet) {
                // Générer automatiquement la quittance (numPolice + passage projet→contrat)
                await genererQuittance({ id_contrat: result.id_contrat });
            }
            // Reset complet du formulaire dans les deux cas
            setFormData({ ...INITIAL_FORM });
            setVehicules([]);
            setReductions(REDUCTIONS_INITIALES);
            setSelectedClient(null);
            setClientSearch('');
            setGarantiesRows([]);
            setGarantiesTemplate([]);
            setEditingVehicleIdx(null);
            setSelectedVehiculeIdx(null);
            setSavedProjet(false);
            setCalcMsg(null);
            setImportResult(null);
            setTauxTaxe(0);
            setAccessoireAutoMsg(null);
            const msg = estprojet ? 'Projet enregistré avec succès.' : 'Contrat validé avec succès. La quittance a été générée.';
            setSaveSuccess(msg);
            setTimeout(() => setSaveSuccess(null), 6000);
        } catch (e) {
            setSaveError(
                e?.response?.data?.detail ||
                e?.response?.data?.message ||
                e.message ||
                'Erreur lors de la sauvegarde.'
            );
        } finally {
            setSaveMode(null);
        }
    };

    /* ── Valeurs dérivées ── */
    const fract = getTauxFractionnement(formData.duree_contrat);

    // Données affichées dans la table Garanties :
    // - si un véhicule est sélectionné → ses garanties propres
    // - sinon → garantiesRows (totaux post-calcul, ou template vide avant calcul)
    const garantiesAffichees = selectedVehiculeIdx !== null && vehicules[selectedVehiculeIdx]
        ? vehicules[selectedVehiculeIdx].garanties
        : garantiesRows;

    const filteredClients = {
        physique: allClients.physique.filter(c => {
            if (!clientSearch) return true;
            const s = clientSearch.toLowerCase();
            return (c.nom_complet || c.nom_client || '').toLowerCase().includes(s)
                || (c.telephone || '').toLowerCase().includes(s);
        }),
        entreprise: allClients.entreprise.filter(c => {
            if (!clientSearch) return true;
            const s = clientSearch.toLowerCase();
            return (c.nom_complet || c.nom_client || '').toLowerCase().includes(s)
                || (c.telephone || '').toLowerCase().includes(s);
        }),
    };

    const activeClients = clientTab === 'physique'
        ? filteredClients.physique
        : filteredClients.entreprise;

    /* ════════════════════════════════════════════
       RENDU
       ════════════════════════════════════════════ */
    return (
        <div className="nca-page">

            {/* ══ HEADER STRIP ══ */}
            <div className="nca-header-strip">
                <h1>Affaire Nouvelle — Automobile</h1>
                <div className="nca-hdr-badges">
                    <span className="nca-badge nca-badge-type">AFFAIRE NOUVELLE</span>
                    {savedProjet && <span className="nca-badge nca-badge-projet">PROJET</span>}
                </div>
            </div>

            {/* ══ TOOLBAR ══ */}
            <div className="nca-toolbar">
                <button className="nca-btn-back" onClick={() => navigate('/contrats/auto')}>
                    <i className="bi bi-arrow-left"></i> Retour aux contrats
                </button>
            </div>

            {/* ══ ACCORDÉONS ══ */}
            <div className="nca-accordion-wrap">

                {/* ═══ 1. SOUSCRIPTEUR ═══ */}
                <div className={`nca-section ${openSections.souscripteur ? 'open' : ''}`}>
                    <div className="nca-section-hd" onClick={() => toggleSection('souscripteur')}>
                        <div className="nca-section-hd-l">
                            <i className="bi bi-person-lines-fill"></i>
                            <span>Souscripteur</span>
                            {selectedClient && !openSections.souscripteur && (
                                <span className="nca-inline-chip">
                                    <i className={`bi ${selectedClient.est_entreprise ? 'bi-building' : 'bi-person'}`}></i>
                                    {selectedClient.nom_complet || `${selectedClient.nom_client || ''} ${selectedClient.prenom_client || ''}`.trim()}
                                </span>
                            )}
                        </div>
                        <i className={`bi bi-chevron-down nca-chev ${openSections.souscripteur ? 'open' : ''}`}></i>
                    </div>

                    {openSections.souscripteur && (
                        <div className="nca-section-bd">
                            {!selectedClient ? (
                                <div className="nca-client-zone">
                                    {/* Barre de recherche */}
                                    <div className="nca-srch-wrap">
                                        <i className="bi bi-search nca-srch-ico"></i>
                                        <input
                                            type="text"
                                            className="nca-srch-inp"
                                            placeholder="Filtrer par nom, prénom, téléphone..."
                                            value={clientSearch}
                                            onChange={e => setClientSearch(e.target.value)}
                                        />
                                        {clientSearch && (
                                            <button className="nca-srch-cls" onClick={() => setClientSearch('')}>
                                                <i className="bi bi-x"></i>
                                            </button>
                                        )}
                                    </div>

                                    {/* Onglets physique / entreprise */}
                                    <div className="nca-ctabs">
                                        <button
                                            className={`nca-ctab ${clientTab === 'physique' ? 'active' : ''}`}
                                            onClick={() => setClientTab('physique')}
                                        >
                                            <i className="bi bi-person"></i>
                                            Personnes physiques
                                            <span className="nca-cbadge">{filteredClients.physique.length}</span>
                                        </button>
                                        <button
                                            className={`nca-ctab ${clientTab === 'entreprise' ? 'active' : ''}`}
                                            onClick={() => setClientTab('entreprise')}
                                        >
                                            <i className="bi bi-building"></i>
                                            Entreprises
                                            <span className="nca-cbadge">{filteredClients.entreprise.length}</span>
                                        </button>
                                    </div>

                                    {/* Liste clients */}
                                    {loadingClients ? (
                                        <div className="nca-clist-msg">
                                            <i className="bi bi-arrow-repeat nca-spin"></i> Chargement des clients...
                                        </div>
                                    ) : activeClients.length === 0 ? (
                                        <div className="nca-clist-msg">
                                            {clientSearch ? 'Aucun résultat pour cette recherche' : 'Aucun client disponible'}
                                        </div>
                                    ) : (
                                        <div className="nca-clist">
                                            {activeClients.map(c => (
                                                <button
                                                    key={c.id_client || c.ID_Client}
                                                    className="nca-crow"
                                                    onClick={() => selectClient(c)}
                                                >
                                                    <div className="nca-crow-av">
                                                        <i className={`bi ${c.est_entreprise ? 'bi-building' : 'bi-person'}`}></i>
                                                    </div>
                                                    <div className="nca-crow-inf">
                                                        <span className="nca-crow-nm">
                                                            {c.civilite && <em>{c.civilite} </em>}
                                                            {c.nom_complet || `${c.nom_client || ''} ${c.prenom_client || ''}`.trim()}
                                                        </span>
                                                        {(c.telephone || c.Telephone) && (
                                                            <span className="nca-crow-sub">
                                                                <i className="bi bi-telephone"></i> {c.telephone || c.Telephone}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <i className="bi bi-chevron-right nca-crow-arr"></i>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Client sélectionné — chip + détails complets */
                                <div className="nca-sc-selected">
                                    {/* En-tête chip */}
                                    <div className="nca-sc-chip">
                                        <div className="nca-sc-chip-av">
                                            <i className={`bi ${selectedClient.est_entreprise ? 'bi-building' : 'bi-person-circle'}`}></i>
                                        </div>
                                        <div className="nca-sc-chip-inf">
                                            {selectedClient.civilite && (
                                                <span className="nca-qualite">{selectedClient.civilite}</span>
                                            )}
                                            <strong>
                                                {selectedClient.nom_complet ||
                                                    `${selectedClient.nom_client || ''} ${selectedClient.prenom_client || ''}`.trim()}
                                            </strong>
                                            {selectedClient.est_entreprise && (
                                                <span className="nca-tag-ent">Entreprise</span>
                                            )}
                                        </div>
                                        <button className="nca-sc-chip-chg" onClick={() => setSelectedClient(null)}>
                                            <i className="bi bi-arrow-repeat"></i> Changer
                                        </button>
                                    </div>

                                    {/* Détails client */}
                                    {loadingDetail ? (
                                        <div className="nca-detail-loading">
                                            <i className="bi bi-arrow-repeat nca-spin"></i>
                                            Chargement des informations...
                                        </div>
                                    ) : (
                                        <div className="nca-sc-details">
                                            {selectedClient.civilite && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-person-badge"></i> Qualité
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.civilite}</span>
                                                </div>
                                            )}
                                            {(selectedClient.nom_complet || selectedClient.nom_client) && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-person"></i> Nom souscripteur
                                                    </span>
                                                    <span className="nca-sc-info-val">
                                                        {selectedClient.nom_complet || `${selectedClient.nom_client || ''} ${selectedClient.prenom_client || ''}`.trim()}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedClient.telephone && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-telephone-fill"></i> Téléphone
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.telephone}</span>
                                                </div>
                                            )}
                                            {selectedClient.tel_whatsapp && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-whatsapp"></i> WhatsApp
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.tel_whatsapp}</span>
                                                </div>
                                            )}
                                            {selectedClient.email && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-envelope-fill"></i> Email
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.email}</span>
                                                </div>
                                            )}
                                            {selectedClient.nif_client && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-card-text"></i> NIF
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.nif_client}</span>
                                                </div>
                                            )}
                                            {selectedClient.adresse && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-geo-alt-fill"></i> Adresse
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.adresse}</span>
                                                </div>
                                            )}
                                            {selectedClient.profession && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-briefcase-fill"></i> Profession
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.profession}</span>
                                                </div>
                                            )}
                                            {selectedClient.date_naissance && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-calendar3"></i> Date de naissance
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.date_naissance}</span>
                                                </div>
                                            )}
                                            {selectedClient.date_permis_cond && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-card-checklist"></i> Date permis
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.date_permis_cond}</span>
                                                </div>
                                            )}
                                            {selectedClient.fax_client && (
                                                <div className="nca-sc-info">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-printer-fill"></i> Fax
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.fax_client}</span>
                                                </div>
                                            )}
                                            {selectedClient.est_entreprise && selectedClient.representant_entreprise && (
                                                <div className="nca-sc-info nca-sc-info-span">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-person-badge-fill"></i> Représentant
                                                    </span>
                                                    <span className="nca-sc-info-val">
                                                        {selectedClient.representant_entreprise}
                                                        {selectedClient.role_representant && (
                                                            <em className="nca-sc-info-role"> — {selectedClient.role_representant}</em>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedClient.autres_informations && (
                                                <div className="nca-sc-info nca-sc-info-span">
                                                    <span className="nca-sc-info-lbl">
                                                        <i className="bi bi-info-circle-fill"></i> Autres informations
                                                    </span>
                                                    <span className="nca-sc-info-val">{selectedClient.autres_informations}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══ 2. COUVERTURE ═══ */}
                <div className={`nca-section ${openSections.couverture ? 'open' : ''}`}>
                    <div className="nca-section-hd" onClick={() => toggleSection('couverture')}>
                        <div className="nca-section-hd-l">
                            <i className="bi bi-shield-check"></i>
                            <span>Couverture</span>
                        </div>
                        <i className={`bi bi-chevron-down nca-chev ${openSections.couverture ? 'open' : ''}`}></i>
                    </div>

                    {openSections.couverture && (
                        <div className="nca-section-bd">
                            <div className="nca-grid-2">
                                <div className="nca-fg">
                                    <label className="nca-label">Agence</label>
                                    <CustomSelect
                                        name="CodeAgence"
                                        value={formData.CodeAgence}
                                        onChange={handleChange}
                                        placeholder="— Agence —"
                                        options={agences.map(a => ({ value: a.codeagence, label: a.nomagence }))}
                                    />
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">Type de contrat</label>
                                    <div className="nca-toggle-grp">
                                        {['Mono', 'Flotte'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={`nca-toggle-btn ${formData.type_contrat === t ? 'active' : ''}`}
                                                onClick={() => handleTypeContratChange(t)}
                                            >{t}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="nca-fg">
                                    <label className="nca-label">Compagnie <span className="nca-req">*</span></label>
                                    <CustomSelect
                                        name="Id_compagnie"
                                        value={formData.Id_compagnie}
                                        onChange={handleChange}
                                        placeholder="— Sélectionner une compagnie —"
                                        options={compagnies.map(c => ({ value: c.id_compagnie, label: c.nom_compagnie }))}
                                    />
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">Produit <span className="nca-req">*</span></label>
                                    <CustomSelect
                                        name="Id_produit"
                                        value={formData.Id_produit}
                                        onChange={handleChange}
                                        placeholder={formData.Id_compagnie ? '— Sélectionner un produit —' : '— Choisissez d\'abord une compagnie —'}
                                        options={produits.map(p => ({
                                            value: p.id_produit,
                                            label: p.nom_produit || p.lib_produit || p.id_produit,
                                        }))}
                                        disabled={!formData.Id_compagnie}
                                    />
                                </div>

                                <div className="nca-fg nca-span-2">
                                    <label className="nca-label">Nature du contrat</label>
                                    <input
                                        type="text"
                                        className="nca-input"
                                        name="nature_contrat"
                                        value={formData.nature_contrat}
                                        onChange={handleChange}
                                        placeholder="Sans Tacite Reconduction"
                                    />
                                </div>

                                <div className="nca-fg">
                                    <label className="nca-label">Date d'acte</label>
                                    <input type="date" className="nca-input" name="date_acte" value={formData.date_acte} onChange={handleChange} />
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">Date d'effet <span className="nca-req">*</span></label>
                                    <input type="date" className="nca-input" name="date_effet" value={formData.date_effet} onChange={handleChange} />
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">Durée (mois)</label>
                                    <input type="number" className="nca-input" name="duree_contrat" value={formData.duree_contrat} onChange={handleChange} min="1" max="120" />
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">Date d'échéance</label>
                                    <input type="date" className="nca-input nca-input-ro" value={formData.Date_echeance} readOnly />
                                </div>

                                <div className="nca-fg">
                                    <label className="nca-label">Fractionnement</label>
                                    <div className={`nca-fract-badge ${fract.cls}`}>
                                        <span className="nca-fract-pct">{fract.pct}%</span>
                                    </div>
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">N° Police</label>
                                    <div className="nca-police-note">
                                        <i className="bi bi-lock"></i>
                                        Généré automatiquement lors du passage en contrat
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ 3. APPORTEUR ═══ */}
                <div className={`nca-section ${openSections.apporteur ? 'open' : ''}`}>
                    <div className="nca-section-hd" onClick={() => toggleSection('apporteur')}>
                        <div className="nca-section-hd-l">
                            <i className="bi bi-people-fill"></i>
                            <span>Apporteur d'affaire</span>
                        </div>
                        <i className={`bi bi-chevron-down nca-chev ${openSections.apporteur ? 'open' : ''}`}></i>
                    </div>

                    {openSections.apporteur && (
                        <div className="nca-section-bd">
                            <div className="nca-grid-3">
                                <div className="nca-fg">
                                    <label className="nca-label">Apporteur</label>
                                    <CustomSelect
                                        name="code_apporteur"
                                        value={formData.code_apporteur}
                                        onChange={handleChange}
                                        placeholder="— Aucun —"
                                        options={apporteurs.map(a => ({
                                            value: a.code_apporteur || a.id,
                                            label: a.nom_apporteur || a.nom || a.code_apporteur,
                                        }))}
                                    />
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">Taux commission (%)</label>
                                    <input type="number" className="nca-input" name="taux_com_apporteur" value={formData.taux_com_apporteur} onChange={handleChange} min="0" max="100" step="0.5" />
                                </div>
                                <div className="nca-fg">
                                    <label className="nca-label">Commission courtier</label>
                                    <input type="number" className="nca-input" name="commission_courtier" value={formData.commission_courtier} onChange={handleChange} min="0" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ 4. VÉHICULES ═══ */}
                <div className={`nca-section ${openSections.vehicules ? 'open' : ''}`}>
                    <div className="nca-section-hd" onClick={() => toggleSection('vehicules')}>
                        <div className="nca-section-hd-l">
                            <i className="bi bi-car-front-fill"></i>
                            <span>Désignation des véhicules</span>
                            <span className="nca-count-chip">
                                {vehicules.length} véhicule{vehicules.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="nca-section-hd-r">
                            {/* Input fichier Excel caché */}
                            <input
                                ref={excelInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                style={{ display: 'none' }}
                                onChange={handleImportExcel}
                            />
                            <button
                                className="nca-btn-excel-import"
                                onClick={e => {
                                    e.stopPropagation();
                                    excelInputRef.current?.click();
                                }}
                                disabled={importLoading}
                                title="Importer des véhicules depuis un fichier Excel"
                            >
                                {importLoading
                                    ? <><span className="nca-calc-spinner"></span> Import…</>
                                    : <><i className="bi bi-file-earmark-excel-fill"></i> Importer Excel</>
                                }
                            </button>
                            <button
                                className="nca-btn-import-veh"
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowVehiclePicker(true);
                                }}
                                title="Sélectionner des véhicules depuis la liste"
                            >
                                <i className="bi bi-collection-fill"></i> Listes des véhicules
                            </button>
                            <button
                                className="nca-btn-add-veh"
                                onClick={e => {
                                    e.stopPropagation();
                                    setOpenSections(p => ({ ...p, vehicules: true }));
                                    addVehicle();
                                }}
                                disabled={formData.type_contrat === 'Mono' && vehicules.length >= 1}
                                title={formData.type_contrat === 'Mono' && vehicules.length >= 1 ? 'Mode Mono : un seul véhicule autorisé' : undefined}
                            >
                                <i className="bi bi-plus-lg"></i> Nouveau véhicule
                            </button>
                            <i
                                className={`bi bi-chevron-down nca-chev ${openSections.vehicules ? 'open' : ''}`}
                                onClick={e => { e.stopPropagation(); toggleSection('vehicules'); }}
                            ></i>
                        </div>
                    </div>

                    {/* Résultat de l'import Excel */}
                    {importResult && (
                        <div className={`nca-import-result ${importResult.error ? 'nca-import-result--err' : 'nca-import-result--ok'}`}>
                            {importResult.error ? (
                                <><i className="bi bi-exclamation-triangle-fill"></i> {importResult.error}</>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle-fill"></i>
                                    {importResult.created?.length > 0 && (
                                        <span><strong>{importResult.created.length}</strong> véhicule{importResult.created.length > 1 ? 's' : ''} ajouté{importResult.created.length > 1 ? 's' : ''}</span>
                                    )}
                                    {importResult.skipped?.length > 0 && (
                                        <span> · <strong>{importResult.skipped.length}</strong> déjà existant{importResult.skipped.length > 1 ? 's' : ''} (ignoré{importResult.skipped.length > 1 ? 's' : ''})</span>
                                    )}
                                    {importResult.created?.length === 0 && importResult.skipped?.length === 0 && (
                                        <span>Aucun véhicule importé (fichier vide ou toutes immatriculations déjà présentes)</span>
                                    )}
                                </>
                            )}
                            <button className="nca-import-result-cls" onClick={() => setImportResult(null)}>
                                <i className="bi bi-x"></i>
                            </button>
                        </div>
                    )}

                    {openSections.vehicules && (
                        <div className="nca-section-bd nca-section-bd-veh">
                            {vehicules.length === 0 ? (
                                <div className="nca-veh-empty">
                                    <i className="bi bi-car-front-fill"></i>
                                    <p>Aucun véhicule. Cliquez sur « Nouveau véhicule » pour commencer.</p>
                                </div>
                            ) : (
                                <div className="nca-veh-table-wrap">
                                    {/* ── Tableau récapitulatif ── */}
                                    {/* Légende colonne Garanties (visible après calcul) */}
                                    {vehicules.some(v => v.garanties.some(g => g.prime_annuelle !== '')) && (
                                        <div className="nca-veh-gar-hint">
                                            <i className="bi bi-info-circle"></i>
                                            Cochez un véhicule pour voir ses garanties individuelles — sans sélection, le total s'affiche.
                                            {selectedVehiculeIdx !== null && (
                                                <button className="nca-veh-gar-reset" onClick={() => setSelectedVehiculeIdx(null)}>
                                                    <i className="bi bi-x-circle"></i> Revenir au total
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <table className="nca-veh-table">
                                        <thead>
                                            <tr>
                                                <th className="nca-veh-th-gar" title="Sélectionner pour voir les garanties">
                                                    {vehicules.some(v => v.garanties.some(g => g.prime_annuelle !== '')) ? (
                                                        <i className="bi bi-shield-check" title="Garanties"></i>
                                                    ) : ''}
                                                </th>
                                                <th className="nca-veh-th-idx">#</th>
                                                <th className="nca-veh-th-immat">Immatriculation</th>
                                                <th className="nca-veh-th-chassis">N° Châssis</th>
                                                <th className="nca-veh-th-marque">Marque / Modèle</th>
                                                <th className="nca-veh-th-cat">Cat.</th>
                                                <th className="nca-veh-th-energie">Énergie</th>
                                                <th className="nca-veh-th-num">PF</th>
                                                <th className="nca-veh-th-num">VV (F)</th>
                                                <th className="nca-veh-th-num">VN (F)</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehicules.map((v, vIdx) => {
                                                const calculEffectue = v.garanties.some(g => g.prime_annuelle !== '');
                                                return (
                                                <tr
                                                    key={v._id}
                                                    className={`${editingVehicleIdx === vIdx ? 'nca-veh-row-active' : ''} ${selectedVehiculeIdx === vIdx ? 'nca-veh-row-selected' : ''}`}
                                                >
                                                    <td className="nca-veh-td-gar">
                                                        {calculEffectue && (
                                                            <input
                                                                type="checkbox"
                                                                className="nca-veh-gar-cb"
                                                                checked={selectedVehiculeIdx === vIdx}
                                                                onChange={() => setSelectedVehiculeIdx(prev => prev === vIdx ? null : vIdx)}
                                                                title="Voir les garanties de ce véhicule"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="nca-veh-th-idx">{vIdx + 1}</td>
                                                    <td className="nca-veh-td-immat">{v.veh_immat || <span className="nca-veh-empty-cell">—</span>}</td>
                                                    <td className="nca-veh-td-chassis">{v.veh_chassis || <span className="nca-veh-empty-cell">—</span>}</td>
                                                    <td className="nca-veh-td-marque">
                                                        {v.veh_marque || v.veh_modele
                                                            ? <>{v.veh_marque && <strong>{v.veh_marque}</strong>}{v.veh_marque && v.veh_modele && ' '}{v.veh_modele}</>
                                                            : <span className="nca-veh-empty-cell">—</span>
                                                        }
                                                    </td>
                                                    <td>{v.veh_cat || <span className="nca-veh-empty-cell">—</span>}</td>
                                                    <td>{v.veh_energie || <span className="nca-veh-empty-cell">—</span>}</td>
                                                    <td className="nca-veh-td-num">{v.veh_puissance_fiscale || <span className="nca-veh-empty-cell">—</span>}</td>
                                                    <td className="nca-veh-td-num">{v.veh_valeur_venale ? fmtNum(v.veh_valeur_venale) : <span className="nca-veh-empty-cell">—</span>}</td>
                                                    <td className="nca-veh-td-num">{v.veh_valeur_neuve ? fmtNum(v.veh_valeur_neuve) : <span className="nca-veh-empty-cell">—</span>}</td>
                                                    <td className="nca-veh-td-actions">
                                                        <button
                                                            type="button"
                                                            className={`nca-veh-btn-edit ${editingVehicleIdx === vIdx ? 'active' : ''}`}
                                                            onClick={() => setEditingVehicleIdx(editingVehicleIdx === vIdx ? null : vIdx)}
                                                            title={editingVehicleIdx === vIdx ? 'Fermer' : 'Modifier ce véhicule'}
                                                        >
                                                            <i className={`bi ${editingVehicleIdx === vIdx ? 'bi-chevron-up' : 'bi-pencil-fill'}`}></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="nca-veh-btn-del"
                                                            onClick={() => removeVehicle(vIdx)}
                                                            title="Retirer ce véhicule"
                                                        >
                                                            <i className="bi bi-trash3"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* ── Panneau d'édition inline ── */}
                                    {editingVehicleIdx !== null && vehicules[editingVehicleIdx] && (() => {
                                        const v = vehicules[editingVehicleIdx];
                                        const vIdx = editingVehicleIdx;
                                        return (
                                            <div className="nca-veh-edit-panel">
                                                <div className="nca-veh-edit-hd">
                                                    <span>
                                                        <i className="bi bi-pencil-fill"></i>
                                                        Véhicule {vIdx + 1}
                                                        {v.veh_immat && <em> — {v.veh_immat}</em>}
                                                    </span>
                                                    <button className="nca-veh-edit-close" onClick={() => setEditingVehicleIdx(null)}>
                                                        <i className="bi bi-x-lg"></i> Fermer
                                                    </button>
                                                </div>
                                                <div className="nca-grid-4 nca-veh-fields">
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Immatriculation</label>
                                                        <input type="text" className="nca-input" value={v.veh_immat} onChange={e => handleVehicleChange(vIdx, 'veh_immat', e.target.value.toUpperCase())} placeholder="AB 1234 CD" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Marque</label>
                                                        <input type="text" className="nca-input" value={v.veh_marque} onChange={e => handleVehicleChange(vIdx, 'veh_marque', e.target.value)} placeholder="Toyota" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Modèle</label>
                                                        <input type="text" className="nca-input" value={v.veh_modele} onChange={e => handleVehicleChange(vIdx, 'veh_modele', e.target.value)} placeholder="Corolla" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">N° Châssis</label>
                                                        <input type="text" className="nca-input" value={v.veh_chassis} onChange={e => handleVehicleChange(vIdx, 'veh_chassis', e.target.value)} placeholder="VIN" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Catégorie</label>
                                                        <CustomSelect
                                                            name={`cat_${vIdx}`}
                                                            value={v.veh_cat}
                                                            onChange={e => handleVehicleChange(vIdx, 'veh_cat', e.target.value)}
                                                            placeholder="— Catégorie —"
                                                            options={categories.map(c => ({
                                                                value: c.code_cat || c.id,
                                                                label: c.lib_categorie || c.nom || c.code_cat,
                                                            }))}
                                                        />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Nb. Places</label>
                                                        <input type="number" className="nca-input" value={v.veh_nbplace} onChange={e => handleVehicleChange(vIdx, 'veh_nbplace', e.target.value)} placeholder="5" min="1" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Énergie</label>
                                                        <CustomSelect name={`ener_${vIdx}`} value={v.veh_energie} onChange={e => handleVehicleChange(vIdx, 'veh_energie', e.target.value)} placeholder="— Énergie —" options={energieOptions} searchable={false} />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Usage</label>
                                                        <CustomSelect name={`usage_${vIdx}`} value={v.veh_usage} onChange={e => handleVehicleChange(vIdx, 'veh_usage', e.target.value)} placeholder="— Usage —" options={usageOptions} searchable={false} />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Puissance fiscale (CV)</label>
                                                        <input type="number" className="nca-input" value={v.veh_puissance} onChange={e => handleVehicleChange(vIdx, 'veh_puissance', e.target.value)} placeholder="0" min="0" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Valeur vénale (FCFA)</label>
                                                        <input type="number" className="nca-input" value={v.veh_valeur_venale} onChange={e => handleVehicleChange(vIdx, 'veh_valeur_venale', e.target.value)} placeholder="0" min="0" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Valeur neuve (FCFA)</label>
                                                        <input type="number" className="nca-input" value={v.veh_valeur_neuve} onChange={e => handleVehicleChange(vIdx, 'veh_valeur_neuve', e.target.value)} placeholder="0" min="0" />
                                                    </div>
                                                    <div className="nca-fg">
                                                        <label className="nca-label">Nb. remorques</label>
                                                        <input type="number" className="nca-input" value={v.veh_nbremorque} onChange={e => handleVehicleChange(vIdx, 'veh_nbremorque', e.target.value)} placeholder="0" min="0" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══ 5. GARANTIES ═══ */}
                <div className={`nca-section ${openSections.garanties ? 'open' : ''}`}>
                    <div className="nca-section-hd" onClick={() => toggleSection('garanties')}>
                        <div className="nca-section-hd-l">
                            <i className="bi bi-shield-check-fill"></i>
                            <span>Garanties</span>
                            {garantiesTemplate.length > 0 && (
                                <span className="nca-count-chip">
                                    {garantiesTemplate.length} garantie{garantiesTemplate.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <i className={`bi bi-chevron-down nca-chev ${openSections.garanties ? 'open' : ''}`}></i>
                    </div>

                    {openSections.garanties && (
                        <div className="nca-section-bd">
                            {!formData.Id_produit ? (
                                <div className="nca-gar-hint">
                                    <i className="bi bi-exclamation-circle"></i>
                                    Sélectionnez une compagnie et un produit pour afficher les garanties disponibles
                                </div>
                            ) : garantiesTemplate.length === 0 ? (
                                <div className="nca-gar-hint">
                                    <i className="bi bi-info-circle"></i>
                                    Aucune garantie configurée pour ce produit
                                </div>
                            ) : (
                                <>
                                    <div className="nca-gar-table-wrap">
                                        <table className="nca-gar-table">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Garantie</th>
                                                    <th>Capital</th>
                                                    <th>Franchise</th>
                                                    <th>
                                                        Prime Annuelle
                                                        {selectedVehiculeIdx === null && vehicules.length > 1 && (
                                                            <span className="nca-gar-th-hint"> (total)</span>
                                                        )}
                                                    </th>
                                                    <th>Prime ({fract.pct}%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {garantiesAffichees.map((row, gIdx) => (
                                                    <tr key={gIdx} className={!row.selected ? 'nca-gar-disabled' : ''}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={row.selected}
                                                                disabled={row.est_obligatoire}
                                                                title={row.est_obligatoire ? 'Garantie obligatoire' : ''}
                                                                onChange={() => toggleGarantieRow(gIdx)}
                                                            />
                                                        </td>
                                                        <td className="nca-gar-nom">
                                                            {row.nom}
                                                            {row.est_obligatoire && (
                                                                <span className="nca-gar-oblig">Oblig.</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <input type="number" className="nca-gar-input" value={row.capital} disabled={!row.selected} placeholder="0" onChange={e => updateGarantieRow(gIdx, 'capital', e.target.value)} />
                                                        </td>
                                                        <td>
                                                            <input type="number" className="nca-gar-input" value={row.franchise} disabled={!row.selected} placeholder="0" onChange={e => updateGarantieRow(gIdx, 'franchise', e.target.value)} />
                                                        </td>
                                                        <td>
                                                            <input type="number" className="nca-gar-input" value={row.prime_annuelle} disabled={!row.selected} placeholder="0" onChange={e => updateGarantieRow(gIdx, 'prime_annuelle', e.target.value)} />
                                                        </td>
                                                        <td className="nca-gar-periode">
                                                            {row.selected
                                                                ? fmtNum(Math.round((parseFloat(row.prime_annuelle) || 0) * fract.taux))
                                                                : '—'
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="nca-gar-footer">
                                        {calcMsg && (
                                            <div className={`nca-calc-alert nca-calc-alert--${calcMsg.type}`}>
                                                <i className={`bi ${calcMsg.type === 'ok' ? 'bi-check-circle-fill' : calcMsg.type === 'err' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`}></i>
                                                {calcMsg.text}
                                            </div>
                                        )}
                                        <button
                                            className="nca-gar-save-btn"
                                            onClick={calculerPrimeDepuisGaranties}
                                            disabled={calcLoading}
                                        >
                                            {calcLoading
                                                ? <><span className="nca-calc-spinner"></span> Calcul en cours…</>
                                                : <><i className="bi bi-calculator"></i> Calculer la prime depuis les garanties</>
                                            }
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══ 5. RÉDUCTIONS ═══ */}
                <div className={`nca-section ${openSections.reductions ? 'open' : ''}`}>
                    <div className="nca-section-hd" onClick={() => toggleSection('reductions')}>
                        <div className="nca-section-hd-l">
                            <i className="bi bi-tag-fill"></i>
                            <span>Réductions</span>
                            {formData.montant_reductions > 0 && (
                                <span className="nca-count-chip">
                                    -{fmtNum(formData.montant_reductions)} F
                                </span>
                            )}
                        </div>
                        <i className={`bi bi-chevron-down nca-chev ${openSections.reductions ? 'open' : ''}`}></i>
                    </div>

                    {openSections.reductions && (
                        <div className="nca-section-bd">
                            {/* §11.2 — Notice flotte si des taux ont été pré-calculés */}
                            {formData.type_contrat === 'Flotte' && vehicules.length > 0 && (
                                <div className="nca-calc-alert nca-calc-alert--ok" style={{ marginBottom: 10 }}>
                                    <i className="bi bi-calculator"></i>
                                    Réductions flotte pré-calculées pour <strong>{vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''}</strong> — taux modifiables.
                                </div>
                            )}
                            <table className="nca-red-table">
                                <thead>
                                    <tr>
                                        <th>Réduction</th>
                                        <th style={{ width: 130 }}>Taux (%)</th>
                                        <th style={{ width: 160 }}>Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reductions.map((r) => {
                                        const montant = Math.round((parseFloat(formData.prime_nette_brute) || 0) * (parseFloat(r.taux) || 0) / 100);
                                        return (
                                            <tr key={r.key}>
                                                <td className="nca-red-label">{r.label}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="nca-input"
                                                        value={r.taux}
                                                        onChange={e => handleReductionChange(r.key, e.target.value)}
                                                        min="0"
                                                        max="100"
                                                        step="0.5"
                                                    />
                                                </td>
                                                <td className="nca-red-mont">{fmtNum(montant)} F</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="nca-red-footer">
                                <span className="nca-red-total">
                                    Total : <strong>{fmtNum(formData.montant_reductions)} F</strong>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ 6. SYNTHÈSE FINANCIÈRE ═══ */}
                <div className={`nca-section ${openSections.synthese ? 'open' : ''}`}>
                    <div className="nca-section-hd" onClick={() => toggleSection('synthese')}>
                        <div className="nca-section-hd-l">
                            <i className="bi bi-cash-coin"></i>
                            <span>Synthèse financière</span>
                        </div>
                        <i className={`bi bi-chevron-down nca-chev ${openSections.synthese ? 'open' : ''}`}></i>
                    </div>

                    {openSections.synthese && (
                        <div className="nca-section-bd">
                            <div className="nca-synth-grid">
                                {/* Gauche : calcul prime */}
                                <div className="nca-synth-col">
                                    <div className="nca-fg">
                                        <label className="nca-label">Prime nette brute (FCFA)</label>
                                        <input type="number" className="nca-input" name="prime_nette_brute" value={formData.prime_nette_brute} onChange={handleChange} min="0" />
                                    </div>
                                    <div className="nca-synth-line">
                                        <span className="nca-synth-lbl">— Montant réductions</span>
                                        <span className="nca-synth-val">{fmtNum(formData.montant_reductions)} F</span>
                                    </div>
                                    <div className="nca-synth-sep"></div>
                                    <div className="nca-synth-line nca-synth-result">
                                        <span className="nca-synth-lbl">= Prime nette réduite</span>
                                        <span className="nca-synth-val nca-synth-hl">{fmtNum(formData.prime_net_red)} F</span>
                                    </div>
                                </div>

                                {/* Droite : frais & taxes */}
                                <div className="nca-synth-col">
                                    <p className="nca-frais-title">Frais &amp; taxes</p>
                                    <div className="nca-grid-3">
                                        {/* Accessoires — §13 auto-lookup FRAIS_ACCESSOIRE, saisie modifiable */}
                                        <div className="nca-fg">
                                            <label className="nca-label">Accessoires</label>
                                            <input type="number" className="nca-input" name="accessoires" value={formData.accessoires} onChange={e => { setAccessoireAutoMsg(null); handleChange(e); }} min="0" />
                                            {accessoireAutoMsg && (
                                                <div className="nca-acc-auto-hint">
                                                    <i className="bi bi-table"></i> {accessoireAutoMsg}
                                                </div>
                                            )}
                                        </div>
                                        {/* Taxe (taux) — auto depuis produit, modifiable (valeur décimale ex: 0.08 = 8%) */}
                                        <div className="nca-fg">
                                            <label className="nca-label">Taxe (taux) : {(tauxTaxe * 100).toFixed(2)} %</label>
                                            <input
                                                type="number"
                                                className="nca-input"
                                                value={tauxTaxe}
                                                onChange={e => setTauxTaxe(parseFloat(e.target.value) || 0)}
                                                min="0"
                                                max="1"
                                                step="0.0001"
                                            />
                                        </div>
                                        {/* Taxe — calculée automatiquement */}
                                        <div className="nca-fg">
                                            <label className="nca-label">Taxe</label>
                                            <input type="number" className="nca-input nca-input-calc" value={formData.taxe} readOnly tabIndex={-1} />
                                        </div>
                                        {/* TSVL — saisie libre */}
                                        <div className="nca-fg">
                                            <label className="nca-label">TSVL</label>
                                            <input type="number" className="nca-input" name="TSVL" value={formData.TSVL} onChange={handleChange} min="0" />
                                        </div>
                                        {/* CSS — calculée automatiquement (1%) */}
                                        <div className="nca-fg">
                                            <label className="nca-label">CSS</label>
                                            <input type="number" className="nca-input nca-input-calc" value={formData.CSS} readOnly tabIndex={-1} />
                                        </div>
                                        {/* CEMAC — depuis info_societe */}
                                        <div className="nca-fg">
                                            <label className="nca-label">CEMAC</label>
                                            <input type="number" className="nca-input nca-input-calc" value={formData.CEMAC} readOnly tabIndex={-1} />
                                        </div>
                                        {/* CCA — depuis info_societe */}
                                        <div className="nca-fg">
                                            <label className="nca-label">CCA</label>
                                            <input type="number" className="nca-input nca-input-calc" value={formData.CCA} readOnly tabIndex={-1} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Prime TTC */}
                            <div className="nca-prime-ttc">
                                <div className="nca-ptc-inner">
                                    <span className="nca-ptc-label">PRIME TTC (Total)</span>
                                    <span className="nca-ptc-val">{fmtNum(formData.prime_totale)} F CFA</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* ══ FOOTER ══ */}
            <div className="nca-footer">
                <button className="nca-footer-btn nca-footer-cancel" onClick={() => navigate('/contrats/auto')} disabled={saving}>
                    <i className="bi bi-x-circle"></i>
                    <span>Annuler</span>
                </button>

                <div className="nca-footer-mid">
                    {saveError && (
                        <span className="nca-footer-err">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            {saveError}
                        </span>
                    )}
                    {!saveError && saveSuccess && (
                        <span className="nca-footer-success">
                            <i className="bi bi-check-circle-fill"></i>
                            {saveSuccess}
                        </span>
                    )}
                </div>

                <div className="nca-footer-right">
                    <div className="nca-footer-total">
                        <span className="nca-footer-total-lbl">Prime TTC</span>
                        <span className="nca-footer-total-val">{fmtNum(formData.prime_totale)} F</span>
                    </div>

                    <div className="nca-footer-divider"></div>

                    <button className="nca-footer-btn nca-footer-projet" onClick={() => handleSave(true)} disabled={saving}>
                        {saveMode === 'projet'
                            ? <><i className="bi bi-arrow-repeat nca-spin"></i><span>Enregistrement...</span></>
                            : <><i className="bi bi-floppy2-fill"></i><span>Enreg. Projet</span></>
                        }
                    </button>

                    <button className="nca-footer-btn nca-footer-valider" onClick={() => handleSave(false)} disabled={saving}>
                        {saveMode === 'contrat'
                            ? <><i className="bi bi-arrow-repeat nca-spin"></i><span>Enregistrement...</span></>
                            : <><i className="bi bi-check-circle-fill"></i><span>Valider le contrat</span></>
                        }
                    </button>
                </div>
            </div>

            {/* ═══ MODALE SÉLECTION VÉHICULES ═══ */}
            <RisquePickerModal
                open={showVehiclePicker}
                onClose={() => setShowVehiclePicker(false)}
                onConfirm={addRisquesAsVehicles}
            />
        </div>
    );
};

export default NouveauContratAuto;
