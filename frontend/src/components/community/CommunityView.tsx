import React, { useEffect, useState } from 'react';
import { RatingForm } from './RatingForm';
import { RatingWall } from './RatingWall';
import { CommunitySidebar } from './CommunitySidebar';
import { CommunityRating } from '../../utils/types';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../axios';
import './CommunityView.css';

/**
 * CommunityView Component
 *
 * The main page for the community feature. It displays the community feed,
 * including a form to add new ratings (`RatingForm`) and a wall of recent ratings (`RatingWall`).
 * It also includes a static version of the `CommunitySidebar` on the right.
 *
 * @returns A React functional component representing the community page.
 */
export default function CommunityView() {
    const [ratings, setRatings] = useState<CommunityRating[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const initialBook = location.state?.bookToRate || null;

    /**
     * Fetches the list of all community ratings from the backend.
     * Used on initial load and after a new rating is submitted.
     */
    const fetchRatings = async () => {
        try {
            const res = await api.get<CommunityRating[]>('/api/Community/ratings');
            setRatings(res.data);
        } catch (err) {
            console.error("Error fetching ratings:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchRatings();
    }, []);

    return (
        <div className="community-view-container">
            <header className="dash-header">
                <div className="header-greeting">
                    {/* Navigation button to return to the Dashboard */}
                    <button 
                        className="back-btn"
                        onClick={() => navigate('/')}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-muted)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        &larr; Wróć
                    </button>

                    <h1>Społeczność Czytelników</h1>
                    <p>Zobacz co czytają i myślą inni.</p>
                </div>
            </header>

            <div className="community-grid">
                {/* Main Content Column: Form + Feed */}
                <main className="community-main-col">
                    <RatingForm onRatingAdded={fetchRatings} initialBook={initialBook} />
                    
                    {loading ? (
                        <p style={{color: '#888'}}>Ładowanie recenzji...</p>
                    ) : (
                        <RatingWall ratings={ratings} />
                    )}
                </main>

                {/* Sidebar Column: Static User List */}
                <aside className="community-sidebar-col">
                    <CommunitySidebar variant="static" />
                </aside>
            </div>
        </div>
    );
}