import React, { useEffect, useState } from 'react';
import { RatingForm } from './RatingForm';
import { RatingWall } from './RatingWall';
import { CommunitySidebar } from './CommunitySidebar';
import { CommunityRating } from '../../utils/types';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../axios';
import './CommunityView.css';
import { BackButton } from '../BackButton';

export default function CommunityView() {
    const [ratings, setRatings] = useState<CommunityRating[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const initialBook = location.state?.bookToRate || null;

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

    useEffect(() => {
        fetchRatings();
    }, []);

    return (
        <div className="community-view-container">
            <header className="community-header-compact">
                <BackButton />
                <div className="header-titles">
                    <h1>Społeczność</h1>
                    <p>Tablica aktywności i recenzji</p>
                </div>
            </header>

            <div className="community-grid">
                
                <aside className="community-left-col">
                    <div style={{ position: 'sticky', top: '1.5rem' }}>
                        <RatingForm 
                            onRatingAdded={fetchRatings} 
                            initialBook={initialBook} 
                        />
                    </div>
                </aside>

                <main className="community-main-col">
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: '#888'}}>
                            Ładowanie recenzji...
                        </div>
                    ) : (
                        <RatingWall ratings={ratings} />
                    )}
                </main>

                <aside className="community-right-col">
                    <CommunitySidebar variant="static" />
                </aside>

            </div>
        </div>
    );
}