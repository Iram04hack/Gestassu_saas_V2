import React, { useState, useEffect } from 'react';

const INITIAL_FORM = {
    codeagence: '',
    nomagence: '',
    adresseagence: '',
    telagence: '',
    emailagence: '',
};

const AgenceFormModal = ({ isOpen, onClose, onSave, agence }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const isEditing = !!agence;

    useEffect(() => {
        if (agence) {
            setFormData({
                codeagence: agence.codeagence || '',
                nomagence: agence.nomagence || '',
                adresseagence: agence.adresseagence || '',
                telagence: agence.telagence || '',
                emailagence: agence.emailagence || '',
            });
        } else {
            setFormData(INITIAL_FORM);
        }
    }, [agence, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nomagence.trim()) {
            alert('Le nom de l\'agence est obligatoire.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="agence-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="agence-modal-container">
                <div className="agence-modal-header">
                    <h3>
                        <i className="bi bi-building me-2"></i>
                        {isEditing ? 'Modifier l\'agence' : 'Nouvelle agence'}
                    </h3>
                    <button className="agence-modal-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="agence-modal-body">
                        <div className="agence-field-row">
                            <label>Code agence <span style={{ color: '#c62828' }}>*</span></label>
                            <input
                                type="text"
                                name="codeagence"
                                value={formData.codeagence}
                                onChange={handleChange}
                                placeholder="Laisser vide pour génération automatique"
                                disabled={isEditing}
                            />
                        </div>
                        <div className="agence-field-row">
                            <label>Nom de l'agence <span style={{ color: '#c62828' }}>*</span></label>
                            <input
                                type="text"
                                name="nomagence"
                                value={formData.nomagence}
                                onChange={handleChange}
                                placeholder="Nom de l'agence"
                                required
                            />
                        </div>
                        <div className="agence-field-row">
                            <label>Adresse</label>
                            <input
                                type="text"
                                name="adresseagence"
                                value={formData.adresseagence}
                                onChange={handleChange}
                                placeholder="Adresse de l'agence"
                            />
                        </div>
                        <div className="agence-field-row">
                            <label>Téléphone</label>
                            <input
                                type="text"
                                name="telagence"
                                value={formData.telagence}
                                onChange={handleChange}
                                placeholder="+241..."
                            />
                        </div>
                        <div className="agence-field-row">
                            <label>Email</label>
                            <input
                                type="email"
                                name="emailagence"
                                value={formData.emailagence}
                                onChange={handleChange}
                                placeholder="email@agence.com"
                            />
                        </div>
                    </div>

                    <div className="agence-modal-footer">
                        <button type="button" className="btn-agence-cancel" onClick={onClose}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                        <button type="submit" className="btn-agence-save">
                            <i className="bi bi-check-lg"></i> Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgenceFormModal;
