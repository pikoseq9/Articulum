import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../axios';
import { UserBook, BookStatus } from '../utils/types';
import { useAuth } from '../authContext';
import './Dashboard.css';
import BookSearch, { Book } from './BookSearch';

const calculateStreak = (books: UserBook[]): number => {
    const dates = books
        .map(b => new Date(b.addedAt).toDateString())
        .map(d => new Date(d).getTime())
        .sort((a, b) => b - a);

    const uniqueDates = Array.from(new Set(dates));
    if (uniqueDates.length === 0) return 0;

    const oneDay = 24 * 60 * 60 * 1000;
    const today = new Date(new Date().toDateString()).getTime();
    const yesterday = today - oneDay;

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        if (uniqueDates[i] - uniqueDates[i + 1] === oneDay) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [books, setBooks] = useState<UserBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [selectedFromSearch, setSelectedFromSearch] = useState<Book | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const ANNUAL_GOAL = 52;

    const fetchBooks = async () => {
        try {
            const res = await api.get<UserBook[]>('/api/Books');
            setBooks(res.data);
        } catch (err) {
            console.error("Błąd pobierania danych:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchBooks();
    }, [user]);

    const handleConfirmAdd = async (status: BookStatus) => {
        if (!selectedFromSearch) return;

        setIsAdding(true);
        try {
            const newBook: Partial<UserBook> = {
                title: selectedFromSearch.title,
                author: selectedFromSearch.author,
                imageUrl: selectedFromSearch.cover,
                status: status,
                addedAt: new Date().toISOString(),
                pages: 0,
                description: ""
            };

            await api.post('/api/Books', newBook);
            
            setSelectedFromSearch(null);
            await fetchBooks();
        } catch (err) {
            console.error("Błąd podczas dodawania:", err);
            alert("Błąd połączenia z API.");
        } finally {
            setIsAdding(false);
        }
    };

    const stats = useMemo(() => {
        const readBooks = books.filter(b => b.status === BookStatus.Read);
        const readingBooks = books.filter(b => b.status === BookStatus.Reading);
        
        const pagesRead = readBooks.reduce((acc, curr) => acc + (curr.pages || 0), 0);
        const currentStreak = calculateStreak(books);
        const progressPercent = Math.min(100, Math.round((readBooks.length / ANNUAL_GOAL) * 100));

        return {
            readCount: readBooks.length,
            readingCount: readingBooks.length,
            pagesRead,
            streak: currentStreak,
            progressPercent
        };
    }, [books]);

    const currentRead = useMemo(() => {
        const reading = books.filter(b => b.status === BookStatus.Reading);
        if (reading.length > 0) {
            return reading.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())[0];
        }
        return null;
    }, [books]);

    const toReadList = useMemo(() => {
        return books
            .filter(b => b.status === BookStatus.ToRead)
            .filter(b => 
                b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                b.author.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [books, searchTerm]);

    if (loading) return <div className="dashboard-container"><h2 style={{color:'white',textAlign:'center',marginTop:50}}>Ładowanie...</h2></div>;

    return (
        <div className="dashboard-container">
            {selectedFromSearch && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <h3>Dodać do biblioteki?</h3>
                        <div className="confirm-info">
                            <img src={selectedFromSearch.cover} alt="" />
                            <div className="confirm-text">
                                <p><strong>{selectedFromSearch.title}</strong></p>
                                <p>{selectedFromSearch.author}</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-add-book" onClick={() => handleConfirmAdd(BookStatus.ToRead)} disabled={isAdding}>
                                Do przeczytania
                            </button>
                            <button className="btn-secondary" onClick={() => handleConfirmAdd(BookStatus.Reading)} disabled={isAdding}>
                                Zacznij czytać teraz
                            </button>
                            <button className="cancel-link" onClick={() => setSelectedFromSearch(null)}>Anuluj</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="dash-header">
                <div className="header-greeting">
                    <h1>Cześć, {user?.displayName || "Czytelniku"}!</h1>
                    <p>Twoja biblioteka liczy {books.length} pozycji.</p>
                </div>

                <div className="header-search">
                    <BookSearch onSelectBook={(book) => setSelectedFromSearch(book)} />
                </div>

                <div className="header-actions">
                    <button className="btn-add-book" onClick={() => navigate('/add')}>+ Ręcznie</button>
                </div>
            </header>

            <div className="dash-grid">
                <div className="dash-column left-col">
                    <div className="card user-card">
                        <div className="user-info">
                            <div className="avatar">{user?.displayName?.substring(0, 2).toUpperCase() || "JA"}</div>
                            <div>
                                <h3>{user?.displayName}</h3>
                                <span className="badge">Poziom: {stats.readCount > 10 ? "Mol książkowy" : "Startujący"}</span>
                            </div>
                        </div>
                        <div className="streak-info">
                            Aktywność: <strong>{stats.streak} dni z rzędu 🔥</strong>
                        </div>
                        <Link to="/profile" className="link-text">Twój profil &rarr;</Link>
                    </div>

                    <div className="card progress-card">
                        <h3>Cel Roczny</h3>
                        <div className="progress-stats">
                            <span>{stats.readCount} ukończonych</span>
                            <span className="goal-text">Cel: {ANNUAL_GOAL}</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${stats.progressPercent}%` }}></div>
                        </div>
                        <p className="subtext">{stats.progressPercent}% celu zrealizowane</p>
                    </div>

                    <div className="stats-row">
                        <div className="card stat-mini">
                            <h4>Strony</h4>
                            <p>{stats.pagesRead}</p>
                        </div>
                        <div className="card stat-mini">
                            <h4>W trakcie</h4>
                            <p>{stats.readingCount}</p>
                        </div>
                    </div>
                </div>

                <div className="dash-column center-col">
                    <div className="card current-read-card">
                        <div className="card-header-row">
                            <h3>Aktualnie czytasz</h3>
                            <span className="status-tag active">W trakcie</span>
                        </div>
                        
                        {currentRead ? (
                            <div className="book-detail-flex">
                                <img 
                                    src={currentRead.imageUrl || `https://placehold.co/100x150/2c3e50/FFF?text=${currentRead.title.substring(0,1)}`} 
                                    alt={currentRead.title} 
                                    className="book-cover" 
                                />
                                <div className="book-info">
                                    <h2>{currentRead.title}</h2>
                                    <p className="author">{currentRead.author}</p>
                                    <div className="mini-progress">
                                        <label>Liczba stron: {currentRead.pages || "?"}</label>
                                        <progress value="50" max="100"></progress> 
                                    </div>
                                    <div className="actions">
                                        <Link to={`/show/${currentRead.id}`}>
                                            <button className="btn-secondary">Zarządzaj</button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Nic teraz nie czytasz.</p>
                                <button className="btn-secondary" onClick={() => navigate('/add')}>Wyszukaj coś</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dash-column trello-col">
                    <div className="trello-header">
                        <h3>Do przeczytania ({toReadList.length})</h3>
                        <input 
                            type="text" 
                            className="mini-search" 
                            placeholder="Filtruj listę..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="trello-list">
                        {toReadList.map(book => (
                            <div key={book.id} className="trello-card" onClick={() => navigate(`/show/${book.id}`)}>
                                <h4>{book.title}</h4>
                                <p>{book.author}</p>
                            </div>
                        ))}
                        <div className="trello-card-add" onClick={() => navigate('/add')}>
                            + Dodaj nową pozycję
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}