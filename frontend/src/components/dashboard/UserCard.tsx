import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { Importer } from '../Importer';

interface Props {
    streak: number;
    level: string;
    onDataUpdate?: () => void;
}

/**
 * UserCard Component
 * * Displays a summary of the current user's profile on the dashboard,
 * including their avatar, display name, reading level, and streak.
 * Also provides quick actions like navigating to the profile or importing data.
 */
export const UserCard: React.FC<Props> = ({ streak, level, onDataUpdate }) => {
    const { user } = useAuth();
    const [showImportModal, setShowImportModal] = useState(false);

    /**
     * Resolves the full URL for the user's avatar.
     * Handles both absolute URLs (e.g., external providers) and relative paths 
     * stored in the local backend.
     */
    const getAvatarSrc = (url: string) => {
        if (url.startsWith('http')) return url;
        // Adjust the base URL matches your API configuration
        return `http://localhost:5269${url}`;
    };

    return (
        <>
            <div className="card user-card">
                <div className="user-info">
                    <div className="avatar">
                        {user?.avatarUrl ? (
                            <img 
                                src={getAvatarSrc(user.avatarUrl)} 
                                alt={user.displayName}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    display: 'block'
                                }} 
                            />
                        ) : (
                            <span>
                                {user?.displayName?.substring(0, 2).toUpperCase() || "ME"}
                            </span>
                        )}
                    </div>
                    
                    <div>
                        <h3>{user?.displayName}</h3>
                        <span className="badge">Poziom: {level}</span>
                    </div>
                </div>
                
                <div className="streak-info">
                    Aktywność: <strong>{streak} dni z rzędu 🔥</strong>
                </div>

                <div className="user-card-actions">
                    <Link to="/profile" className="link-text">Twój profil &rarr;</Link>
                    
                    <button 
                        className="btn-import-small" 
                        onClick={() => setShowImportModal(true)}
                        title="Importuj bibliotekę z pliku CSV"
                    >
                        Import Goodreads
                    </button>
                </div>
            </div>

            {showImportModal && (
                <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
                        <button 
                            className="btn-close" 
                            onClick={() => setShowImportModal(false)}
                            style={{
                                position: 'absolute', 
                                top: '15px', 
                                right: '15px', 
                                border: 'none', 
                                background: 'transparent', 
                                fontSize: '1.5rem', 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)'
                            }}
                        >
                            ×
                        </button>
                        <Importer onSuccess={() => {
                            if (onDataUpdate) onDataUpdate();
                            setShowImportModal(false);
                        }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};