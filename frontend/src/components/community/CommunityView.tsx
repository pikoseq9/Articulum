import React, { useEffect, useState } from 'react';
import { RatingForm } from './RatingForm';
import { RatingWall } from './RatingWall';
import { CommunitySidebar } from './CommunitySidebar';
import { CommunityRating } from '../../utils/types';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../axios';
import './CommunityView.css';
import { BackButton } from '../BackButton';

/**
 * CommunityView Component
 * * Acts as the main container and controller for the social/community section of the application.
 * It implements a responsive 3-column grid layout and orchestrates data synchronization 
 * between the submission form and the activity feed.
 * * Architecture:
 * - Manages the `ratings` state fetched from the backend.
 * - Handles the "Rate this book" navigation flow via `location.state`.
 * - Composes three main sub-components: `RatingForm`, `RatingWall`, and `CommunitySidebar`.
 */
export default function CommunityView() {
    const [ratings, setRatings] = useState<CommunityRating[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Retrieves the book object passed via router state if the user navigated 
     * here from a specific book's details page (intent to rate).
     */
    const initialBook = location.state?.bookToRate || null;

    /**
     * Asynchronously fetches the latest community ratings from the API.
     * This function is passed down to `RatingForm` to trigger a feed refresh
     * immediately after a new rating is submitted.
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

    // Initial data fetch on component mount
    useEffect(() => {
        fetchRatings();
    }, []);

    return (
        <div className="community-view-container">
            {/* Header Section: Contains navigation and page title */}
            <header className="community-header-compact">
                <BackButton />
                <div className="header-titles">
                    <h1>Społeczność</h1>
                    <p>Tablica aktywności i recenzji</p>
                </div>
            </header>

            <div className="community-grid">
                
                {/* LEFT COLUMN: Submission Area
                  Contains the `RatingForm`. It uses sticky positioning to remain 
                  visible while scrolling the feed.
                */}
                <aside className="community-left-col">
                    <div style={{ position: 'sticky', top: '1.5rem' }}>
                        {/* RatingForm: 
                          - Handles user input for new reviews.
                          - Accepts `initialBook` to pre-fill data.
                          - Triggers `fetchRatings` on success to update the wall.
                        */}
                        <RatingForm 
                            onRatingAdded={fetchRatings} 
                            initialBook={initialBook} 
                        />
                    </div>
                </aside>

                {/* CENTER COLUMN: Activity Feed
                  Contains the `RatingWall` which displays the list of reviews.
                  Handles the loading state presentation.
                */}
                <main className="community-main-col">
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: '#888'}}>
                            Ładowanie recenzji...
                        </div>
                    ) : (
                        /* RatingWall:
                          - Renders the list of `CommunityRating` objects.
                          - Handles pagination and avatar rendering internally.
                        */
                        <RatingWall ratings={ratings} />
                    )}
                </main>

                {/* RIGHT COLUMN: User List
                  Contains the `CommunitySidebar` in 'static' mode (always visible).
                  Displays active users to encourage social discovery.
                */}
                <aside className="community-right-col">
                    <CommunitySidebar variant="static" />
                </aside>

            </div>
        </div>
    );
}