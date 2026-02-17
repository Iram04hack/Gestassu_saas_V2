import React, { useState, useEffect } from 'react';
import './ContactsModal.css';
import compagniesService from '../../services/compagnies';

const ContactsModal = ({ isOpen, onClose, compagnie }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        nom_contact: '',
        fonction_contact: '',
        tel_contact: '',
        whatsapp_contact: '',
        email_contact: ''
    });

    useEffect(() => {
        if (isOpen && compagnie) {
            loadContacts();
        }
    }, [isOpen, compagnie]);

    const loadContacts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await compagniesService.getCompagnieContacts(compagnie.id);
            setContacts(response.results || response || []);
        } catch (err) {
            console.error('Erreur chargement contacts:', err);
            setError('Impossible de charger les contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                id_compagnie: compagnie.id
            };

            if (editingContact) {
                await compagniesService.updateContact(editingContact.idcontact_compagnie, dataToSend);
            } else {
                await compagniesService.createContact(dataToSend);
            }

            loadContacts();
            resetForm();
        } catch (err) {
            console.error('Erreur sauvegarde contact:', err);
            alert('Impossible de sauvegarder le contact');
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            nom_contact: contact.nom_contact || '',
            fonction_contact: contact.fonction_contact || '',
            tel_contact: contact.tel_contact || '',
            whatsapp_contact: contact.whatsapp_contact || '',
            email_contact: contact.email_contact || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce contact ?')) {
            try {
                await compagniesService.deleteContact(id);
                loadContacts();
            } catch (err) {
                console.error('Erreur suppression contact:', err);
                alert('Impossible de supprimer le contact');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nom_contact: '',
            fonction_contact: '',
            tel_contact: '',
            whatsapp_contact: '',
            email_contact: ''
        });
        setEditingContact(null);
        setIsFormOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="contacts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className="bi bi-people-fill"></i> Contacts - {compagnie?.nom}
                    </h2>
                    <button className="btn-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {!isFormOpen ? (
                        <>
                            <div className="contacts-toolbar">
                                <button
                                    className="btn-new-contact"
                                    onClick={() => setIsFormOpen(true)}
                                >
                                    <i className="bi bi-plus-lg"></i> Nouveau contact
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading-state">
                                    <i className="bi bi-hourglass-split"></i>
                                    <p>Chargement des contacts...</p>
                                </div>
                            ) : error ? (
                                <div className="error-state">
                                    <i className="bi bi-exclamation-triangle"></i>
                                    <p>{error}</p>
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="empty-state">
                                    <i className="bi bi-person-x"></i>
                                    <p>Aucun contact enregistré</p>
                                </div>
                            ) : (
                                <table className="contacts-table">
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Fonction</th>
                                            <th>Téléphone</th>
                                            <th>WhatsApp</th>
                                            <th>Email</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contacts.map(contact => (
                                            <tr key={contact.idcontact_compagnie}>
                                                <td>{contact.nom_contact}</td>
                                                <td>{contact.fonction_contact || '-'}</td>
                                                <td>{contact.tel_contact || '-'}</td>
                                                <td>{contact.whatsapp_contact || '-'}</td>
                                                <td>{contact.email_contact || '-'}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => handleEdit(contact)}
                                                            title="Modifier"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleDelete(contact.idcontact_compagnie)}
                                                            title="Supprimer"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <h3>{editingContact ? 'Modifier le contact' : 'Nouveau contact'}</h3>

                            <div className="form-group">
                                <label>Nom du contact *</label>
                                <input
                                    type="text"
                                    name="nom_contact"
                                    value={formData.nom_contact}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Fonction</label>
                                <input
                                    type="text"
                                    name="fonction_contact"
                                    value={formData.fonction_contact}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input
                                        type="tel"
                                        name="tel_contact"
                                        value={formData.tel_contact}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>WhatsApp</label>
                                    <input
                                        type="tel"
                                        name="whatsapp_contact"
                                        value={formData.whatsapp_contact}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email_contact"
                                    value={formData.email_contact}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    <i className="bi bi-x-lg"></i> Annuler
                                </button>
                                <button type="submit" className="btn-save">
                                    <i className="bi bi-check-lg"></i> Enregistrer
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactsModal;
