import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { UserBook, BookStatus } from '../utils/types';
import './AllRead.css';
import { Pagination } from './Pagination';


const AllRead: React.FC = () => {
    const navigate = useNavigate();
    const [allBooks, setAllBooks] = useState<UserBook[]>([]);
    const [filter, setFilter] = useState<'all' | number>('all');
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await api.get<UserBook[]>("/api/books");
                const readOnly = res.data.filter(b => b.status === BookStatus.Read);
                setAllBooks(readOnly);
            } catch (err) {
                console.error("Błąd pobierania:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    useEffect(() => {
    setCurrentPage(1);
    }, [filter]);

    const handleMove = async (book: UserBook, status: BookStatus) => {
        try {
            await api.put(`/api/books/${book.id}`, { ...book, status });
            setAllBooks(prev => prev.filter(b => b.id !== book.id));
            setOpenMenuId(null);
        } catch (err) {
            console.error("Błąd:", err);
        }
    };

    const years = Array.from(new Set(allBooks.map(b => {
        const dateStr = b.completedDate || b.addedAt;
        return dateStr ? new Date(dateStr).getFullYear() : null;
    }))).filter((y): y is number => y !== null).sort((a, b) => b - a);

    const filteredBooks = allBooks.filter(b => {
        const dateStr = b.completedDate || b.addedAt;
        const bookYear = dateStr ? new Date(dateStr).getFullYear() : null;
        return filter === 'all' || bookYear === filter;
    });

    const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    if (loading) return <div className="loader">Wczytywanie...</div>;

    return (
    <div className="all-read-wrapper">
        <div className="all-read-container">
            <header className="all-read-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <span>←</span> Wróć do profilu
                </button>
                <h1>Historia Przeczytanych ({allBooks.length})</h1>
            </header>

            <nav className="year-filters">
                <button 
                    className={`year-btn ${filter === 'all' ? 'active' : ''}`} 
                    onClick={() => setFilter('all')}
                >
                    Wszystkie
                </button>
                {years.map(year => (
                    <button 
                        key={year} 
                        className={`year-btn ${filter === year ? 'active' : ''}`} 
                        onClick={() => setFilter(year)}
                    >
                        {year}
                    </button>
                ))}
            </nav>

            <div className="books-history-list">
                {paginatedBooks.map(book => (
                    <div key={book.id} className="history-horizontal-card" onClick={() => navigate(`/show/${book.id}`)}>
                        <img src={book.imageUrl || "https://placehold.co/60x90"} alt={book.title} />
                        
                        <div className="card-content">
                            <div className="card-info">
                                <h3>{book.title}</h3>
                                <p>{book.author}</p>
                                <span className="date-badge">
                                    {book.completedDate 
                                        ? new Date(book.completedDate).toLocaleDateString() 
                                        : new Date(book.addedAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="menu-wrapper" onClick={(e) => e.stopPropagation()}>
                                <button className="dots-btn" onClick={() => setOpenMenuId(openMenuId === String(book.id) ? null : String(book.id))}>⋮</button>
                                {openMenuId === String(book.id) && (
                                    <div className="action-menu">
                                        <button onClick={() => handleMove(book, BookStatus.Reading)}>📖 Wznów czytanie</button>
                                        <button onClick={() => handleMove(book, BookStatus.ToRead)}>⏳ Do kolejki</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                ))}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    </div>

);
};

export default AllRead;