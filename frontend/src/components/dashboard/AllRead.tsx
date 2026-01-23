import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios'; // Dostosuj ścieżkę do swojego pliku axios
import { UserBook, BookStatus } from '../../utils/types';

const AllRead: React.FC = () => {
    const navigate = useNavigate();
    const [allBooks, setAllBooks] = useState<UserBook[]>([]);
    const [filter, setFilter] = useState<'all' | number>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Korzystamy z Twojego istniejącego endpointu [HttpGet] public async Task<ActionResult<List<UserBook>>> GetBooks()
                const res = await api.get<UserBook[]>("/api/books");
                
                // Filtrujemy tylko te, które mają status "Read" (wartość 2)
                const readOnly = res.data.filter(b => b.status === BookStatus.Read);
                setAllBooks(readOnly);
            } catch (err) {
                console.error("Błąd podczas pobierania książek:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    // Wyciągamy unikalne lata na podstawie completedDate (lub addedAt jeśli completedDate jest puste)
    const years = Array.from(new Set(allBooks.map(b => {
        const dateStr = b.completedDate || b.addedAt;
        return dateStr ? new Date(dateStr).getFullYear() : null;
    }))).filter((y): y is number => y !== null).sort((a, b) => b - a);

    // Filtrowanie wyświetlanej listy
    const filteredBooks = filter === 'all' 
        ? allBooks 
        : allBooks.filter(b => {
            const dateStr = b.completedDate || b.addedAt;
            return dateStr && new Date(dateStr).getFullYear() === filter;
        });

    const handleUndo = async (book: UserBook) => {
        try {
            // Używamy Twojego istniejącego endpointu [HttpPut("{id}")]
            // Zmieniamy tylko status na Reading (1)
            const updatedBook = { ...book, status: BookStatus.Reading };
            await api.put(`/api/books/${book.id}`, updatedBook);
            
            // Usuwamy z widoku "Przeczytane"
            setAllBooks(prev => prev.filter(b => b.id !== book.id));
        } catch (err) {
            console.error("Błąd przywracania:", err);
        }
    };

    if (loading) return <div className="loader">Wczytywanie historii...</div>;

    return (
        <div className="all-read-container">
            <header className="all-read-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Wróć do profilu</button>
                <h1>Pełna historia przeczytanych ({allBooks.length})</h1>
            </header>

            <nav className="year-filters">
                <button 
                    className={filter === 'all' ? 'active' : ''} 
                    onClick={() => setFilter('all')}
                >
                    Wszystkie lata
                </button>
                {years.map(year => (
                    <button 
                        key={year} 
                        className={filter === year ? 'active' : ''} 
                        onClick={() => setFilter(year)}
                    >
                        {year}
                    </button>
                ))}
            </nav>

            <div className="books-history-grid">
                {filteredBooks.length === 0 ? (
                    <p className="empty-info">Brak przeczytanych książek w tym okresie.</p>
                ) : (
                    filteredBooks.map(book => (
                        <div key={book.id} className="history-item">
                            <img src={book.imageUrl || "https://placehold.co/80x120"} alt={book.title} />
                            <div className="history-info">
                                <h3>{book.title}</h3>
                                <p>{book.author}</p>
                                <span className="date-badge">
                                    {book.completedDate 
                                        ? `Ukończono: ${new Date(book.completedDate).toLocaleDateString()}` 
                                        : `Dodano: ${new Date(book.addedAt).toLocaleDateString()}`}
                                </span>
                                <button onClick={() => handleUndo(book)} className="undo-link">
                                    Przywróć do czytania
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllRead;