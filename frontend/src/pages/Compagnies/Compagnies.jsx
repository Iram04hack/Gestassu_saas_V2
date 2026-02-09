import React, { useState } from 'react';
import './Compagnies.css';
import CompagnieFormModal from './CompagnieFormModal';

const Compagnies = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dummy Data for Companies (Simulating Database)
    const [compagnies, setCompagnies] = useState([]);

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const filteredCompagnies = compagnies.filter(comp =>
        comp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.numero.includes(searchTerm)
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCompagnies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCompagnies.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleSaveCompagnie = (newCompagnie) => {
        setCompagnies([...compagnies, { ...newCompagnie, id: Date.now(), contacts: 0 }]); // Add to top or bottom?
    };

    return (
        <div className="compagnies-container">
            <div className="compagnies-header-strip">
                <h1>Liste des compagnies</h1>
            </div>

            <div className="compagnies-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher une compagnie"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="actions-group">
                    <button className="btn-icon-action" title="Filtrer">
                        <i className="bi bi-funnel"></i>
                    </button>
                    <button className="btn-icon-action" title="Actualiser">
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button className="btn-new" onClick={() => setIsModalOpen(true)}>
                        <i className="bi bi-plus-lg"></i> Nouvelle compagnie
                    </button>
                </div>
            </div>

            <div className="compagnies-table-container">
                <table className="compagnies-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>Logo</th>
                            <th style={{ width: '80px' }}>Numéro</th>
                            <th>Nom compagnie</th>
                            <th>Adresse</th>
                            <th>Contacts</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(comp => (
                            <tr key={comp.id}>
                                <td><div className="logo-placeholder">{comp.nom.substring(0, 2).toUpperCase()}</div></td>
                                <td>{comp.numero}</td>
                                <td style={{ fontWeight: '700' }}>{comp.nom}</td>
                                <td className="address-cell">
                                    {comp.adresse}
                                    <div className="contact-mini">
                                        <i className="bi bi-telephone-fill"></i> {comp.phone}
                                        {comp.email && <><br /><i className="bi bi-envelope-fill"></i> {comp.email}</>}
                                    </div>
                                </td>
                                <td>
                                    <span className="contact-badge">{comp.contacts} Contacts <i className="bi bi-caret-down-fill"></i></span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-action pill">Compte courant</button>
                                        <button className="btn-action pill">Accessoires</button>
                                        <button className="btn-action pill">Modifier</button>
                                        <button className="btn-action pill delete">Supprimer</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredCompagnies.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredCompagnies.length)} sur {filteredCompagnies.length} éléments
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

            <CompagnieFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCompagnie}
            />
        </div>
    );
};

export default Compagnies;
