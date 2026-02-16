import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import commerciauxService from '../../services/commerciauxService';
import CommercialContracts from './CommercialContracts';
import CommercialFormModal from './CommercialFormModal';
import './Commerciaux.css'; // Reusing existing styles

const CommercialDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [commercial, setCommercial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadCommercialDetails();
        }
    }, [id]);

    const loadCommercialDetails = async () => {
        if (!id) return;
        try {
            console.log("Loading commercial details for ID:", id);
            setLoading(true);
            let decodedId = id;
            try {
                decodedId = decodeURIComponent(id);
            } catch (e) {
                console.error("Error decoding ID:", e);
            }
            console.log("Decoded ID:", decodedId);

            const response = await commerciauxService.getApporteur(decodedId);
            console.log("Commercial data received:", response.data);
            setCommercial(response.data);
        } catch (err) {
            console.error('Erreur chargement commercial:', err);
            // Fallback if 404 or error
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state"><i className="bi bi-hourglass-split"></i> Chargement...</div>;
    if (!commercial) return <div className="error-state">Commercial introuvable</div>;

    return (
        <div className="crm-container"> {/* Reusing CRM container style for padding/layout */}
            {/* Header */}
            <div className="crm-header-strip" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button className="btn-icon-action" onClick={() => navigate('/base/commerciaux')} style={{ background: 'white', color: '#6d4c41' }}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <div>
                    <h1 style={{ margin: 0 }}>{commercial.nom_apporteur}</h1>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                        {commercial.type_apporteur}
                    </span>
                </div>
                <button
                    className="btn-new"
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ marginLeft: 'auto', background: 'white', color: '#6d4c41', border: '1px solid #d7ccc8' }}
                >
                    <i className="bi bi-pencil"></i> Modifier
                </button>
            </div>

            <div className="client-details-main" style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                {/* Sidebar */}
                <div className="client-details-sidebar" style={{ width: '250px', flexShrink: 0 }}>
                    <div className="sidebar-menu" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <button
                            className={`sidebar-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                            style={{ width: '100%', padding: '15px 20px', border: 'none', background: activeTab === 'overview' ? '#efebe9' : 'white', color: activeTab === 'overview' ? '#6d4c41' : '#5d4037', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}
                        >
                            <i className="bi bi-person-badge"></i> Vue d'ensemble
                        </button>
                        <button
                            className={`sidebar-tab ${activeTab === 'contrats' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contrats')}
                            style={{ width: '100%', padding: '15px 20px', border: 'none', background: activeTab === 'contrats' ? '#efebe9' : 'white', color: activeTab === 'contrats' ? '#6d4c41' : '#5d4037', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}
                        >
                            <i className="bi bi-file-text"></i> Contrats apportés
                        </button>
                        <button
                            className={`sidebar-tab ${activeTab === 'paiements' ? 'active' : ''}`}
                            onClick={() => setActiveTab('paiements')}
                            style={{ width: '100%', padding: '15px 20px', border: 'none', background: activeTab === 'paiements' ? '#efebe9' : 'white', color: activeTab === 'paiements' ? '#6d4c41' : '#5d4037', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}
                        >
                            <i className="bi bi-cash-coin"></i> Paiements
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="client-details-content" style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <h2 style={{ fontSize: '1.2rem', color: '#6d4c41', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Informations générales</h2>
                            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="info-item">
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '5px' }}>Code Apporteur</label>
                                    <div style={{ fontWeight: '500' }}>{commercial.code_apporteur}</div>
                                </div>
                                <div className="info-item">
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '5px' }}>Type</label>
                                    <div style={{ fontWeight: '500' }}>{commercial.type_apporteur}</div>
                                </div>
                                <div className="info-item">
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '5px' }}>Téléphone</label>
                                    <div style={{ fontWeight: '500' }}>{commercial.telephone || '-'}</div>
                                </div>
                                <div className="info-item">
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '5px' }}>Email</label>
                                    <div style={{ fontWeight: '500' }}>{commercial.email || '-'}</div>
                                </div>
                                <div className="info-item">
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '5px' }}>Adresse</label>
                                    <div style={{ fontWeight: '500' }}>{commercial.adresse || '-'}</div>
                                </div>
                                <div className="info-item">
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '5px' }}>Fréquence de paiement</label>
                                    <div style={{ fontWeight: '500' }}>{commercial.frequence_paiement || '-'}</div>
                                </div>
                                {commercial.nif_rccm && (
                                    <div className="info-item">
                                        <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '5px' }}>NIF / RCCM</label>
                                        <div style={{ fontWeight: '500' }}>{commercial.nif_rccm}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contrats' && commercial && (
                        <CommercialContracts apporteurCode={commercial.code_apporteur} />
                    )}

                    {activeTab === 'paiements' && (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                            <i className="bi bi-cone-striped" style={{ fontSize: '3rem', marginBottom: '20px', display: 'block' }}></i>
                            <h3>Non disponible</h3>
                            <p>Le module de paiements est en cours de développement.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Edit Modal */}
            <CommercialFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={() => {
                    setIsEditModalOpen(false);
                    loadCommercialDetails();
                }}
                apporteur={commercial}
                defaultType={commercial.type_apporteur === 'Entreprise' ? 'entreprise' : 'particulier'}
            />
        </div>
    );
};

export default CommercialDetails;
