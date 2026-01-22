import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { Importer } from '../Importer';

interface Props {
    streak: number;
    level: string;
    onDataUpdate?: () => void;
}

export const UserCard: React.FC<Props> = ({ streak, level, onDataUpdate }) => {
    const { user } = useAuth();
    const [showImportModal, setShowImportModal] = useState(false);

    return (
        <>
            <div className="card user-card">
                <div className="user-info">
                    <div className="avatar">
                        {user?.displayName?.substring(0, 2).toUpperCase() || "JA"}
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
                            style={{position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)'}}
                        >
                            ×
                        </button>
                        <Importer onSuccess={() => {
                            if (onDataUpdate) onDataUpdate();
                        }}
                        
                        />
                    </div>
                </div>
            )}
        </>
    );
};