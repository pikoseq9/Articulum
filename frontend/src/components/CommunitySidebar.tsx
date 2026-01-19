import React, { useEffect, useState } from 'react';
import api from '../axios';
import { CommunityUser } from '../utils/types';
import './CommunitySidebar.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CommunitySidebar: React.FC<Props> = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState<CommunityUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const res = await api.get<CommunityUser[]>('/api/Community/users');
                setUsers(res.data);
            } catch (err) {
                console.error("Błąd pobierania społeczności:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunity();
    }, []);

    return (
        <>
            <div 
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
                onClick={onClose}
            />

            <aside className={`community-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="community-header">
                    <h3>Społeczność</h3>
                    <button className="close-sidebar-btn" onClick={onClose}>×</button>
                </div>

                <div className="users-list">
                    {loading ? (
                        <p className="loading-text">Ładowanie...</p>
                    ) : users.length === 0 ? (
                        <p className="empty-community">Jesteś tu pierwszy!</p>
                    ) : (
                        users.map((u) => (
                            <div key={u.username} className="user-item">
                                <div className="user-avatar-small">
                                    {u.displayName.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{u.displayName}</span>
                                    {u.currentBookTitle ? (
                                        <span className="reading-status">
                                            Czyta <span className="book-highlight">{u.currentBookTitle}</span>
                                        </span>
                                    ) : (
                                        <span className="reading-status">Nic teraz nie czyta</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </>
    );
};