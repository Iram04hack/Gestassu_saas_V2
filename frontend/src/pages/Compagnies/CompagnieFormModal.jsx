import React, { useState } from 'react';
import './CompagnieFormModal.css';

const CompagnieFormModal = ({ isOpen, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'accessoire'
    const [formData, setFormData] = useState({
        numero: '',
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        logo: null
    });

    // Accessories State
    const [accessoire, setAccessoire] = useState({
        min: '',
        max: '',
        montant: ''
    });
    const [accessoiresList, setAccessoiresList] = useState([]);

    if (!isOpen) return null;

    const handleAddAccessoire = () => {
        if (accessoire.min && accessoire.max && accessoire.montant) {
            setAccessoiresList([...accessoiresList, { ...accessoire, id: Date.now() }]);
            setAccessoire({ min: '', max: '', montant: '' });
        }
    };

    const handleDeleteAccessoire = (id) => {
        setAccessoiresList(accessoiresList.filter(item => item.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, accessoires: accessoiresList });
        onClose();
    };

    // File Upload Handler
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file }); // Store the file object or URL
        }
    };

    return (
        <div className="modal-overlay">
            <div className="compagnies-modal-container">
                <div className="compagnies-modal-header">
                    <h2>Fiche Compagnie</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="form-type-switch">
                    <div
                        className={`switch-option ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        Informations générale
                    </div>
                    <div
                        className={`switch-option ${activeTab === 'accessoire' ? 'active' : ''}`}
                        onClick={() => setActiveTab('accessoire')}
                    >
                        Accessoire
                    </div>
                </div>

                <div className="compagnies-modal-body">
                    {activeTab === 'general' ? (
                        <div className="general-tab-layout">
                            {/* Left Side - Logo Placeholder */}
                            <div className="logo-section">
                                <label>Logo</label>
                                <div className="logo-upload-box">
                                    {formData.logo ? (
                                        <img src={URL.createObjectURL(formData.logo)} alt="Logo" />
                                    ) : (
                                        <div className="placeholder-content"></div>
                                    )}
                                </div>
                                <label className="btn-select-image">
                                    CHOISIR UNE IMAGE
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            {/* Right Side - Form Fields */}
                            <div className="fields-section">
                                <div className="form-row">
                                    <label>Numéro Compagnie :</label>
                                    <input type="text" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Nom de la compagnie :</label>
                                    <input type="text" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Adresse :</label>
                                    <input type="text" value={formData.adresse} onChange={e => setFormData({ ...formData, adresse: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Téléphone :</label>
                                    <input type="text" value={formData.telephone} onChange={e => setFormData({ ...formData, telephone: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Email :</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="accessoire-tab-layout">
                            <div className="accessoire-form">
                                <div className="input-group">
                                    <label>Interv. Min</label>
                                    <input type="text" value={accessoire.min} onChange={e => setAccessoire({ ...accessoire, min: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Interv. Max</label>
                                    <input type="text" value={accessoire.max} onChange={e => setAccessoire({ ...accessoire, max: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Montant</label>
                                    <input type="text" value={accessoire.montant} onChange={e => setAccessoire({ ...accessoire, montant: e.target.value })} />
                                </div>

                                <div className="btn-group">
                                    <button className="btn-add" onClick={handleAddAccessoire}>Ajouter</button>
                                    <button className="btn-del">Supprimer <i className="bi bi-trash"></i></button>
                                </div>
                            </div>

                            <div className="accessoire-table-wrapper">
                                <table className="accessoire-table">
                                    <thead>
                                        <tr>
                                            <th>Interv. Min</th>
                                            <th>Interv. Max</th>
                                            <th>Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accessoiresList.length === 0 ? (
                                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Aucun accessoire</td></tr>
                                        ) : (
                                            accessoiresList.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.min}</td>
                                                    <td>{item.max}</td>
                                                    <td>{item.montant}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="compagnies-modal-footer">
                    <button className="btn-footer-cancel" onClick={onClose}><i className="bi bi-x-lg"></i> Annuler</button>
                    <button className="btn-footer-save" onClick={handleSubmit}><i className="bi bi-check-lg"></i> Enregistrer</button>
                </div>
            </div>
        </div>
    );
};

export default CompagnieFormModal;
