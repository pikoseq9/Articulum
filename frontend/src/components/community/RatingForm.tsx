import React, { useState, useEffect } from 'react';
import BookSearch from '../BookSearch';
import { Book } from '../../utils/types';
import api from '../../axios';
import './RatingForm.css';

/**
 * StarSelector Component
 *
 * A helper component to render a row of clickable stars for rating input.
 *
 * @param rating - The current rating value (1-5).
 * @param setRating - Callback to update the rating value.
 */
const StarSelector = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => {
    return (
        <div className="star-selector">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= rating ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

/**
 * Props for the RatingForm component.
 */
interface Props {
    /**
     * Callback function triggered after a rating is successfully submitted.
     * Typically used to refresh the list of ratings in the parent component.
     */
    onRatingAdded: () => void;
    initialBook?: Book | null;
}

/**
 * RatingForm Component
 *
 * A form that allows users to search for a book, rate it, and write a review.
 * Submits the data to the `/api/Community/ratings` endpoint.
 *
 * @param props - Component properties.
 */
export const RatingForm: React.FC<Props> = ({ onRatingAdded, initialBook }) => {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); 

    useEffect(() => {
        if (initialBook) {
            setSelectedBook(initialBook);
            setBookTitle(initialBook.title);
            setBookAuthor(initialBook.author);
            window.history.replaceState({}, document.title);
        }
    }, [initialBook]);

    /**
     * Handles the selection of a book from the search results.
     * Populates the form fields with the selected book's data.
     */
    const handleBookSelect = (book: Book) => {
        setSelectedBook(book);
        setBookTitle(book.title);
        setBookAuthor(book.author);
    };

    /**
     * Clears the currently selected book, resetting the form state for book selection.
     */
    const handleClearSelection = () => {
        setSelectedBook(null);
        setBookTitle('');
        setBookAuthor('');
    };

    /**
     * Handles the form submission.
     * Validates input, sends data to API, resets the form, and triggers the callback.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!bookTitle || rating === 0) return;

        setIsSubmitting(true);

        const payload = {
            bookTitle,
            bookAuthor,
            rating,
            comment,
            bookCover: selectedBook?.cover
        };

        try {
            await api.post('/api/Community/ratings', payload);
            
            // Reset form state
            handleClearSelection();
            setRating(0);
            setComment('');
            
            // Trigger refresh in parent
            onRatingAdded();
        } catch (err) {
            console.error("Error submitting rating:", err);
            alert("Nie udało się dodać recenzji.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card rating-form-card">
            <div className="card-header-row">
                <h3>Napisz recenzję</h3>
                <span className="status-tag active" style={{background: 'var(--primary)', color: 'var(--text-inverse)'}}>
                    Podziel się opinią
                </span>
            </div>
            
            <form onSubmit={handleSubmit}>
                {/* Book Search and Selection Section */}
                <div className="book-selection-section">
                    {!selectedBook ? (
                        <div className="search-mode">
                            <label className="form-label">Znajdź książkę, którą chcesz ocenić:</label>
                            <div className="search-container-embedded">
                                <BookSearch onSelectBook={handleBookSelect} />
                            </div>
                            <p className="hint-text">Wpisz tytuł, aby wyszukać.</p>
                        </div>
                    ) : (
                        <div className="selected-book-preview">
                            <img 
                                src={selectedBook.cover || "https://placehold.co/60x90"} 
                                alt={selectedBook.title} 
                                className="preview-cover"
                            />
                            <div className="preview-info">
                                <h4>{selectedBook.title}</h4>
                                <p>{selectedBook.author}</p>
                                <button type="button" className="btn-change-book" onClick={handleClearSelection}>
                                    Zmień książkę
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating and Comment Section (Visible only when book is selected) */}
                <div className={`form-body ${selectedBook ? 'visible' : 'hidden'}`}>
                    <div className="rating-row">
                        <span>Twoja ocena:</span>
                        <StarSelector rating={rating} setRating={setRating} />
                    </div>

                    <textarea 
                        placeholder="Co myślisz o tej książce? (opcjonalne)" 
                        className="modern-textarea"
                        rows={3}
                        value={comment} 
                        onChange={e => setComment(e.target.value)}
                    />

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn-add-book" 
                            disabled={rating === 0 || isSubmitting}
                        >
                            {isSubmitting ? 'Wysyłanie...' : 'Opublikuj recenzję'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};