import React from 'react';
import { CommunityRating } from '../../utils/types';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import './RatingWall.css';

/**
 * Props for the RatingWall component.
 */
interface Props {
    /**
     * An array of ratings to display on the wall.
     */
    ratings: CommunityRating[];
}

/**
 * RatingWall Component
 *
 * Displays a list (wall) of recent ratings and reviews from the community.
 * Handles the empty state if no ratings are provided.
 *
 * @param props - Component properties.
 */
export const RatingWall: React.FC<Props> = ({ ratings }) => {

    const { currentItems, currentPage, totalPages, goToPage } = usePagination(ratings, 5);
    
    if (ratings.length === 0) {
        return (
            <div className="empty-wall-message" style={{textAlign: 'center', color: '#888', marginTop: '2rem'}}>
                <p>Jeszcze nikt nie dodał recenzji. Bądź pierwszy!</p>
            </div>
        );
    }

    return (
        <div className="rating-wall-container">
            <h3 className="wall-title">Ostatnie aktywności</h3>
            
            <div className="dash-column">
                {currentItems.map(rating => (
                    <div key={rating.id} className="card rating-card">
                        <div className="rating-header">
                            <div className="user-avatar-medium">{rating.userAvatarInitials}</div>
                            <div className="rating-meta">
                                <div>
                                    <span className="username">{rating.username}</span>
                                    <span className="action-muted"> ocenił(a) </span>
                                    <span className="book-highlight">{rating.bookTitle}</span>
                                </div>
                                <span className="rating-date">{new Date(rating.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="rating-stars-display">
                                {"★".repeat(rating.rating)}
                                <span className="stars-empty">{"★".repeat(5 - rating.rating)}</span>
                            </div>
                        </div>

                        {rating.comment && rating.comment.trim() !== "" && (
                            <div className="rating-body">
                                <p>„{rating.comment}”</p>
                            </div>
                        )}

                        <div className="rating-footer">
                            <span className="author-tag">Autor: {rating.bookAuthor}</span>
                        </div>
                    </div>
                ))}
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={goToPage} 
                />
            </div>
        </div>
    );
};