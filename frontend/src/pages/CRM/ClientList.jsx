import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientList = ({ clients, searchTerm, activeTab, onDelete }) => {
    const navigate = useNavigate();
    // Basic Filtering Logic
    // Use clients directly as they are already filtered by the API (server-side search & filtering)
    const filteredClients = clients;

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Show 10 items per page

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="client-list-container">
            <div className="table-responsive">
                <table className="client-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Qualité</th>
                            <th>Nom</th>
                            <th>Adresse</th>
                            <th>Origine</th>
                            <th>Conseiller</th>
                            <th>Contacts</th>
                            <th>Enreg. par</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((client) => (
                                <tr key={client.id}>
                                    <td>
                                        <span className={`badge ${client.type.toLowerCase()}`}>
                                            {client.type}
                                        </span>
                                    </td>
                                    <td>{client.qualite}</td>
                                    <td style={{ fontWeight: 600 }}>{client.nom}</td>
                                    <td>{client.adresse}</td>
                                    <td>{client.origine}</td>
                                    <td>{client.conseiller}</td>
                                    <td>
                                        <div className="contact-stack">
                                            {client.contacts.map((contact, idx) => (
                                                <div key={idx} className="contact-item">
                                                    <i className={`bi ${contact.type === 'phone' ? 'bi-telephone-fill' : 'bi-envelope-fill'}`}></i>
                                                    <span>{contact.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>{client.createur}</td>
                                    <td>
                                        <div className="action-buttons-row">
                                            <button
                                                className="btn-details"
                                                onClick={() => navigate(`/crm/client/${client.id}`)}
                                            >
                                                Détails
                                            </button>
                                            <button
                                                className="btn-icon-danger"
                                                onClick={() => onDelete(client.id)}
                                                title="Supprimer"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Aucun client trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredClients.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredClients.length)} sur {filteredClients.length} éléments
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientList;
