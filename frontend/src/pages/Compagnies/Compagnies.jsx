import React, { useState, useEffect } from 'react';
import './Compagnies.css';
import CompagnieFormModal from './CompagnieFormModal';
import ContactsModal from './ContactsModal';
import CompteCompagnieModal from './CompteCompagnieModal';
import AccessoiresModal from './AccessoiresModal';
import CompagnieFilters from './CompagnieFilters';
import compagniesService from '../../services/compagnies';

const Compagnies = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompagnie, setEditingCompagnie] = useState(null);

    // Modal states
    const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
    const [isCompteModalOpen, setIsCompteModalOpen] = useState(false);
    const [isAccessoiresModalOpen, setIsAccessoiresModalOpen] = useState(false);
    const [selectedCompagnie, setSelectedCompagnie] = useState(null);

    // Filter states
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        nom: '',
        numero: '',
        adresse: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({
        nom: '',
        numero: '',
        adresse: ''
    });

    // State for Companies
    const [compagnies, setCompagnies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les compagnies depuis l'API
    useEffect(() => {
        loadCompagnies();
    }, []);

    const loadCompagnies = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await compagniesService.getCompagnies();

            // Transformer les données de l'API pour correspondre au format attendu
            const transformedCompagnies = response.results ? response.results.map(comp => ({
                id: comp.id_compagnie,
                numero: comp.codification_compagnie || '-',
                nom: comp.nom_compagnie || '-',
                adresse: comp.adresse_compagnie || '-',
                telephone: comp.tel_compagnie || '-',
                email: comp.email_compagnie || '-',
                logo: comp.url_logo || comp.logo || null,
                contacts: comp.contacts_count || 0, // Utiliser le comptage du backend
                details: comp
            })) : [];

            setCompagnies(transformedCompagnies);
        } catch (err) {
            console.error('Erreur lors du chargement des compagnies:', err);
            setError('Impossible de charger les compagnies. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredCompagnies = compagnies.filter(comp => {
        // Search term filter
        const matchesSearch = comp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.numero.includes(searchTerm);

        // Advanced filters
        const matchesNom = !appliedFilters.nom ||
            comp.nom.toLowerCase().includes(appliedFilters.nom.toLowerCase());
        const matchesNumero = !appliedFilters.numero ||
            comp.numero.includes(appliedFilters.numero);
        const matchesAdresse = !appliedFilters.adresse ||
            comp.adresse.toLowerCase().includes(appliedFilters.adresse.toLowerCase());

        return matchesSearch && matchesNom && matchesNumero && matchesAdresse;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCompagnies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCompagnies.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleSaveCompagnie = (newCompagnie) => {
        loadCompagnies(); // Reload list to get sorted/updated data
    };

    const handleDeleteCompagnie = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette compagnie ?')) {
            try {
                await compagniesService.deleteCompagnie(id);
                loadCompagnies();
            } catch (err) {
                console.error('Erreur lors de la suppression:', err);
                alert('Impossible de supprimer la compagnie.');
            }
        }
    };

    const handleOpenContacts = (compagnie) => {
        setSelectedCompagnie(compagnie);
        setIsContactsModalOpen(true);
    };

    const handleOpenCompte = (compagnie) => {
        setSelectedCompagnie(compagnie);
        setIsCompteModalOpen(true);
    };

    const handleOpenAccessoires = (compagnie) => {
        setSelectedCompagnie(compagnie);
        setIsAccessoiresModalOpen(true);
    };

    const handleEditCompagnie = (compagnie) => {
        setEditingCompagnie(compagnie.details);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompagnie(null);
    };

    const handleApplyFilters = () => {
        setAppliedFilters({ ...filters });
        setIsFiltersOpen(false);
        setCurrentPage(1); // Reset to first page
    };

    const handleResetFilters = () => {
        const emptyFilters = { nom: '', numero: '', adresse: '' };
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setIsFiltersOpen(false);
        setCurrentPage(1);
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

                <div className="actions-group" style={{ position: 'relative' }}>
                    <button
                        className="btn-icon-action"
                        title="Filtrer"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    >
                        <i className="bi bi-funnel"></i>
                    </button>
                    <button className="btn-icon-action" title="Actualiser" onClick={loadCompagnies}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button className="btn-new" onClick={() => {
                        setEditingCompagnie(null);
                        setIsModalOpen(true);
                    }}>
                        <i className="bi bi-plus-lg"></i> Nouvelle compagnie
                    </button>

                    <CompagnieFilters
                        filters={filters}
                        setFilters={setFilters}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                        isOpen={isFiltersOpen}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                    <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                    <p>Chargement des compagnies...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                    <p>{error}</p>
                    <button className="btn-new" onClick={loadCompagnies} style={{ marginTop: '16px' }}>
                        Réessayer
                    </button>
                </div>
            ) : (
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
                                        <span className="contact-badge" onClick={() => handleOpenContacts(comp)} style={{ cursor: 'pointer' }}>{comp.contacts} Contacts <i className="bi bi-caret-down-fill"></i></span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-action pill" onClick={() => handleOpenCompte(comp)}>Compte courant</button>
                                            <button className="btn-action pill" onClick={() => handleOpenAccessoires(comp)}>Accessoires</button>
                                            <button className="btn-action pill" onClick={() => handleEditCompagnie(comp)}>Modifier</button>
                                            <button
                                                className="btn-action pill delete"
                                                onClick={() => handleDeleteCompagnie(comp.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && filteredCompagnies.length > 0 && (
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
                onClose={handleCloseModal}
                onSave={handleSaveCompagnie}
                compagnie={editingCompagnie}
            />

            <ContactsModal
                isOpen={isContactsModalOpen}
                onClose={() => setIsContactsModalOpen(false)}
                compagnie={selectedCompagnie}
            />

            <CompteCompagnieModal
                isOpen={isCompteModalOpen}
                onClose={() => setIsCompteModalOpen(false)}
                compagnie={selectedCompagnie}
            />

            <AccessoiresModal
                isOpen={isAccessoiresModalOpen}
                onClose={() => setIsAccessoiresModalOpen(false)}
                compagnie={selectedCompagnie}
            />
        </div>
    );
};

export default Compagnies;
