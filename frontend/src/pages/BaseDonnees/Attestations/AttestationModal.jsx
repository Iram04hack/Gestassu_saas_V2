import React, { useState, useEffect } from 'react';
import AttestationsService from '../../../services/attestationsService';
import CompagniesService from '../../../services/compagnies';
import { getAgences } from '../../../services/contrats';

const AttestationModal = ({ isOpen, onClose, onSuccess, attestation, currentUser }) => {
    const [compagnies, setCompagnies] = useState([]);
    const [agences, setAgences] = useState([]);
    const [formData, setFormData] = useState({
        type_attestation: '653', // Par défaut Rose
        num_min: '',
        num_max: '',
        id_compagnie: '',
        CodeAgence: '',
        ref_lot: '',
        Remarque_attestation: ''
    });
    const [generatedAttestations, setGeneratedAttestations] = useState([]);
    const [autoGenerate, setAutoGenerate] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCompagnies();
        fetchAgences();
    }, []);

    useEffect(() => {
        if (attestation) {
            setFormData({
                type_attestation: attestation.type_attestation || '',
                num_min: parseInt(attestation.Num_attestation) || 0,
                num_max: parseInt(attestation.Num_attestation) || 0,
                id_compagnie: attestation.id_compagnie || '',
                CodeAgence: attestation.CodeAgence || '',
                ref_lot: attestation.ref_lot || '',
                Remarque_attestation: attestation.Remarque_attestation || ''
            });
        }
    }, [attestation]);

    const fetchCompagnies = async () => {
        try {
            const data = await CompagniesService.getCompagnies();
            // Le service retourne déjà response.data, donc 'data' est le corps de la réponse
            setCompagnies(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Erreur lors du chargement des compagnies", error);
        }
    };

    const fetchAgences = async () => {
        try {
            const data = await getAgences();
            setAgences(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Erreur lors du chargement des agences", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? '' : parseInt(value)
        }));
    };

    const calculateNbrAttestation = () => {
        if (formData.num_max >= formData.num_min && formData.num_min > 0) {
            return formData.num_max - formData.num_min + 1;
        }
        return 0;
    };

    const handleGeneratePreview = () => {
        const min = parseInt(formData.num_min);
        const max = parseInt(formData.num_max);

        // Validation relaxée : seuls les numéros sont requis pour la prévisualisation
        if (isNaN(min) || isNaN(max) || max < min || min <= 0) {
            alert("Veuillez saisir une plage de numéros valide (Numéro Min < Numéro Max)");
            return;
        }

        const count = max - min + 1;
        if (count > 1000) {
            if (!window.confirm(`Vous allez générer ${count} attestations. Continuer ?`)) return;
        }

        const preview = [];
        const displayCount = Math.min(count, 100);

        for (let i = 0; i < displayCount; i++) {
            const num = min + i;
            preview.push({
                Num_attestation: num,
                type_attestation: formData.type_attestation,
                Etat_attestation: 0,
                date_enreg: new Date().toISOString(),
                Remarque_attestation: formData.Remarque_attestation
            });
        }

        setGeneratedAttestations(preview);
        setAutoGenerate(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation stricte lors de l'enregistrement
        if (!formData.type_attestation || !formData.id_compagnie || !formData.ref_lot) {
            alert("Veuillez remplir tous les champs obligatoires (Type, Compagnie, Lot) avant d'enregistrer.");
            return;
        }
        try {
            setLoading(true);
            if (attestation) {
                const dataToSend = {
                    type_attestation: formData.type_attestation,
                    Num_attestation: formData.num_min, // On utilise num_min pour l'édition individuelle
                    id_compagnie: formData.id_compagnie,
                    CodeAgence: formData.CodeAgence,
                    ref_lot: formData.ref_lot,
                    Remarque_attestation: formData.Remarque_attestation,
                    IDUTILISATEUR_save: currentUser?.idutilisateur || currentUser?.id || ''
                };

                await AttestationsService.update(attestation.id_attestation, dataToSend);
                alert("Attestation mise à jour avec succès");
                onSuccess();
                onClose();
            } else {
                const dataToSend = {
                    ...formData,
                    IDUTILISATEUR_save: currentUser?.idutilisateur || currentUser?.id || ''
                };

                const response = await AttestationsService.bulkCreate(dataToSend);
                alert(response.data.message || "Attestations créées avec succès");
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement", error);
            alert("Erreur lors de l'enregistrement. Vérifiez les doublons ou la connexion.");
        } finally {
            setLoading(false);
        }
    };
    const handleClearPreview = () => {
        setGeneratedAttestations([]);
        setAutoGenerate(false);
    };

    if (!isOpen) return null;



    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content modal-large animate-slide-up" style={{ maxWidth: '1000px', width: '95%' }}>
                <div className="modal-header">
                    <h2>Fiche attestation</h2>
                    <button className="close-btn" onClick={onClose} title="Fermer">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="attestation-modal-grid">
                    {/* Colonne de Gauche : Formulaire */}
                    <div className="form-left-col">
                        <div className="form-section-title">Paramètres</div>
                        <div className="form-group mb-3">
                            <label>Type d'attestation</label>
                            <select
                                name="type_attestation"
                                value={formData.type_attestation}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="653">Attestation rose (653)</option>
                                <option value="652">Attestation jaune (652)</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Numéro Min</label>
                                <input
                                    type="number" name="num_min"
                                    value={formData.num_min} onChange={handleNumberChange}
                                    className="form-control" placeholder="Début"
                                />
                            </div>
                            <div className="form-group">
                                <label>Numéro Max</label>
                                <input
                                    type="number" name="num_max"
                                    value={formData.num_max} onChange={handleNumberChange}
                                    className="form-control" placeholder="Fin"
                                />
                            </div>
                        </div>

                        <div className="form-section-title mt-4">Affectation</div>
                        <div className="form-group mb-3">
                            <label>Compagnie</label>
                            <select
                                name="id_compagnie" value={formData.id_compagnie}
                                onChange={handleChange} className="form-control"
                            >
                                <option value="">Sélectionner une compagnie...</option>
                                {compagnies.map(c => (
                                    <option key={c.id_compagnie} value={c.id_compagnie}>
                                        {c.nom_compagnie || c.nomCompagnie || "Nom inconnu"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group mb-3">
                            <label>Agence</label>
                            <select
                                name="CodeAgence" value={formData.CodeAgence}
                                onChange={handleChange} className="form-control"
                            >
                                <option value="">Sélectionner une agence...</option>
                                {agences.map(a => (
                                    <option key={a.CodeAgence || a.codeagence} value={a.CodeAgence || a.codeagence}>
                                        {a.nom_agence || a.nomagence || "Nom inconnu"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group mb-3">
                            <label>Ref. Lot</label>
                            <input
                                type="text" name="ref_lot"
                                value={formData.ref_lot} onChange={handleChange}
                                className="form-control" placeholder="Ex: LOT-2026-Fev"
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label>Remarque</label>
                            <textarea
                                name="Remarque_attestation"
                                value={formData.Remarque_attestation} onChange={handleChange}
                                className="form-control" rows="3" placeholder="Optionnel..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Colonne de Droite : Aperçu / Tableau */}
                    <div className="preview-right-col">
                        <div className="preview-header">
                            <div className="preview-title" onClick={handleGeneratePreview}>
                                <i className="bi bi-arrow-clockwise"></i>
                                <span>Générer les numéros d'attestation automatiquement</span>
                            </div>
                            <button type="button" className="btn-clear-all" onClick={handleClearPreview}>
                                Tout effacer
                            </button>
                        </div>

                        <div className="preview-table-wrapper">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>N° Attestation</th>
                                        <th>Type attestation</th>
                                        <th>État</th>
                                        <th>Date enregistrement</th>
                                        <th>Remarque</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generatedAttestations.length > 0 ? (
                                        generatedAttestations.map((att, idx) => (
                                            <tr key={idx}>
                                                <td>{att.Num_attestation}</td>
                                                <td>
                                                    <span className={`att-type-badge ${att.type_attestation === '653' ? 'rose' : 'jaune'}`}>
                                                        {att.type_attestation === '653' ? 'Rose' : 'Jaune'}
                                                    </span>
                                                </td>
                                                <td><span className="status-badge-mini">Neutre</span></td>
                                                <td>{new Date(att.date_enreg).toLocaleDateString()}</td>
                                                <td>{att.Remarque_attestation || "-"}</td>
                                                <td><i className="bi bi-file-earmark-text btn-file-icon"></i></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                Cliquez sur "Générer" pour voir l'aperçu des attestations.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="modal-footer compact">
                    <button type="button" className="btn-premium cancel" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="btn-premium submit"
                        onClick={handleSubmit}
                        disabled={loading || generatedAttestations.length === 0}
                    >
                        {loading ? <i className="bi bi-arrow-repeat spin"></i> : <i className="bi bi-check-lg"></i>}
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttestationModal;
