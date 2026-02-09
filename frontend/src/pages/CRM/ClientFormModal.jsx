import React, { useState, useEffect } from 'react';
import { countries } from '../../constants/countries';
import { legalForms, civilities } from '../../constants/legalForms';
import './ClientFormModal.css';

const ClientFormModal = ({ isOpen, onClose, onSave, defaultType = 'personne', initialData = null, isEditMode = false }) => {
    const [type, setType] = useState(defaultType); // 'personne' or 'entreprise'
    const [formData, setFormData] = useState({
        qualite: '', // Will hold Civilité or Forme Juridique
        nom: '',
        prenom: '',
        raisonSocial: '',
        adresse: '',
        email: '',
        tel: '',
        whatsapp: '',
        profession: '',
        dateNaissance: '',
        pays: 'Gabon',
        nif: '',
        pointFocal: '',
        fonctionPf: '',
        source: '',
        conseiller: '',
        autresInfos: ''
    });

    // Initialize form data when editing
    useEffect(() => {
        if (isEditMode && initialData) {
            setType(initialData.est_entreprise ? 'entreprise' : 'personne');
            setFormData({
                qualite: initialData.civilite || '',
                nom: initialData.nom_client || '',
                prenom: initialData.prenom_client || '',
                raisonSocial: initialData.nom_client || '',
                adresse: initialData.adresse || '',
                email: initialData.email || '',
                tel: initialData.telephone || '',
                whatsapp: initialData.tel_whatsapp || '',
                profession: initialData.profession || '',
                dateNaissance: initialData.date_naissance || '',
                pays: initialData.pays || 'Gabon',
                nif: initialData.nif_client || '',
                pointFocal: initialData.representant_entreprise || '',
                fonctionPf: initialData.role_representant || '',
                source: initialData.source || '',
                conseiller: '',
                autresInfos: initialData.autres_informations || ''
            });
        }
    }, [isEditMode, initialData]);

    // Reset qualite when type changes
    useEffect(() => {
        if (!isEditMode) {
            setFormData(prev => ({ ...prev, qualite: '' }));
        }
    }, [type, isEditMode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Construct the data for API
        const apiData = {
            civilite: formData.qualite,
            nom_client: type === 'personne' ? formData.nom : formData.raisonSocial,
            prenom_client: type === 'personne' ? formData.prenom : '',
            adresse: formData.adresse,
            email: formData.email,
            telephone: formData.tel,
            tel_whatsapp: formData.whatsapp,
            profession: type === 'personne' ? formData.profession : '',
            date_naissance: type === 'personne' ? formData.dateNaissance : null,
            pays: formData.pays,
            nif_client: type === 'entreprise' ? formData.nif : '',
            representant_entreprise: type === 'entreprise' ? formData.pointFocal : '',
            role_representant: type === 'entreprise' ? formData.fonctionPf : '',
            source: formData.source,
            autres_informations: formData.autresInfos,
            est_entreprise: type === 'entreprise'
        };

        onSave(apiData);

        // Reset form if not in edit mode
        if (!isEditMode) {
            setFormData({
                qualite: '', nom: '', prenom: '', raisonSocial: '', adresse: '', email: '', tel: '', whatsapp: '',
                profession: '', dateNaissance: '', pays: 'Gabon', nif: '', pointFocal: '', fonctionPf: '',
                source: '', conseiller: '', autresInfos: ''
            });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{isEditMode ? 'Modifier Client' : 'Fiche Client'}</h2>
                    <h3>{type === 'personne' ? 'Personne physique' : 'Entreprise'}</h3>
                    <button className="close-btn" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                </div>

                <div className="modal-body">
                    <form id="clientForm" onSubmit={handleSubmit}>
                        {/* Type Switcher */}
                        <div className="form-type-switch">
                            <label className={`switch-option ${type === 'personne' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="personne"
                                    checked={type === 'personne'}
                                    onChange={() => setType('personne')}
                                />
                                <i className="bi bi-person"></i> Personne
                            </label>
                            <label className={`switch-option ${type === 'entreprise' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="entreprise"
                                    checked={type === 'entreprise'}
                                    onChange={() => setType('entreprise')}
                                />
                                <i className="bi bi-building"></i> Entreprise
                            </label>
                        </div>

                        <div className="form-grid">
                            {/* Dynamic First Field based on Type */}
                            <div className="form-group full-width">
                                <label>{type === 'personne' ? 'Civilité' : 'Forme Juridique'} <span className="required">*</span></label>
                                <select name="qualite" value={formData.qualite} onChange={handleChange} required>
                                    <option value="">Sélectionner...</option>
                                    {type === 'personne' ? (
                                        civilities.map(civ => <option key={civ} value={civ}>{civ}</option>)
                                    ) : (
                                        legalForms.map(form => <option key={form} value={form}>{form}</option>)
                                    )}
                                </select>
                            </div>

                            {type === 'personne' ? (
                                <>
                                    <div className="form-group">
                                        <label>Nom <span className="required">*</span></label>
                                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Prénom <span className="required">*</span></label>
                                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Pays</label>
                                        <select name="pays" value={formData.pays} onChange={handleChange}>
                                            {countries.map(country => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date naissance</label>
                                        <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Profession</label>
                                        <input type="text" name="profession" value={formData.profession} onChange={handleChange} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group full-width">
                                        <label>Raison sociale <span className="required">*</span></label>
                                        <input type="text" name="raisonSocial" value={formData.raisonSocial} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Pays</label>
                                        <select name="pays" value={formData.pays} onChange={handleChange}>
                                            {countries.map(country => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>NIF</label>
                                        <input type="text" name="nif" value={formData.nif} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Point focal</label>
                                        <input type="text" name="pointFocal" value={formData.pointFocal} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Fonction PF</label>
                                        <input type="text" name="fonctionPf" value={formData.fonctionPf} onChange={handleChange} />
                                    </div>
                                </>
                            )}

                            <div className="form-group full-width">
                                <label>Adresse</label>
                                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
                            </div>

                            <div className="form-group full-width">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Nº Tel</label>
                                <input type="tel" name="tel" value={formData.tel} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Nº Whatsapp</label>
                                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                            </div>

                            <div className="form-group full-width">
                                <label>Source</label>
                                <select name="source" value={formData.source} onChange={handleChange}>
                                    <option value="">Sélectionner...</option>
                                    <option value="Bouche à oreille">Bouche à oreille</option>
                                    <option value="Site Web">Site Web</option>
                                    <option value="Réseaux Sociaux">Réseaux Sociaux</option>
                                    <option value="Campagne Pub">Campagne Pub</option>
                                </select>
                            </div>

                            <div className="form-group full-width with-button">
                                <label>Conseiller client</label>
                                <div className="input-with-btn">
                                    <input type="text" name="conseiller" value={formData.conseiller} onChange={handleChange} placeholder="Rechercher..." />
                                    <button type="button" className="btn-select">Sélectionner <i className="bi bi-cursor-fill"></i></button>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Autres infos</label>
                                <textarea name="autresInfos" rows="3" value={formData.autresInfos} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}><i className="bi bi-x-lg"></i> Annuler</button>
                    <button type="submit" form="clientForm" className="btn-save"><i className="bi bi-check-lg"></i> Enregistrer</button>
                </div>
            </div>
        </div>
    );
};

export default ClientFormModal;
