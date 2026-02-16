import React, { useState, useEffect } from 'react';
import * as ContratsService from '../../../services/contrats'; // Import all named exports
import CompagniesService from '../../../services/compagnies';

const ContractSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [compagnies, setCompagnies] = useState([]);
    const [filterCompagnie, setFilterCompagnie] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setContracts([]);
            setFilterCompagnie('');
            setCurrentPage(1); // Reset page
            fetchCompagnies();
            handleSearch(null, 1); // Load initial data page 1
        }
    }, [isOpen]);

    const fetchCompagnies = async () => {
        try {
            const response = await CompagniesService.getCompagnies();
            // Handle both structure types just in case
            setCompagnies(response.results || response.data || response || []);
        } catch (error) {
            console.error("Erreur chargement compagnies", error);
            setCompagnies([]);
        }
    };

    const handleSearch = async (e, page = 1) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const params = {
                page: page,
                page_size: 20 // Explicit page size
            };
            if (searchTerm) params.search = searchTerm;
            if (filterCompagnie) params.Id_compagnie = filterCompagnie;

            const response = await ContratsService.getContrats(params);

            // Handle Paginated Response (Django Rest Framework StandardPagination)
            if (response.results) {
                setContracts(response.results);
                setTotalCount(response.count);
                setTotalPages(Math.ceil(response.count / 20)); // Assuming default page size 20
            } else {
                // Fallback for non-paginated
                setContracts(response || []);
                setTotalCount(response.length || 0);
                setTotalPages(1);
            }
            setCurrentPage(page);
        } catch (error) {
            console.error("Erreur recherche contrats", error);
            setContracts([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            handleSearch(null, newPage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content modal-large animate-fade-in" style={{ width: '1000px', maxWidth: '95vw', padding: 0, overflow: 'hidden' }}>
                <div className="crm-header-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Sélectionner un contrat</h2>
                    <button
                        className="btn-icon-action close-btn-animated"
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                        title="Fermer"
                    >
                        <i className="bi bi-x-lg" style={{ fontSize: '1.2rem' }}></i>
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '20px' }}>
                    {/* Search Bar */}
                    <form onSubmit={(e) => handleSearch(e, 1)} className="search-bar-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <div className="search-group" style={{ flex: 1 }}>
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Rechercher une police / souscripteur"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <select
                            className="filter-select"
                            value={filterCompagnie}
                            onChange={(e) => {
                                setFilterCompagnie(e.target.value);
                                // Trigger search immediately on change? User didn't ask but usually better UX. 
                                // User asked for no search button, so explicit trigger needed if no button.
                                // Actually, standard form behavior requires submit. 
                                // I will trigger manual search on change to be safe since I removed the button
                            }}
                            style={{ width: '250px' }}
                        >
                            <option value="">Compagnie (Toutes)</option>
                            {compagnies.map(c => (
                                <option key={c.id_compagnie} value={c.id_compagnie}>
                                    {c.nom_compagnie}
                                </option>
                            ))}
                        </select>
                        {/* Removed explicit Search Button as requested */}
                        <button type="button" className="btn-text-clear" onClick={() => {
                            setSearchTerm('');
                            setFilterCompagnie('');
                            // Quick hack to reset search
                            setTimeout(() => handleSearch(null, 1), 0);
                        }}>
                            <i className="bi bi-arrow-clockwise"></i> Réinitialiser
                        </button>
                        {/* Hidden submit button to allow Enter key to submit form */}
                        <button type="submit" style={{ display: 'none' }}></button>
                    </form>

                    {/* Results Table */}
                    <div className="table-container" style={{ height: '350px', overflowY: 'auto', border: '1px solid #eee' }}>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Recherche en cours...</p>
                            </div>
                        ) : contracts.length > 0 ? (
                            <table className="attestations-table" style={{ width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                    <tr>
                                        <th>N° Police</th>
                                        <th>N° Avenant</th>
                                        <th>Date</th>
                                        <th>Produit</th>
                                        <th>Compagnie</th>
                                        <th>Client</th>
                                        <th>Effet</th>
                                        <th>Échéance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.map(contract => (
                                        <tr
                                            key={contract.id_contrat}
                                            onClick={() => onSelect(contract)}
                                            style={{ cursor: 'pointer' }}
                                            className="hover-row"
                                        >
                                            <td style={{ fontWeight: 'bold' }}>{contract.numPolice || "-"}</td>
                                            <td>{contract.numAvenant}</td>
                                            <td>{contract.date_enreg ? new Date(contract.date_enreg).toLocaleDateString() : "-"}</td>
                                            <td>{contract.nom_produit}</td>
                                            <td style={{ fontWeight: '600' }}>{contract.nom_compagnie}</td>
                                            <td>{contract.nom_client_complet}</td>
                                            <td>{contract.date_effet ? new Date(contract.date_effet).toLocaleDateString() : "-"}</td>
                                            <td>{contract.Date_echeance ? new Date(contract.Date_echeance).toLocaleDateString() : "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <i className="bi bi-search" style={{ fontSize: '2rem', color: '#ccc' }}></i>
                                <p>Aucun contrat trouvé</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-container" style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 'none', padding: '0' }}>
                        <span className="pagination-info">
                            {totalCount} contrat(s) trouvé(s) - Page {currentPage} sur {totalPages}
                        </span>
                        <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                            <button
                                className="page-btn"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <button
                                className="page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractSearchModal;
