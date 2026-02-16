import React, { useState, useEffect, useCallback } from 'react';
import financesService from '../../../services/financesService';
import TransactionReasonModal from './TransactionReasonModal';

// Reusing CSS from CRM/Commerciaux as they share the same design language
import '../../CRM/CRM.css';

const TransactionReasonsList = () => {
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);

    const loadReasons = useCallback(async () => {
        try {
            setLoading(true);
            const params = { search: searchTerm };
            const response = await financesService.getTypesMouvements(params);

            // Handle array vs paginated response
            const data = Array.isArray(response.data) ? response.data :
                (response.data.results ? response.data.results : []);

            setReasons(data);
            setError(null);
        } catch (err) {
            console.error('Erreur chargement motifs:', err);
            setError('Impossible de charger les motifs.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadReasons();
        }, 500);
        return () => clearTimeout(timer);
    }, [loadReasons]);

    const handleEdit = (reason) => {
        setSelectedReason(reason);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce motif ?')) {
            try {
                await financesService.deleteTypeMouvement(id);
                loadReasons();
            } catch (err) {
                console.error('Erreur suppression:', err);
                alert('Impossible de supprimer le motif.');
            }
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        setSelectedReason(null);
        loadReasons();
    };

    return (
        <div className="crm-container">
            <div className="crm-header-strip">
                <h1>Motifs des transactions financières</h1>
            </div>

            <div className="crm-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher un type mouvement"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="crm-actions-group">
                    <button className="btn-icon-simple" title="Réinitialiser" onClick={() => setSearchTerm('')}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button
                        className="btn-new"
                        onClick={() => { setSelectedReason(null); setIsModalOpen(true); }}
                        style={{ marginLeft: '10px' }}
                    >
                        <i className="bi bi-plus-lg"></i> Ajouter
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                    <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                    <p style={{ marginTop: '10px' }}>Chargement des motifs...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', color: '#ef5350', padding: '40px' }}>
                    <i className="bi bi-exclamation-circle" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                    {error}
                </div>
            ) : (
                <div className="client-list-container">
                    <div className="table-responsive">
                        <table className="client-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Type</th>
                                    <th>Libellé du motif</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reasons.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '60px 20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#a1887f' }}>
                                                <i className="bi bi-inbox" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}></i>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Aucun motif trouvé</span>
                                                <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Cliquez sur "Ajouter" pour créer un nouveau motif.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    reasons.map(reason => (
                                        <tr key={reason.id_type_mvt} className="clickable-row">
                                            <td style={{ textAlign: 'center' }}>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: reason.type_op ? '#4caf50' : '#ef5350',
                                                        color: 'white',
                                                        padding: '5px 10px',
                                                        borderRadius: '4px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {reason.type_op ? 'Crédit' : 'Débit'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '500' }}>{reason.lib_type_mouvement}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                    <button
                                                        className="btn-icon-action"
                                                        onClick={() => handleEdit(reason)}
                                                        title="Modifier"
                                                        style={{ color: '#6d4c41', borderColor: '#d7ccc8' }}
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                    <button
                                                        className="btn-icon-action delete"
                                                        onClick={() => handleDelete(reason.id_type_mvt)}
                                                        title="Supprimer"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <TransactionReasonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                reason={selectedReason}
            />
        </div>
    );
};

export default TransactionReasonsList;
