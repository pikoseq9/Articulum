import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { useBooks } from '../hooks/useBooks';
import { Book, BookStatus } from '../utils/types';
import BookSearch from '../components/BookSearch';
import { UserCard } from '../components/dashboard/UserCard';
import { StatCard } from '../components/dashboard/StatCard';
import { ReadingSection } from '../components/dashboard/ReadingSection';
import { TrelloSection } from '../components/dashboard/TrelloSection';
import './Dashboard.css';

// Możesz wydzielić te małe modale do oddzielnych plików, jeśli chcesz jeszcze bardziej odchudzić
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

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { 
        loading, stats, readingList, readList, getToReadList, moveBook, addBook 
    } = useBooks();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFromSearch, setSelectedFromSearch] = useState<Book | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showReadModal, setShowReadModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const handleAddConfirm = async (status: BookStatus) => {
        if (!selectedFromSearch) return;
        setIsAdding(true);
        await addBook(selectedFromSearch, status);
        setIsAdding(false);
        setSelectedFromSearch(null);
    };

    if (loading) return <div className="dashboard-container"><h2>Ładowanie...</h2></div>;

    return (
        <div className="dashboard-container">
            {selectedFromSearch && (
                <ConfirmAddModal 
                    book={selectedFromSearch} 
                    onConfirm={handleAddConfirm} 
                    onCancel={() => setSelectedFromSearch(null)} 
                    isAdding={isAdding} 
                />
            )}

            {showReadModal && (
                <ReadHistoryModal 
                    books={readList} 
                    onClose={() => setShowReadModal(false)} 
                    onMoveBook={moveBook} 
                />
            )}

            <header className="dash-header">
                <div className="header-greeting">
                    <h1>Cześć, {user?.displayName || "Czytelniku"}!</h1>
                    <p>Twoja biblioteka.</p>
                </div>
                <div className="header-search">
                    <BookSearch onSelectBook={setSelectedFromSearch} />
                </div>
                <div className="header-actions">
                    <button className="btn-add-book" onClick={() => navigate('/add')}>+ Ręcznie</button>
                </div>
            </header>

            <div className="dash-grid">
                <div className="dash-column left-col">
                    <UserCard streak={stats.streak} level={stats.readCount > 10 ? "Mol książkowy" : "Startujący"} />
                    <StatCard 
                        readCount={stats.readCount} 
                        goal={stats.goal} 
                        percent={stats.progressPercent} 
                        pagesRead={stats.pagesRead} 
                        readingCount={stats.readingCount}
                        onClick={() => setShowReadModal(true)} 
                    />
                </div>

                <ReadingSection 
                    books={readingList} 
                    onMoveBook={moveBook} 
                    onAddClick={() => navigate('/add')}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />

                <TrelloSection 
                    books={getToReadList(searchTerm)} 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    onMoveBook={moveBook} 
                    onAddClick={() => navigate('/add')}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />
            </div>
        </div>
    );
}