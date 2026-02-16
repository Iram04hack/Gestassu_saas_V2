import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CommerciauxList from './CommerciauxList';
import CommercialFormModal from './CommercialFormModal';
import CommissionModal from './CommissionModal';
import commerciauxService from '../../services/commerciauxService';
import './Commerciaux.css';

const Commerciaux = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('particuliers');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
    const [modalType, setModalType] = useState('particulier');
    const [selectedApporteur, setSelectedApporteur] = useState(null);

    // Lifted State for Apporteurs
    const [apporteurs, setApporteurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debounce search term and reload on tab changes
    useEffect(() => {
        const timer = setTimeout(() => {
            loadApporteurs();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, activeTab]);

    const loadApporteurs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                search: searchTerm
            };

            const response = await commerciauxService.getApporteurs(params);

            // Extract data array from response
            let data = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                data = response.data.results;
            } else if (response.data && typeof response.data === 'object') {
                data = Object.values(response.data);
            }

            // Filter by type based on active tab
            let filtered = data;
            if (activeTab === 'particuliers') {
                filtered = data.filter(a => a.type_apporteur !== 'Entreprise');
            } else {
                filtered = data.filter(a => a.type_apporteur === 'Entreprise');
            }

            setApporteurs(filtered);
        } catch (err) {
            console.error('Erreur lors du chargement des apporteurs:', err);
            setError('Impossible de charger les commerciaux. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm]);

    const handleDeleteApporteur = async (code) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce commercial ?')) {
            try {
                await commerciauxService.deleteApporteur(code);
                loadApporteurs();
            } catch (err) {
                console.error('Erreur lors de la suppression:', err);
                alert('Impossible de supprimer le commercial. Veuillez réessayer.');
            }
        }
    };

    const handleOpenModal = () => {
        setSelectedApporteur(null);
        setModalType(activeTab === 'particuliers' ? 'particulier' : 'entreprise');
        setIsModalOpen(true);
    };

    const handleEditApporteur = (apporteur) => {
        setSelectedApporteur(apporteur);
        setModalType(apporteur.type_apporteur === 'Entreprise' ? 'entreprise' : 'particulier');
        setIsModalOpen(true);
    };

    const handleDetails = (apporteur) => {
        // Encode ID to handle slashes or special chars
        const encodedId = encodeURIComponent(apporteur.code_apporteur);
        navigate(`/base/commerciaux/${encodedId}`);
    };

    const handleCommissionConfig = (apporteur) => {
        setSelectedApporteur(apporteur);
        setIsCommissionModalOpen(true);
    };

    const handleSaveApporteur = () => {
        setIsModalOpen(false);
        setSelectedApporteur(null);
        loadApporteurs();
    };

    return (
        <div className="crm-container">
            {/* Header Strip */}
            <div className="crm-header-strip">
                <h1>Gestion des Commerciaux</h1>
            </div>

            {/* Toolbar with Search, Tabs and Actions */}
            <div className="crm-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher un commercial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="crm-actions-group">
                    <div className="tab-switcher">
                        <button
                            className={`tab-btn ${activeTab === 'particuliers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('particuliers')}
                        >
                            Particuliers
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'entreprises' ? 'active' : ''}`}
                            onClick={() => setActiveTab('entreprises')}
                        >
                            Entreprises
                        </button>
                    </div>

                    <button className="btn-icon-action" title="Filtrer">
                        <i className="bi bi-funnel"></i>
                    </button>

                    <button className="btn-icon-action" title="Actualiser" onClick={loadApporteurs}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>

                    <button className="btn-new" onClick={handleOpenModal}>
                        <i className="bi bi-person-plus-fill"></i> Nouveau Commercial
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                    <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                    <p>Chargement des commerciaux...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                    <p>{error}</p>
                    <button className="btn-new" onClick={loadApporteurs} style={{ marginTop: '16px' }}>
                        Réessayer
                    </button>
                </div>
            ) : (
                <CommerciauxList
                    apporteurs={apporteurs}
                    onDetails={handleDetails}
                    onEdit={handleEditApporteur}
                    onDelete={handleDeleteApporteur}
                    onCommissionConfig={handleCommissionConfig}
                />
            )}

            {/* Modals */}
            <CommercialFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedApporteur(null);
                }}
                onSave={handleSaveApporteur}
                apporteur={selectedApporteur}
                defaultType={modalType}
            />

            <CommissionModal
                isOpen={isCommissionModalOpen}
                onClose={() => {
                    setIsCommissionModalOpen(false);
                    setSelectedApporteur(null);
                }}
                apporteur={selectedApporteur}
            />
        </div>
    );
};

export default Commerciaux;
