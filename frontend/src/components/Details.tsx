import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserBook, BookStatusLabels } from "../utils/types";
import api from "../axios";
import ReadingProgress from "../components/ReadingProgress"; 
import './Details.css';

export default function Details() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [book, setBook] = useState<UserBook | null>(null);

    const fetchBook = async () => {
        try {
            const res = await api.get<UserBook>(`/api/Books/${id}`);
            setBook(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBook();
    }, [id]);

    const handleDelete = async () => {
        if(window.confirm("Czy na pewno chcesz usunąć tę książkę?")) {
            try {
                await api.delete(`/api/Books/${id}`);
                navigate("/");
            } catch(err) {
                alert("Błąd podczas usuwania");
            }
        }
    }

    if (!book) return <h2>Ładowanie...</h2>;

    return (
        <div className="details-container">
            <button className="back-btn" onClick={() => navigate("/")}>&larr; Powrót</button>

            <div className="details-card">
                <div className="details-header">
                    {book.imageUrl && <img src={book.imageUrl} alt="Okładka" className="detail-cover-img" style={{maxWidth: 100, float: 'left', marginRight: 20}} />}
                    <div>
                        <h1>{book.title}</h1>
                        <span className="author-subtitle">autorstwa {book.author}</span>
                    </div>
                </div>
                <div style={{clear: 'both'}}></div>

                <div className="details-grid">
                    <div><strong>Status:</strong> {BookStatusLabels[book.status]}</div>
                    <div><strong>ISBN:</strong> {book.isbn || "-"}</div>
                    <div><strong>Dodano:</strong> {new Date(book.addedAt).toLocaleDateString()}</div>
                    
                    <div><strong>Liczba stron:</strong> {book.pages || "-"}</div>
                </div>

                <ReadingProgress book={book} onUpdate={fetchBook} />

                {book.description && (
                    <div className="notes-section">
                        <h3>Opis</h3>
                        <p>{book.description}</p>
                    </div>
                )}

                <div className="details-actions">
                    <button className="btn-edit" onClick={() => navigate(`/edit/${book.id}`)}>Edytuj</button>
                    <button className="btn-delete" onClick={handleDelete}>Usuń</button>
                </div>
            </div>
        </div>
    );
}