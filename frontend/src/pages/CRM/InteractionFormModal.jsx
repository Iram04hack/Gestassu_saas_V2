import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './InteractionFormModal.css';

const InteractionFormModal = ({ isOpen, onClose, onSave, clientName }) => {
    const [formData, setFormData] = useState({
        type_interaction: '',
        date_heure_interaction: '',
        duree_interaction: '',
        lieu: '',
        description: '',
        resultat_interaction: '',
        rappel_necessaire: false,
        titre_rappel: '',
        date_rappel: '',
        idutilisateur_action: '',
    });

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await api.get('/authentication/utilisateurs/');
            setUsers(response.data.results || response.data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des utilisateurs:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        // Reset form
        setFormData({
            type_interaction: '',
            date_heure_interaction: '',
            duree_interaction: '',
            lieu: '',
            description: '',
            resultat_interaction: '',
            rappel_necessaire: false,
            titre_rappel: '',
            date_rappel: '',
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container interaction-modal">
                <div className="modal-header">
                    <h2>Fiche interaction</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <form id="interactionForm" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {/* Client/prospect */}
                            <div className="form-group full-width with-button">
                                <label>Client/prospect :</label>
                                <div className="input-with-btn">
                                    <input
                                        type="text"
                                        value={clientName}
                                        disabled
                                        style={{ background: '#f5f5f5' }}
                                    />
                                    <button type="button" className="btn-select" disabled>
                                        <i className="bi bi-three-dots"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Méthode */}
                            <div className="form-group full-width">
                                <label>Méthode : <span className="required">*</span></label>
                                <select
                                    name="type_interaction"
                                    value={formData.type_interaction}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Visite">Visite</option>
                                    <option value="Appel téléphonique">Appel téléphonique</option>
                                    <option value="Achat en ligne">Achat en ligne</option>
                                    <option value="Courriel">Courriel</option>
                                </select>
                            </div>

                            {/* Date */}
                            <div className="form-group">
                                <label>Date : <span className="required">*</span></label>
                                <input
                                    type="datetime-local"
                                    name="date_heure_interaction"
                                    value={formData.date_heure_interaction}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Durée */}
                            <div className="form-group">
                                <label>Durée :</label>
                                <input
                                    type="text"
                                    name="duree_interaction"
                                    value={formData.duree_interaction}
                                    onChange={handleChange}
                                    placeholder="Ex: 30 min"
                                />
                            </div>

                            {/* Lieu */}
                            <div className="form-group full-width">
                                <label>Lieu :</label>
                                <input
                                    type="text"
                                    name="lieu"
                                    value={formData.lieu}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label>Description :</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            {/* Agent */}
                            <div className="form-group full-width">
                                <label>Agent :</label>
                                <select
                                    name="idutilisateur_action"
                                    value={formData.idutilisateur_action}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionner un agent...</option>
                                    {loadingUsers ? (
                                        <option disabled>Chargement...</option>
                                    ) : (
                                        users.map(user => (
                                            <option key={user.idutilisateur} value={user.idutilisateur}>
                                                {user.nom_utilisateur || user.login_utilisateur} - {user.role_utilisateur || 'Agent'}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Résultat */}
                            <div className="form-group full-width">
                                <label>Résultat :</label>
                                <textarea
                                    name="resultat_interaction"
                                    rows="4"
                                    value={formData.resultat_interaction}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            {/* Rappel nécessaire */}
                            <div className="form-group full-width">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="rappel_necessaire"
                                        checked={formData.rappel_necessaire}
                                        onChange={handleChange}
                                    />
                                    <span>Nécessite un rappel</span>
                                </label>
                            </div>

                            {/* Champs conditionnels si rappel nécessaire */}
                            {formData.rappel_necessaire && (
                                <>
                                    <div className="form-group full-width">
                                        <label>Titre du rappel :</label>
                                        <input
                                            type="text"
                                            name="titre_rappel"
                                            value={formData.titre_rappel}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date du rappel :</label>
                                        <input
                                            type="datetime-local"
                                            name="date_rappel"
                                            value={formData.date_rappel}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        <i className="bi bi-x-lg"></i> Annuler
                    </button>
                    <button type="submit" form="interactionForm" className="btn-save">
                        <i className="bi bi-check-lg"></i> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InteractionFormModal;
