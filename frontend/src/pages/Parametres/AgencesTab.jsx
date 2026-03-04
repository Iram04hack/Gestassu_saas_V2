import React, { useState, useEffect, useCallback } from 'react';
import CoreService from '../../services/core';
import AgenceFormModal from './AgenceFormModal';

const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

const ITEMS_PER_PAGE = 10;

const AgencesTab = () => {
    const [agences, setAgences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgence, setEditingAgence] = useState(null);

    const loadAgences = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CoreService.getAgences();
            setAgences(toArray(data));
        } catch (err) {
            setError('Impossible de charger les agences.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAgences();
    }, [loadAgences]);

    // Filter
    const filtered = agences.filter(a => {
        const q = searchTerm.toLowerCase();
        return (
            (a.nomagence || '').toLowerCase().includes(q) ||
            (a.codeagence || '').toLowerCase().includes(q) ||
            (a.emailagence || '').toLowerCase().includes(q)
        );
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleAdd = () => {
        setEditingAgence(null);
        setIsModalOpen(true);
    };

    const handleEdit = (agence) => {
        setEditingAgence(agence);
        setIsModalOpen(true);
    };

    const handleDelete = async (agence) => {
        if (!window.confirm(`Supprimer l'agence "${agence.nomagence}" ?`)) return;
        try {
            await CoreService.deleteAgence(agence.codeagence);
            await loadAgences();
        } catch (err) {
            alert('Erreur lors de la suppression.');
            console.error(err);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingAgence) {
                await CoreService.updateAgence(editingAgence.codeagence, formData);
            } else {
                await CoreService.createAgence(formData);
            }
            setIsModalOpen(false);
            await loadAgences();
        } catch (err) {
            const msg = err.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : 'Erreur lors de l\'enregistrement.';
            alert(msg);
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="parametres-loading">
                <div className="spinner-border spinner-border-sm" role="status" />
                Chargement des agences...
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="parametres-error">
                    <i className="bi bi-exclamation-circle"></i> {error}
                </div>
            )}

            <div className="agences-toolbar">
                <div className="agences-search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <button className="btn-add-agence" onClick={handleAdd}>
                    <i className="bi bi-plus-lg"></i>
                    Nouvelle agence
                </button>
            </div>

            <div className="agences-table-wrapper">
                <table className="agences-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Nom</th>
                            <th>Adresse</th>
                            <th>Téléphone</th>
                            <th>Email</th>
                            <th style={{ width: 80 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="agences-empty">
                                        <i className="bi bi-building" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
                                        {searchTerm ? 'Aucune agence trouvée pour cette recherche.' : 'Aucune agence enregistrée.'}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map(agence => (
                                <tr key={agence.codeagence}>
                                    <td><strong>{agence.codeagence}</strong></td>
                                    <td>{agence.nomagence || '-'}</td>
                                    <td>{agence.adresseagence || '-'}</td>
                                    <td>{agence.telagence || '-'}</td>
                                    <td>{agence.emailagence || '-'}</td>
                                    <td>
                                        <div className="agence-actions">
                                            <button
                                                className="btn-edit-agence"
                                                title="Modifier"
                                                onClick={() => handleEdit(agence)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn-delete-agence"
                                                title="Supprimer"
                                                onClick={() => handleDelete(agence)}
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

            {totalPages > 1 && (
                <div className="agences-pagination">
                    <button
                        className="agences-page-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`agences-page-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="agences-page-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
            )}

            <AgenceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                agence={editingAgence}
            />
        </>
    );
};

export default AgencesTab;
