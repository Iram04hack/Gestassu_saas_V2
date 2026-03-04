import React, { useState, useEffect } from 'react';
import { createTache, getUtilisateurs } from '../../services/taches';

const TacheFormModal = ({ isOpen, onClose, client, onSuccess }) => {
    const [formData, setFormData] = useState({
        titre_tache: '',
        description_tache: '',
        date_echeance_tache: '',
        code_couleur: '#6d4c41',
    });
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadUtilisateurs();
            setFormData({ titre_tache: '', description_tache: '', date_echeance_tache: '', code_couleur: '#6d4c41' });
            setSelectedUser(null);
            setUserSearch('');
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
        setShowUserModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.titre_tache.trim()) return;
        setLoading(true);
        try {
            const payload = {
                titre_tache: formData.titre_tache,
                description_tache: formData.description_tache,
                date_echeance_tache: formData.date_echeance_tache || null,
                code_couleur: formData.code_couleur,
                id_client: client?.id || client?.id_client || client?.ID_Client || '',
                idutilisateur_affecter: selectedUser?.idutilisateur || '',
                statut_tache: 0,
            };
            await createTache(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Erreur création tâche:', err);
            alert('Erreur lors de la création de la tâche');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const clientName = client ? `${client.nom_client || ''} ${client.prenom_client || ''}`.trim().toUpperCase() : '';
    const filteredUsers = utilisateurs.filter(u =>
        !userSearch || u.nom_utilisateur?.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <>
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000,
                animation: 'tmFadeIn 0.2s ease-out',
            }}>
                <style>{`
                    @keyframes tmFadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes tmSlideUp {
                        from { opacity: 0; transform: translateY(24px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .tm-modal {
                        background: #fff;
                        width: 560px; max-width: 95vw;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
                        animation: tmSlideUp 0.3s ease-out;
                        display: flex; flex-direction: column;
                        max-height: 92vh;
                    }
                    .tm-header {
                        background: linear-gradient(135deg, #6d4c41 0%, #4e342e 100%);
                        color: white; padding: 18px 22px;
                        display: flex; align-items: center; justify-content: space-between;
                        flex-shrink: 0;
                    }
                    .tm-header-title {
                        font-size: 1.05rem; font-weight: 600; letter-spacing: 0.3px;
                        display: flex; align-items: center; gap: 10px;
                    }
                    .tm-header-icon {
                        width: 32px; height: 32px; border-radius: 8px;
                        background: rgba(255,255,255,0.15);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 1rem;
                    }
                    .tm-close {
                        background: rgba(255,255,255,0.15); border: none; color: white;
                        width: 30px; height: 30px; border-radius: 8px;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; font-size: 1.1rem;
                        transition: background 0.2s;
                    }
                    .tm-close:hover { background: rgba(255,255,255,0.28); }

                    .tm-body {
                        padding: 22px; overflow-y: auto; flex: 1;
                        scrollbar-width: thin; scrollbar-color: #d7ccc8 #fff;
                    }

                    .tm-client-banner {
                        background: #fdf8f6;
                        border: 1px solid #e8ddd9;
                        border-radius: 10px;
                        padding: 10px 14px;
                        margin-bottom: 18px;
                        display: flex; align-items: center; gap: 10px;
                    }
                    .tm-client-avatar {
                        width: 34px; height: 34px; border-radius: 50%;
                        background: linear-gradient(135deg, #8d6e63, #6d4c41);
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-size: 0.85rem; font-weight: 700;
                        flex-shrink: 0;
                    }
                    .tm-client-name {
                        font-size: 0.88rem; font-weight: 600; color: #4e342e;
                    }
                    .tm-client-label {
                        font-size: 0.74rem; color: #a1887f;
                    }

                    .tm-field { margin-bottom: 16px; }
                    .tm-label {
                        display: block; font-size: 0.8rem; font-weight: 600;
                        color: #6d4c41; margin-bottom: 6px; letter-spacing: 0.2px;
                    }
                    .tm-input, .tm-textarea, .tm-select {
                        width: 100%; padding: 9px 13px;
                        border: 1.5px solid #d7ccc8;
                        border-radius: 8px; font-size: 0.88rem;
                        color: #4e342e; background: #fff;
                        outline: none; transition: border-color 0.2s, box-shadow 0.2s;
                        font-family: inherit; box-sizing: border-box;
                    }
                    .tm-input:focus, .tm-textarea:focus, .tm-select:focus {
                        border-color: #6d4c41;
                        box-shadow: 0 0 0 3px rgba(109,76,65,0.1);
                    }
                    .tm-textarea { min-height: 80px; resize: vertical; }

                    .tm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

                    .tm-agent-field {
                        display: flex; gap: 8px; align-items: stretch;
                    }
                    .tm-agent-input {
                        flex: 1; padding: 9px 13px;
                        border: 1.5px solid #d7ccc8;
                        border-radius: 8px; font-size: 0.88rem;
                        color: #4e342e; background: #fdf8f6;
                        outline: none;
                    }
                    .tm-agent-btn {
                        background: linear-gradient(135deg, #6d4c41, #5d4037);
                        color: white; border: none;
                        width: 38px; border-radius: 8px;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; font-size: 1rem;
                        transition: opacity 0.2s;
                        flex-shrink: 0;
                    }
                    .tm-agent-btn:hover { opacity: 0.85; }

                    .tm-color-row {
                        display: flex; align-items: center; gap: 10px;
                    }
                    .tm-color-swatch {
                        width: 38px; height: 38px; border-radius: 8px;
                        border: 2px solid #d7ccc8; cursor: pointer;
                        flex-shrink: 0; transition: border-color 0.2s;
                        overflow: hidden; padding: 0;
                    }
                    .tm-color-swatch:hover { border-color: #6d4c41; }
                    .tm-color-label {
                        font-size: 0.82rem; color: #8d6e63;
                    }

                    .tm-footer {
                        padding: 16px 22px;
                        background: #fafaf9;
                        border-top: 1px solid #f0e8e4;
                        display: flex; justify-content: flex-end; gap: 10px;
                        flex-shrink: 0;
                    }
                    .tm-btn {
                        padding: 9px 22px; border-radius: 20px; border: none;
                        cursor: pointer; display: flex; align-items: center; gap: 7px;
                        font-size: 0.88rem; font-weight: 600;
                        transition: all 0.2s;
                    }
                    .tm-btn-cancel {
                        background: #efebe9; color: #6d4c41;
                        border: 1.5px solid #d7ccc8;
                    }
                    .tm-btn-cancel:hover { background: #e8ddd9; }
                    .tm-btn-save {
                        background: linear-gradient(135deg, #6d4c41, #5d4037);
                        color: white;
                        box-shadow: 0 2px 8px rgba(109,76,65,0.25);
                    }
                    .tm-btn-save:hover { box-shadow: 0 4px 12px rgba(109,76,65,0.35); transform: translateY(-1px); }
                    .tm-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

                    /* User selection modal */
                    .tm-user-modal {
                        position: fixed; inset: 0;
                        background: rgba(0,0,0,0.4);
                        display: flex; align-items: center; justify-content: center;
                        z-index: 1010;
                    }
                    .tm-user-panel {
                        background: white; width: 380px; max-width: 90vw;
                        border-radius: 12px; overflow: hidden;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        animation: tmSlideUp 0.2s ease-out;
                    }
                    .tm-user-header {
                        background: #6d4c41; color: white;
                        padding: 14px 18px;
                        display: flex; align-items: center; justify-content: space-between;
                        font-size: 0.95rem; font-weight: 600;
                    }
                    .tm-user-search {
                        padding: 10px 14px;
                        border-bottom: 1px solid #f0e8e4;
                    }
                    .tm-user-search input {
                        width: 100%; padding: 7px 12px;
                        border: 1.5px solid #d7ccc8; border-radius: 20px;
                        font-size: 0.85rem; outline: none;
                        box-sizing: border-box;
                    }
                    .tm-user-search input:focus { border-color: #6d4c41; }
                    .tm-user-list { max-height: 280px; overflow-y: auto; }
                    .tm-user-item {
                        padding: 10px 16px;
                        border-bottom: 1px solid #f5f0ee;
                        cursor: pointer;
                        display: flex; justify-content: space-between;
                        align-items: center;
                        transition: background 0.15s;
                    }
                    .tm-user-item:hover { background: #fdf8f6; }
                    .tm-user-item:last-child { border-bottom: none; }
                    .tm-user-name { font-size: 0.88rem; color: #4e342e; font-weight: 500; }
                    .tm-user-role { font-size: 0.78rem; color: #a1887f; }
                `}</style>

                <div className="tm-modal">
                    <div className="tm-header">
                        <div className="tm-header-title">
                            <span className="tm-header-icon"><i className="bi bi-check2-square"></i></span>
                            Nouvelle tâche
                        </div>
                        <button className="tm-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="tm-body">
                            {/* Client banner */}
                            <div className="tm-client-banner">
                                <div className="tm-client-avatar">
                                    {clientName.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <div className="tm-client-name">{clientName || '—'}</div>
                                    <div className="tm-client-label">Client associé</div>
                                </div>
                            </div>

                            {/* Titre */}
                            <div className="tm-field">
                                <label className="tm-label">Titre de la tâche *</label>
                                <input
                                    type="text"
                                    className="tm-input"
                                    name="titre_tache"
                                    value={formData.titre_tache}
                                    onChange={handleChange}
                                    placeholder="Ex: Relancer le client pour renouvellement"
                                    required
                                />
                            </div>

                            {/* Dates + Agent */}
                            <div className="tm-row">
                                <div className="tm-field">
                                    <label className="tm-label">Date d'échéance</label>
                                    <input
                                        type="datetime-local"
                                        className="tm-input"
                                        name="date_echeance_tache"
                                        value={formData.date_echeance_tache}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="tm-field">
                                    <label className="tm-label">Affecter à</label>
                                    <div className="tm-agent-field">
                                        <input
                                            type="text"
                                            className="tm-agent-input"
                                            value={selectedUser ? selectedUser.nom_utilisateur : ''}
                                            readOnly
                                            placeholder="Sélectionner..."
                                        />
                                        <button
                                            type="button"
                                            className="tm-agent-btn"
                                            onClick={() => setShowUserModal(true)}
                                            title="Choisir un agent"
                                        >
                                            <i className="bi bi-person-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="tm-field">
                                <label className="tm-label">Description</label>
                                <textarea
                                    className="tm-textarea"
                                    name="description_tache"
                                    value={formData.description_tache}
                                    onChange={handleChange}
                                    placeholder="Détails de la tâche..."
                                />
                            </div>

                            {/* Couleur */}
                            <div className="tm-field">
                                <label className="tm-label">Couleur de la tâche</label>
                                <div className="tm-color-row">
                                    <input
                                        type="color"
                                        className="tm-color-swatch"
                                        name="code_couleur"
                                        value={formData.code_couleur}
                                        onChange={handleChange}
                                        title="Choisir une couleur"
                                    />
                                    <span className="tm-color-label">{formData.code_couleur}</span>
                                </div>
                            </div>
                        </div>

                        <div className="tm-footer">
                            <button type="button" className="tm-btn tm-btn-cancel" onClick={onClose}>
                                <i className="bi bi-x-lg"></i> Annuler
                            </button>
                            <button type="submit" className="tm-btn tm-btn-save" disabled={loading}>
                                <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* User selection modal */}
            {showUserModal && (
                <div className="tm-user-modal" onClick={() => setShowUserModal(false)}>
                    <div className="tm-user-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="tm-user-header">
                            <span>Sélectionner un agent</span>
                            <button className="tm-close" onClick={() => setShowUserModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="tm-user-search">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="tm-user-list">
                            {filteredUsers.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#a1887f', fontSize: '0.85rem' }}>
                                    Aucun résultat
                                </div>
                            ) : filteredUsers.map(user => (
                                <div
                                    key={user.idutilisateur}
                                    className="tm-user-item"
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <span className="tm-user-name">{user.nom_utilisateur}</span>
                                    <span className="tm-user-role">{user.role_utilisateur || '—'}</span>
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
