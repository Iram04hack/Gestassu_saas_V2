import React, { useState, useEffect } from 'react';
import { createTache, getUtilisateurs } from '../../services/taches';

const TacheFormModal = ({ isOpen, onClose, client, onSuccess }) => {
    const [formData, setFormData] = useState({
        titre_tache: '',
        description_tache: '',
        date_echeance: '',
        affecter_a: '',
        couleur_tache: '#808080'
    });
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadUtilisateurs();
            // Date de début = date actuelle
            const now = new Date();
            const formattedDate = now.toISOString().slice(0, 16);
            setFormData(prev => ({
                ...prev,
                date_debut: formattedDate
            }));
        }
    }, [isOpen]);

    const loadUtilisateurs = async () => {
        try {
            const data = await getUtilisateurs();
            setUtilisateurs(data.results || data || []);
        } catch (err) {
            console.error('Erreur chargement utilisateurs:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({ ...prev, affecter_a: user.idutilisateur }));
        setShowUserModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titre_tache) {
            alert('Veuillez saisir un titre pour la tâche');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                id_client: client.id,
                statut: 'en_attente',
                date_debut: new Date().toISOString()
            };

            await createTache(payload);
            if (onSuccess) onSuccess();
            onClose();
            resetForm();
        } catch (err) {
            console.error('Erreur création tâche:', err);
            alert('Erreur lors de la création de la tâche');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            titre_tache: '',
            description_tache: '',
            date_echeance: '',
            affecter_a: '',
            couleur_tache: '#808080'
        });
        setSelectedUser(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <style>{`
                    .modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex; justify-content: center; align-items: flex-start;
                        z-index: 1000;
                        overflow-y: auto;
                        padding: 20px 0;
                    }
                    .tache-modal-content {
                        background: white; width: 700px; max-width: 95vw;
                        border-radius: 4px; overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        display: flex;
                        flex-direction: column;
                        margin: auto 0;
                    }
                    .tache-modal-header {
                        background: #6d4c41; color: white; padding: 15px;
                        font-size: 1.1rem; font-weight: 500;
                        display: flex; justify-content: space-between; align-items: center;
                        flex-shrink: 0;
                    }
                    .modal-close {
                        background: none; border: none; color: white;
                        font-size: 1.5rem; cursor: pointer;
                    }
                    .tache-modal-body { 
                        padding: 30px; 
                        overflow-y: auto;
                        flex: 1;
                    }
                    .form-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 20px;
                    }
                    .form-row.full { grid-template-columns: 1fr; }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    .form-label {
                        display: block; margin-bottom: 5px; font-weight: 500; color: #333;
                    }
                    .form-input, .form-textarea {
                        width: 100%; padding: 8px 12px; border: 1px solid #ccc;
                        border-radius: 4px; font-size: 0.9rem;
                    }
                    .form-textarea {
                        min-height: 100px;
                        resize: vertical;
                    }
                    .input-with-button {
                        display: flex;
                        gap: 5px;
                    }
                    .input-with-button input {
                        flex: 1;
                    }
                    .btn-browse {
                        background: #6d4c41;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        white-space: nowrap;
                    }
                    .color-picker-group {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .color-preview {
                        width: 40px;
                        height: 40px;
                        border-radius: 4px;
                        border: 1px solid #ccc;
                    }
                    .color-button {
                        background: #6d4c41;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .tache-modal-footer {
                        padding: 15px; background: #f5f5f5; display: flex;
                        justify-content: center; gap: 15px;
                        flex-shrink: 0;
                    }
                    .btn-cancel, .btn-save {
                        padding: 8px 20px; border-radius: 20px; border: none;
                        cursor: pointer; display: flex; align-items: center; gap: 5px;
                    }
                    .btn-cancel { background: #6d4c41; color: white; }
                    .btn-save { background: #6d4c41; color: white; }
                    
                    .user-modal {
                        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        background: white; width: 400px; max-width: 90vw;
                        border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        z-index: 1001;
                    }
                    .user-list {
                        max-height: 300px;
                        overflow-y: auto;
                    }
                    .user-item {
                        padding: 10px;
                        border-bottom: 1px solid #eee;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                    }
                    .user-item:hover {
                        background: #f5f5f5;
                    }
                `}</style>

                <div className="tache-modal-content">
                    <div className="tache-modal-header">
                        <span>Fiche tâche</span>
                        <button className="modal-close" onClick={onClose}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="tache-modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Client :</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={`${client?.nom_client || ''} ${client?.prenom_client || ''}`}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Affecter à :</label>
                                    <div className="input-with-button">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={selectedUser ? `${selectedUser.nom_utilisateur} - ${selectedUser.role_utilisateur}` : ''}
                                            readOnly
                                            placeholder="Sélectionner un utilisateur"
                                        />
                                        <button
                                            type="button"
                                            className="btn-browse"
                                            onClick={() => setShowUserModal(true)}
                                        >
                                            ...
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row full">
                                <div className="form-group">
                                    <label className="form-label">Titre tâche :</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="titre_tache"
                                        value={formData.titre_tache}
                                        onChange={handleChange}
                                        placeholder="Saisir le titre de la tâche"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date début :</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={new Date().toISOString().slice(0, 16)}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date échéance :</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        name="date_echeance"
                                        value={formData.date_echeance}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row full">
                                <div className="form-group">
                                    <label className="form-label">Description tâche :</label>
                                    <textarea
                                        className="form-textarea"
                                        name="description_tache"
                                        value={formData.description_tache}
                                        onChange={handleChange}
                                        placeholder="Saisir la description de la tâche"
                                    />
                                </div>
                            </div>

                            <div className="form-row full">
                                <div className="form-group">
                                    <label className="form-label">Couleur de la tâche :</label>
                                    <div className="color-picker-group">
                                        <div
                                            className="color-preview"
                                            style={{ backgroundColor: formData.couleur_tache }}
                                        />
                                        <input
                                            type="color"
                                            name="couleur_tache"
                                            value={formData.couleur_tache}
                                            onChange={handleChange}
                                            style={{ display: 'none' }}
                                            id="colorInput"
                                        />
                                        <button
                                            type="button"
                                            className="color-button"
                                            onClick={() => document.getElementById('colorInput').click()}
                                        >
                                            Sélectionné une couleur
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="tache-modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                <i className="bi bi-x-lg"></i> Annuler
                            </button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="user-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tache-modal-header">
                            <span>Sélectionner un utilisateur</span>
                            <button className="modal-close" onClick={() => setShowUserModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="user-list">
                            {utilisateurs.map(user => (
                                <div
                                    key={user.idutilisateur}
                                    className="user-item"
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <span>{user.nom_utilisateur}</span>
                                    <span style={{ color: '#999' }}>{user.role_utilisateur}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TacheFormModal;
