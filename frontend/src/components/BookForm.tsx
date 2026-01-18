import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookCreateUpdate, UserBook, BookStatus } from "../utils/types";
import api from "../axios";
import { useAuth } from "../authContext";

export default function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();

  const [form, setForm] = useState<BookCreateUpdate>({
    title: "",
    author: "",
    isbn: "",
    imageUrl: "",
    description: "",
    pages: 0,
    status: BookStatus.ToRead
  });

  const [isbnToFetch, setIsbnToFetch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit || !user) return;
    const fetchBook = async () => {
      try {
        const res = await api.get<UserBook>(`/api/Books/${id}`);
        const book = res.data;
        
        setForm({
            title: book.title,
            author: book.author,
            isbn: book.isbn || "",
            imageUrl: book.imageUrl || "",
            description: book.description || "",
            pages: book.pages || 0,
            status: book.status
        });
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać danych książki.");
      }
    };
    fetchBook();
  }, [isEdit, id, user]);

  const update = (field: keyof BookCreateUpdate, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if(!form.title || !form.author) {
        setError("Tytuł i autor są wymagani.");
        return;
    }

    try {
        if (isEdit) {
            await api.put(`/api/Books/${id}`, form);
        } else {
            await api.post(`/api/Books`, form);
        }
        navigate("/");
    } catch (err) {
        setError("Błąd podczas zapisywania.");
        console.error(err);
    }
  };

  const handleFetchIsbn = async () => {
      if(!isbnToFetch) return;
      setLoading(true);
      setError("");
      try {
          await api.post(`/api/Books/fetch/${isbnToFetch}`);
          navigate("/"); 
      } catch (err) {
          setError("Nie znaleziono książki o podanym ISBN.");
      } finally {
          setLoading(false);
      }
  }

  return (
    <div className="form-container">
      <button className="back-btn" onClick={() => navigate("/")}>&larr; Powrót</button>
      
      {!isEdit && (
          <div className="isbn-import-section">
              <h3>Szybki import przez ISBN</h3>
              <div className="isbn-input-group">
                  <input 
                    type="text" 
                    placeholder="Wpisz ISBN..." 
                    value={isbnToFetch} 
                    onChange={e => setIsbnToFetch(e.target.value)}
                  />
                  <button onClick={handleFetchIsbn} disabled={loading}>
                      {loading ? "Szukam..." : "Pobierz i Dodaj"}
                  </button>
              </div>
              <hr />
          </div>
      )}

      <h1>{isEdit ? "Edytuj Książkę" : "Dodaj Książkę Ręcznie"}</h1>
      
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <label>
          Tytuł:
          <input type="text" value={form.title} onChange={e => update("title", e.target.value)} />
        </label>

        <label>
          Autor:
          <input type="text" value={form.author} onChange={e => update("author", e.target.value)} />
        </label>

        <label>
          ISBN:
          <input type="text" value={form.isbn} onChange={e => update("isbn", e.target.value)} />
        </label>
        
        <label>
          URL Okładki:
          <input type="text" value={form.imageUrl} onChange={e => update("imageUrl", e.target.value)} />
        </label>

        <div className="form-row">
            <label>
                Status:
                <select 
                    value={form.status} 
                    onChange={e => update("status", Number(e.target.value))}
                >
                    <option value={BookStatus.ToRead}>Do przeczytania</option>
                    <option value={BookStatus.Reading}>W trakcie</option>
                    <option value={BookStatus.Read}>Przeczytane</option>
                </select>
            </label>

            <label>
                Liczba stron:
                <input type="number" value={form.pages} onChange={e => update("pages", Number(e.target.value))} />
            </label>
        </div>

        <label>
            Opis:
            <textarea value={form.description} onChange={e => update("description", e.target.value)} rows={4} />
        </label>

        <div className="buttons">
          <button type="submit" className="btn-primary">{isEdit ? "Zapisz zmiany" : "Dodaj Książkę"}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/")}>Anuluj</button>
        </div>
      </form>
    </div>
  );
}