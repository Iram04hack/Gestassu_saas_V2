import React, { useState, useEffect, useRef } from 'react';
import CoreService from '../../services/core';

const INITIAL_FORM = {
    raisonsocial: '',
    adressesociete: '',
    telsociete: '',
    emailsociete: '',
    logosociete: '',
    bp_courtier: '',
    fax_courtier: '',
    basdepage: '',
    param_CEMAC: '',
    param_CCA: '',
};

const InfoItem = ({ label, value, fullWidth }) => (
    <div className={`societe-info-item${fullWidth ? ' full-width' : ''}`}>
        <label>{label}</label>
        <div className="societe-info-value">
            {value || <span className="societe-info-empty">—</span>}
        </div>
    </div>
);

const SocieteForm = () => {
    const [data, setData] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => { loadSociete(); }, []);

    const loadSociete = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await CoreService.getInfoSociete();
            if (result) {
                setData(result);
                setIsNew(false);
            } else {
                setData(null);
                setIsNew(true);
            }
        } catch (err) {
            setError('Impossible de charger les informations société.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        const src = data || {};
        setFormData({
            raisonsocial: src.raisonsocial || '',
            adressesociete: src.adressesociete || '',
            telsociete: src.telsociete || '',
            emailsociete: src.emailsociete || '',
            logosociete: src.logosociete || '',
            bp_courtier: src.bp_courtier || '',
            fax_courtier: src.fax_courtier || '',
            basdepage: src.basdepage || '',
            param_CEMAC: src.param_CEMAC ?? '',
            param_CCA: src.param_CCA ?? '',
        });
        setSaveError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setSaveError(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFormData(prev => ({ ...prev, logosociete: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!formData.raisonsocial.trim()) { setSaveError('La raison sociale est obligatoire.'); return; }
        try {
            setSaving(true);
            setSaveError(null);
            const payload = {
                ...formData,
                param_CEMAC: formData.param_CEMAC === '' ? null : Number(formData.param_CEMAC),
                param_CCA: formData.param_CCA === '' ? null : Number(formData.param_CCA),
            };
            if (isNew) {
                await CoreService.createInfoSociete(payload);
                setIsNew(false);
            } else {
                await CoreService.updateInfoSociete(data.raisonsocial, payload);
            }
            await loadSociete();
            setIsModalOpen(false);
            setSuccess('Informations enregistrées avec succès.');
            setTimeout(() => setSuccess(null), 4000);
        } catch (err) {
            const msg = err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Erreur lors de l\'enregistrement.';
            setSaveError(msg);
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#8d6e63' }}>
                <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                <p>Chargement des informations société...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#d32f2f' }}>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                <p>{error}</p>
                <button className="btn-societe-save" onClick={loadSociete} style={{ marginTop: 16 }}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="societe-view-wrapper">
            {success && (
                <div className="parametres-success">
                    <i className="bi bi-check-circle"></i> {success}
                </div>
            )}

            <div className="societe-view-card">
                {/* Card header */}
                <div className="societe-view-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="bi bi-building"></i>
                        <h2>Information du courtier</h2>
                    </div>
                    <button className="btn-societe-edit" onClick={openModal}>
                        <i className="bi bi-pencil-fill"></i>
                        {isNew ? 'Configurer' : 'Modifier la fiche'}
                    </button>
                </div>

                {/* Fiche d'affichage */}
                <div className="societe-fiche-body">
                    {/* Logo + nom en haut */}
                    <div className="societe-fiche-top">
                        <div className="societe-fiche-logo">
                            {data?.logosociete ? (
                                <img src={data.logosociete} alt="Logo société" />
                            ) : (
                                <div className="societe-logo-placeholder">
                                    <i className="bi bi-image"></i>
                                    <span>Aucun logo</span>
                                </div>
                            )}
                        </div>
                        <div className="societe-fiche-title">
                            <h3>{data?.raisonsocial || <span style={{ color: '#bcaaa4', fontStyle: 'italic' }}>Non renseigné</span>}</h3>
                            {data?.adressesociete && <p>{data.adressesociete}</p>}
                        </div>
                    </div>

                    {/* Grille d'informations */}
                    <div className="societe-info-grid">
                        <InfoItem label="Email" value={data?.emailsociete} />
                        <InfoItem label="Téléphone" value={data?.telsociete} />
                        <InfoItem label="B.P" value={data?.bp_courtier} />
                        <InfoItem label="Fax" value={data?.fax_courtier} />
                        <InfoItem label="Bas de page" value={data?.basdepage} fullWidth />
                    </div>

                    {/* Paramètres fiscaux */}
                    <div className="societe-fiche-section-title">Paramètres fiscaux</div>
                    <div className="societe-info-grid">
                        <InfoItem label="Montant CEMAC" value={data?.param_CEMAC != null ? `${data.param_CEMAC} FCFA` : null} />
                        <InfoItem label="Montant CCA" value={data?.param_CCA != null ? `${data.param_CCA} FCFA` : null} />
                    </div>
                </div>
            </div>

            {/* Modal modification */}
            {isModalOpen && (
                <div className="societe-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="societe-modal-container">
                        <div className="societe-modal-header">
                            <h3><i className="bi bi-building me-2"></i>{isNew ? 'Configurer la société' : 'Modifier les informations'}</h3>
                            <button className="societe-modal-close" onClick={closeModal}><i className="bi bi-x-lg"></i></button>
                        </div>

                        <div className="societe-modal-body">
                            {saveError && (
                                <div className="parametres-error" style={{ marginBottom: 16 }}>
                                    <i className="bi bi-exclamation-circle"></i> {saveError}
                                </div>
                            )}

                            {/* Logo */}
                            <div className="societe-modal-logo-row">
                                <div className="societe-modal-logo-box" onClick={() => fileInputRef.current?.click()}>
                                    {formData.logosociete ? (
                                        <img src={formData.logosociete} alt="Logo" />
                                    ) : (
                                        <div className="societe-logo-placeholder">
                                            <i className="bi bi-image"></i>
                                            <span>Cliquer pour ajouter</span>
                                        </div>
                                    )}
                                </div>
                                <button type="button" className="btn-select-logo" onClick={() => fileInputRef.current?.click()}>
                                    <i className="bi bi-camera"></i> Sélectionner une image
                                </button>
                                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                            </div>

                            <div className="societe-modal-fields">
                                <div className="societe-field-row">
                                    <label>Raison sociale <span style={{ color: '#c62828' }}>*</span></label>
                                    <input type="text" name="raisonsocial" value={formData.raisonsocial} onChange={handleChange} disabled={!isNew} placeholder="Raison sociale" />
                                </div>
                                <div className="societe-field-row">
                                    <label>Adresse</label>
                                    <input type="text" name="adressesociete" value={formData.adressesociete} onChange={handleChange} placeholder="Adresse" />
                                </div>
                                <div className="societe-fields-2col">
                                    <div className="societe-field-row">
                                        <label>Email</label>
                                        <input type="email" name="emailsociete" value={formData.emailsociete} onChange={handleChange} placeholder="email@exemple.com" />
                                    </div>
                                    <div className="societe-field-row">
                                        <label>Téléphone</label>
                                        <input type="text" name="telsociete" value={formData.telsociete} onChange={handleChange} placeholder="+241..." />
                                    </div>
                                </div>
                                <div className="societe-fields-2col">
                                    <div className="societe-field-row">
                                        <label>B.P</label>
                                        <input type="text" name="bp_courtier" value={formData.bp_courtier} onChange={handleChange} placeholder="Boîte postale" />
                                    </div>
                                    <div className="societe-field-row">
                                        <label>Fax</label>
                                        <input type="text" name="fax_courtier" value={formData.fax_courtier} onChange={handleChange} placeholder="Fax" />
                                    </div>
                                </div>
                                <div className="societe-field-row">
                                    <label>Bas de page</label>
                                    <textarea name="basdepage" value={formData.basdepage} onChange={handleChange} placeholder="Texte de pied de page..." rows={3} />
                                </div>
                                <div className="societe-modal-divider"><span>Paramètres fiscaux</span></div>
                                <div className="societe-fields-2col">
                                    <div className="societe-field-row">
                                        <label>Montant CEMAC</label>
                                        <input type="number" name="param_CEMAC" value={formData.param_CEMAC} onChange={handleChange} placeholder="0" min="0" />
                                    </div>
                                    <div className="societe-field-row">
                                        <label>Montant CCA</label>
                                        <input type="number" name="param_CCA" value={formData.param_CCA} onChange={handleChange} placeholder="0" min="0" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="societe-modal-footer">
                            <button className="btn-agence-cancel" onClick={closeModal} disabled={saving}>
                                <i className="bi bi-x-lg"></i> Annuler
                            </button>
                            <button className="btn-agence-save" onClick={handleSave} disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm" /> Enregistrement...</> : <><i className="bi bi-check-lg"></i> Enregistrer</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocieteForm;
