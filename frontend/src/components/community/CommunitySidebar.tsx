import React, { useEffect, useState } from 'react';
import api from '../../axios';
import { CommunityUser } from '../../utils/types';
import './CommunitySidebar.css';

/**
 * Props for the CommunitySidebar component.
 */
interface Props {
  /**
   * Indicates whether the sidebar is currently open.
   * Relevant primarily when `variant` is set to 'drawer'.
   */
  isOpen?: boolean;

  /**
   * Callback function to close the sidebar.
   * Relevant primarily when `variant` is set to 'drawer'.
   */
  onClose?: () => void;

  /**
   * Determines the display mode of the sidebar.
   * - 'drawer': Sidebar acts as an off-canvas overlay (default).
   * - 'static': Sidebar is rendered as a static block within the layout.
   */
  variant?: 'drawer' | 'static';
}

/**
 * CommunitySidebar Component
 *
 * Displays a list of community users and their current reading status.
 * Can be rendered as a sliding drawer or a static panel depending on the `variant` prop.
 *
 * @param props - Component properties.
 * @returns A React functional component.
 */
export const CommunitySidebar: React.FC<Props> = ({ 
    isOpen = false, 
    onClose, 
    variant = 'drawer' 
}) => {
    const [users, setUsers] = useState<CommunityUser[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * Fetches the list of community users from the API on component mount.
     */
    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const res = await api.get<CommunityUser[]>('/api/Community/users');
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching community users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunity();
    }, []);

    // Determine CSS classes based on the display variant
    const sidebarClass = variant === 'drawer' 
        ? `community-sidebar drawer ${isOpen ? 'open' : ''}`
        : 'community-sidebar static';

    return (
        <>
            {/* Render overlay only in 'drawer' mode */}
            {variant === 'drawer' && (
                <div 
                    className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
                    onClick={onClose}
                />
            )}

            <aside className={sidebarClass}>
                <div className="community-header">
                    <h3>Społeczność</h3>
                    {/* Render close button only in 'drawer' mode */}
                    {variant === 'drawer' && (
                        <button className="close-sidebar-btn" onClick={onClose}>×</button>
                    )}
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