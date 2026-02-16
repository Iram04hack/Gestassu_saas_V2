import React, { useState, useEffect } from 'react';
import AttestationsService from '../../../services/attestationsService';

const TrackingModal = ({ isOpen, onClose, attestationId }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && attestationId) {
            fetchTracking();
        }
    }, [isOpen, attestationId]);

    const fetchTracking = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await AttestationsService.getTracking(attestationId);
            setTrackingData(response.data);
        } catch (err) {
            console.error("Erreur lors du tracking", err);
            setError(err.response?.data?.error || "Impossible de récupérer l'historique de cette attestation.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStatusLabel = (code) => {
        switch (parseInt(code)) {
            case 0: return "Neutre";
            case 1: return "Utilisée";
            case 2: return "Endommagée";
            default: return "Inconnu";
        }
    };

    return (
        <div className="modal-overlay tracking-modal-overlay" onClick={onClose}>
            <div className="modal-content tracking-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="modal-header tracking-header">
                    <div className="header-title-group">
                        <i className="bi bi-clock-history"></i>
                        <h2>Tracking Attestation</h2>
                    </div>
                    <button className="btn-close-minimal" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body tracking-body">
                    {loading ? (
                        <div className="tracking-loader">
                            <div className="premium-spinner"></div>
                            <p>Récupération de l'historique...</p>
                        </div>
                    ) : error ? (
                        <div className="tracking-error">
                            <i className="bi bi-exclamation-triangle"></i>
                            <p>{error}</p>
                        </div>
                    ) : trackingData ? (
                        <>
                            <div className="tracking-info-grid">
                                <div className="info-item">
                                    <span className="label">N° :</span>
                                    <span className="value bold">{trackingData.num}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Type :</span>
                                    <span className="value bold">{trackingData.type_label}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Etat :</span>
                                    <span className="value bold">{getStatusLabel(trackingData.etat)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Agence :</span>
                                    <span className="value bold">{trackingData.agence || "-"}</span>
                                </div>
                            </div>

                            <div className="tracking-table-container">
                                <table className="tracking-table">
                                    <thead>
                                        <tr>
                                            <th>Police</th>
                                            <th>Client</th>
                                            <th>Véhicule</th>
                                            <th>Agence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trackingData.history && trackingData.history.length > 0 ? (
                                            trackingData.history.map((h, i) => (
                                                <tr key={i}>
                                                    <td>{h.police}</td>
                                                    <td>{h.client}</td>
                                                    <td>{h.vehicule}</td>
                                                    <td>{h.agence}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center empty-tracking">
                                                    Aucun mouvement enregistré pour cette attestation.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default TrackingModal;
