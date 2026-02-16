import React, { useState, useEffect } from 'react';
import commerciauxService from '../../services/commerciauxService';

const CommercialFormModal = ({ isOpen, onClose, onSave, apporteur, defaultType }) => {
    const [formData, setFormData] = useState({
        code_apporteur: '',
        nom_apporteur: '',
        type_apporteur: defaultType === 'entreprise' ? 'Entreprise' : 'Apporteur d\'affaire',
        adresse: '',
        email: '',
        telephone: '',
        date_naissance: '',
        nif_rccm: '',
        num_piece_identite: '',
        date_entree: '',
        frequence_paiement: 'Mensuel',
        login: '',
        mot_de_passe: '',
        confirm_password: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (apporteur) {
            setFormData({
                ...apporteur,
                mot_de_passe: '',
                confirm_password: ''
            });
        } else {
            // Reset form for new apporteur
            setFormData({
                code_apporteur: '',
                nom_apporteur: '',
                type_apporteur: defaultType === 'entreprise' ? 'Entreprise' : 'Apporteur d\'affaire',
                adresse: '',
                email: '',
                telephone: '',
                date_naissance: '',
                nif_rccm: '',
                num_piece_identite: '',
                date_entree: '',
                frequence_paiement: 'Mensuel',
                login: '',
                mot_de_passe: '',
                confirm_password: ''
            });
        }
    }, [apporteur, defaultType, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.nom_apporteur) newErrors.nom_apporteur = 'Nom requis';
        if (!formData.type_apporteur) newErrors.type_apporteur = 'Type requis';

        if (!apporteur) {
            // Only validate password for new apporteurs
            if (formData.mot_de_passe && formData.mot_de_passe !== formData.confirm_password) {
                newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const dataToSend = { ...formData };
            delete dataToSend.confirm_password;

            if (apporteur) {
                // Update existing
                await commerciauxService.updateApporteur(apporteur.code_apporteur, dataToSend);
            } else {
                // Create new
                await commerciauxService.createApporteur(dataToSend);
            }

            onSave();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isEntreprise = formData.type_apporteur === 'Entreprise';

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>{apporteur ? 'Modifier' : 'Nouveau'} Commercial</h2>
                    <button onClick={onClose} className="btn-close">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Type *</label>
                                <select
                                    name="type_apporteur"
                                    value={formData.type_apporteur}
                                    onChange={handleChange}
                                    required
                                >
                                    {isEntreprise ? (
                                        <option value="Entreprise">Entreprise</option>
                                    ) : (
                                        <>
                                            <option value="Apporteur d'affaire">Apporteur d'affaire</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Salarié INGENIUM">Salarié INGENIUM</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Fréq. paiement</label>
                                <select
                                    name="frequence_paiement"
                                    value={formData.frequence_paiement}
                                    onChange={handleChange}
                                >
                                    <option value="Mensuel">Mensuel</option>
                                    <option value="Trimestriel">Trimestriel</option>
                                    <option value="Semestriel">Semestriel</option>
                                    <option value="Annuel">Annuel</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{isEntreprise ? 'Raison sociale' : 'Nom complet'} *</label>
                            <input
                                type="text"
                                name="nom_apporteur"
                                value={formData.nom_apporteur}
                                onChange={handleChange}
                                required
                            />
                            {errors.nom_apporteur && <span className="error">{errors.nom_apporteur}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input
                                    type="tel"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Adresse</label>
                            <input
                                type="text"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                            />
                        </div>

                        {!isEntreprise && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date naissance</label>
                                    <input
                                        type="date"
                                        name="date_naissance"
                                        value={formData.date_naissance || ''}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>N° pièce identité</label>
                                    <input
                                        type="text"
                                        name="num_piece_identite"
                                        value={formData.num_piece_identite}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        {isEntreprise && (
                            <div className="form-group">
                                <label>NIF / RCCM</label>
                                <input
                                    type="text"
                                    name="nif_rccm"
                                    value={formData.nif_rccm}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label>Login</label>
                                <input
                                    type="text"
                                    name="login"
                                    value={formData.login}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Date entrée</label>
                                <input
                                    type="date"
                                    name="date_entree"
                                    value={formData.date_entree || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {!apporteur && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mot de passe</label>
                                    <input
                                        type="password"
                                        name="mot_de_passe"
                                        value={formData.mot_de_passe}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirmer mot de passe</label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                    />
                                    {errors.confirm_password && <span className="error">{errors.confirm_password}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer" style={{ justifyContent: 'center' }}>
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommercialFormModal;
