import React, { useState, useEffect } from 'react';
import './Produits.css';
import ProduitFormModal from './ProduitFormModal';
import GarantiesModal from './components/GarantiesModal';
import productsService from '../../services/products';
import compagniesService from '../../services/compagnies';

const Produits = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduit, setEditingProduit] = useState(null);
    const [isGarantiesModalOpen, setIsGarantiesModalOpen] = useState(false);
    const [selectedProduitForGaranties, setSelectedProduitForGaranties] = useState(null);

    // State for Products
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [compagnies, setCompagnies] = useState([]);
    const [selectedCompagnie, setSelectedCompagnie] = useState('');
    const [selectedBranche, setSelectedBranche] = useState('');

    // Charger les produits et compagnies depuis l'API
    useEffect(() => {
        loadProduits();
        loadCompagnies();
    }, []);

    const loadProduits = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await productsService.getProducts();

            // Transformer les données de l'API
            const transformedProduits = response.results ? response.results.map(prod => ({
                id: prod.id_produit,
                numero: prod.codification_produit || prod.id_produit,
                libelle: prod.lib_produit || '-',
                compagnie: prod.nom_compagnie || '-',
                branche: prod.branche || '-',
                type_risque: prod.type_risque || '-',
                taux_commission: prod.taux_commission || 0,
                montant_fixe_commission: prod.montant_fixe_commission || 0,
                taux_taxe: prod.taux_taxe || 0,
                frais_gestion: prod.frais_gestion || 0,
                frais_adhesion: prod.frais_adhesion || 0,
                taux_frais_gestion: prod.taux_frais_gestion || 0,
                taux_com_premiere_an: prod.taux_com_premiere_an || 0,
                taux_com_an_suivant: prod.taux_com_an_suivant || 0,
                details: prod
            })) : [];

            setProduits(transformedProduits);
        } catch (err) {
            console.error('Erreur lors du chargement des produits:', err);
            setError('Impossible de charger les produits. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const loadCompagnies = async () => {
        try {
            const response = await compagniesService.getCompagnies();
            setCompagnies(response.results || []);
        } catch (err) {
            console.error('Erreur lors du chargement des compagnies:', err);
        }
    };

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredProduits = produits.filter(prod => {
        const matchesSearch = prod.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prod.numero.toLowerCase().includes(searchTerm.toLowerCase());
        // Fix: Compare with both id_compagnie and nom_compagnie for better filtering
        const matchesCompagnie = !selectedCompagnie ||
            prod.details.Id_compagnie === selectedCompagnie ||
            prod.compagnie === selectedCompagnie;
        const matchesBranche = !selectedBranche || prod.branche === selectedBranche;

        return matchesSearch && matchesCompagnie && matchesBranche;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProduits.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleSaveProduit = () => {
        loadProduits(); // Reload list to get sorted/updated data
    };

    const handleDeleteProduit = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
            try {
                await productsService.deleteProduct(id);
                loadProduits();
            } catch (err) {
                console.error('Erreur lors de la suppression:', err);
                alert('Impossible de supprimer le produit.');
            }
        }
    };

    const handleEditProduit = (produit) => {
        setEditingProduit(produit.details);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduit(null);
    };

    const handleOpenGaranties = (produit) => {
        setSelectedProduitForGaranties(produit.details);
        setIsGarantiesModalOpen(true);
    };

    const handleCloseGaranties = () => {
        setIsGarantiesModalOpen(false);
        setSelectedProduitForGaranties(null);
        loadProduits(); // Refresh counts
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCompagnie('');
        setSelectedBranche('');
        setCurrentPage(1);
    };

    // Get unique branches for filter
    const branches = [...new Set(produits.map(p => p.branche).filter(b => b !== '-'))];

    return (
        <div className="produits-container">
            <div className="produits-header-strip">
                <h1>Liste des produits</h1>
            </div>

            <div className="produits-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher un produit"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters-group">
                    <select
                        value={selectedCompagnie}
                        onChange={(e) => setSelectedCompagnie(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Toutes les compagnies</option>
                        {compagnies.map(comp => (
                            <option key={comp.id_compagnie} value={comp.id_compagnie}>
                                {comp.nom_compagnie}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedBranche}
                        onChange={(e) => setSelectedBranche(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Toutes les branches</option>
                        {branches.map(branche => (
                            <option key={branche} value={branche}>{branche}</option>
                        ))}
                    </select>
                </div>

                <div className="actions-group">
                    <button className="btn-icon-action" title="Réinitialiser" onClick={handleResetFilters}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button className="btn-new" onClick={() => {
                        setEditingProduit(null);
                        setIsModalOpen(true);
                    }}>
                        <i className="bi bi-plus-lg"></i> Nouveau produit
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                    <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                    <p>Chargement des produits...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                    <p>{error}</p>
                    <button className="btn-new" onClick={loadProduits} style={{ marginTop: '16px' }}>
                        Réessayer
                    </button>
                </div>
            ) : (
                <div className="produits-table-container">
                    <table className="produits-table">
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>Numéro</th>
                                <th>Libellé</th>
                                <th>Compagnie</th>
                                <th style={{ width: '120px' }}>Type de risque</th>
                                <th style={{ width: '80px' }}>Tx Com.</th>
                                <th style={{ width: '80px' }}>Fixe Com.</th>
                                <th style={{ width: '80px' }}>Taxe</th>
                                <th style={{ width: '80px' }}>Frais gest.</th>
                                <th style={{ width: '80px' }}>Frais adhés.</th>
                                <th style={{ width: '120px' }}>Garanties</th>
                                <th style={{ width: '180px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                                        <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}></i>
                                        <strong>Aucun produit trouvé</strong>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                                            {searchTerm || selectedCompagnie || selectedBranche
                                                ? 'Essayez de modifier vos critères de recherche ou de filtrage.'
                                                : 'Aucun produit disponible pour le moment.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(prod => (
                                    <tr key={prod.id}>
                                        <td>{prod.numero}</td>
                                        <td style={{ fontWeight: '700' }}>{prod.libelle}</td>
                                        <td>{prod.compagnie}</td>
                                        <td>{prod.type_risque}</td>
                                        <td>{prod.taux_commission}%</td>
                                        <td>{prod.montant_fixe_commission}</td>
                                        <td>{prod.taux_taxe}</td>
                                        <td>{prod.frais_gestion}</td>
                                        <td>{prod.frais_adhesion}</td>
                                        <td>
                                            <button
                                                className="btn-garanties"
                                                onClick={() => handleOpenGaranties(prod)}
                                                title="Gérer les garanties"
                                            >
                                                <i className="bi bi-shield-check"></i> {prod.details.garanties_count || 0} garanties
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-action pill" onClick={() => handleEditProduit(prod)}>
                                                    Modifier
                                                </button>
                                                <button
                                                    className="btn-action pill delete"
                                                    onClick={() => handleDeleteProduit(prod.id)}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && filteredProduits.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredProduits.length)} sur {filteredProduits.length} éléments
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

            <ProduitFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduit}
                produit={editingProduit}
            />

            <GarantiesModal
                show={isGarantiesModalOpen}
                onHide={handleCloseGaranties}
                produit={selectedProduitForGaranties}
            />
        </div>
    );
};

export default Produits;
