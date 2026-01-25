import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { useBooks } from '../../hooks/useBooks';
import { Book, BookStatus } from '../../utils/types';
import BookSearch from '../BookSearch';
import { UserCard } from './UserCard';
import { StatCard } from './StatCard';
import { ReadingSection } from './ReadingSection';
import { TrelloSection } from './TrelloSection';
import './Dashboard.css';

/**
 * ConfirmAddModal Component
 * * A modal dialog that prompts the user to confirm adding a book to their library.
 * Allows the user to choose the initial status (To Read or Reading).
 *
 * @param props - Component properties including the book object and callback functions.
 */
const ConfirmAddModal = ({ book, onConfirm, onCancel, isAdding }: any) => (
    <div className="modal-overlay">
        <div className="confirm-modal">
            <h3>Dodać do biblioteki?</h3>
            <div className="confirm-info">
                <img src={book.cover} alt="" />
                <div className="confirm-text">
                    <p><strong>{book.title}</strong></p>
                    <p>{book.author}</p>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn-add-book" onClick={() => onConfirm(BookStatus.ToRead)} disabled={isAdding}>Do przeczytania</button>
                <button className="btn-secondary" onClick={() => onConfirm(BookStatus.Reading)} disabled={isAdding}>Zacznij czytać teraz</button>
                <button className="cancel-link" onClick={onCancel}>Anuluj</button>
            </div>
        </div>
    </div>
);

/**
 * ReadHistoryModal Component
 * * A modal that displays the complete history of books the user has finished.
 * Provides functionality to move a finished book back to the "Reading" status (re-read).
 *
 * @param props - Component properties containing the list of read books and control callbacks.
 */
const ReadHistoryModal = ({ books, onClose, onMoveBook }: any) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="confirm-modal read-history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Historia przeczytanych ({books.length})</h3>
                <button className="close-icon" onClick={onClose}>×</button>
            </div>
            <div className="read-list-container">
                {books.length === 0 ? <p className="empty-text">Pusto.</p> : books.map((book: any) => (
                    <div key={book.id} className="read-list-item">
                        <div className="read-item-info">
                            <img src={book.imageUrl || "https://placehold.co/40x60"} alt="cover" />
                            <div><h4>{book.title}</h4><span>{book.author}</span></div>
                        </div>
                        <div className="read-item-actions">
                            <button className="btn-undo" onClick={() => onMoveBook(book, BookStatus.Reading)}>↺ W trakcie</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * Dashboard Component
 * * The central hub of the application, aggregating the user's library, statistics, and reading progress.
 * * Key Responsibilities:
 * - Coordinates state between the search bar and the book list.
 * - Manages modals for adding books and viewing history.
 * - Integrates `useBooks` hook for data management.
 * - Implements a responsive layout featuring `UserCard`, `StatCard`, `ReadingSection`, and `TrelloSection`.
 */
export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { 
        loading, stats, readingList, readList, getToReadList, moveBook, addBook 
    } = useBooks();

    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFromSearch, setSelectedFromSearch] = useState<Book | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showReadModal, setShowReadModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Close open menus when clicking outside
    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    /**
     * Handles the confirmation action from the Add Book modal.
     * Triggers the API call to add the book with the selected status.
     * @param status - The status to assign to the new book (ToRead or Reading).
     */
    const handleAddConfirm = async (status: BookStatus) => {
        if (!selectedFromSearch) return;
        setIsAdding(true);
        await addBook(selectedFromSearch, status);
        setIsAdding(false);
        setSelectedFromSearch(null);
    };

    /**
     * Programmatically focuses the main search input.
     * Used when clicking "Add new item" in the Trello section to improve UX.
     */
    const handleFocusSearch = () => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return <div className="dashboard-container"><h2>Ładowanie...</h2></div>;

    return (
        <div className="dashboard-container">
            {/* Modal: Confirm adding a new book */}
            {selectedFromSearch && (
                <ConfirmAddModal 
                    book={selectedFromSearch} 
                    onConfirm={handleAddConfirm} 
                    onCancel={() => setSelectedFromSearch(null)} 
                    isAdding={isAdding} 
                />
            )}

            {/* Modal: View reading history */}
            {showReadModal && (
                <ReadHistoryModal 
                    books={readList} 
                    onClose={() => setShowReadModal(false)} 
                    onMoveBook={moveBook} 
                />
            )}

            {/* Main Header with Search */}
            <header className="dash-header">
                <div className="header-greeting">
                    <h1>Cześć, {user?.displayName || "Czytelniku"}!</h1>
                    <p>Twoja biblioteka.</p>
                </div>
                <div className="header-search">
                    <BookSearch 
                        ref={searchInputRef} 
                        onSelectBook={setSelectedFromSearch} 
                    />
                </div>
            </header>

            {/* Dashboard Grid Layout */}
            <div className="dash-grid">
                
                {/* Left Column: User Profile & Stats */}
                <div className="dash-column left-col">
                    <UserCard 
                        streak={stats.streak} 
                        level={stats.readCount > 10 ? "Mol książkowy" : "Startujący"} 
                        onDataUpdate={() => window.location.reload()}
                    />
                    <StatCard 
                        readCount={stats.readCount} 
                        goal={stats.goal} 
                        percent={stats.progressPercent} 
                        pagesRead={stats.pagesRead} 
                        readingCount={stats.readingCount}
                        onClick={() => setShowReadModal(true)} 
                    />
                </div>

                {/* Center Column: Currently Reading */}
                <ReadingSection 
                    books={readingList} 
                    onMoveBook={moveBook} 
                    onAddClick={() => navigate('/add')}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />

                {/* Right/Bottom Column: To-Read List (Trello-style) */}
                <TrelloSection 
                    books={getToReadList(searchTerm)} 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    onMoveBook={moveBook} 
                    onAddClick={handleFocusSearch}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />
            </div>
        </div>
    );
}