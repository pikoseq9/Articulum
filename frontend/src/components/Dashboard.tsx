import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import BookSearch, { Book } from './BookSearch';
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<Book | null>(null);

  const stats = {
    booksRead: 12,
    annualGoal: 52,
    streak: 5,
    pagesRead: 3450
  };

  const handleBookSelect = (book: Book) => {
    setSelectedCandidate(book);
  };

  const currentBook = {
    id: 1,
    title: "Diuna",
    author: "Frank Herbert",
    cover: "https://placehold.co/100x150/2c3e50/FFF?text=Diuna",
    progress: 65
  };

  const toReadList = [
    { id: 2, title: "Projekt Hail Mary", author: "Andy Weir", tag: "Sci-Fi" },
    { id: 3, title: "Atomowe Nawyki", author: "James Clear", tag: "Rozwój" },
    { id: 4, title: "Władca Pierścieni", author: "J.R.R. Tolkien", tag: "Fantasy" },
  ];

  const annualProgress = Math.round((stats.booksRead / stats.annualGoal) * 100);

  const handleAddClick = () => {
    if (selectedCandidate) {
      console.log("Dodawanie wybranej:", selectedCandidate);
      navigate('/add', { state: { prefilledBook: selectedCandidate } });
    } else {
      navigate('/add');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        
        <div className="header-greeting">
          <h1>Cześć, Czytelniku!</h1>
          <p>Oto Twój literacki "Command Center".</p>
        </div>

        <div className="header-search">
             <BookSearch onSelectBook={handleBookSelect} />
        </div>

        <div className="header-actions">
            <button className="btn-add-book" onClick={handleAddClick}>
            {selectedCandidate ? `+ Dodaj "${selectedCandidate.title}"` : '+ Dodaj Książkę'}
            </button>
        </div>
      </header>

      <div className="dash-grid">
        
        <div className="dash-column left-col">
          
          <div className="card user-card">
            <div className="user-info">
              <div className="avatar">JK</div>
              <div>
                <h3>Jan Kowalski</h3>
                <span className="badge">Poziom: Bibliofil</span>
              </div>
            </div>
            <div className="streak-info">
                Twój streak: <strong>{stats.streak} dni</strong>
            </div>
            <Link to="/profile" className="link-text">Zobacz pełny profil &rarr;</Link>
          </div>

          <div className="card progress-card">
            <h3>Wyzwanie 2026</h3>
            <div className="progress-stats">
              <span>{stats.booksRead} przeczytanych</span>
              <span className="goal-text">Cel: {stats.annualGoal}</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${annualProgress}%` }}
              ></div>
            </div>
            <p className="subtext">{annualProgress}% celu zrealizowane</p>
          </div>

          <div className="stats-row">
            <div className="card stat-mini">
              <h4>Strony</h4>
              <p>{stats.pagesRead}</p>
            </div>
            <div className="card stat-mini">
              <h4>Recenzje</h4>
              <p>8</p>
            </div>
          </div>
        </div>

        <div className="dash-column center-col">
          <div className="card current-read-card">
            <div className="card-header-row">
              <h3>Aktualnie czytasz</h3>
              <span className="status-tag">W trakcie</span>
            </div>
            <div className="book-detail-flex">
              <img src={currentBook.cover} alt={currentBook.title} className="book-cover" />
              <div className="book-info">
                <h2>{currentBook.title}</h2>
                <p className="author">{currentBook.author}</p>
                
                <div className="mini-progress">
                  <label>Postęp: {currentBook.progress}%</label>
                  <progress value={currentBook.progress} max="100"></progress>
                </div>
                
                <div className="actions">
                  <Link to={`/show/${currentBook.id}`}>
                    <button className="btn-secondary">Aktualizuj</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-column trello-col">
          <div className="trello-header">
            <h3>Do przeczytania ({toReadList.length})</h3>
          </div>
          <div className="trello-list">
            {toReadList.map(book => (
              <div key={book.id} className="trello-card" onClick={() => navigate(`/show/${book.id}`)}>
                <div className="trello-tags">
                  <span className={`tag ${book.tag.toLowerCase()}`}>{book.tag}</span>
                </div>
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            ))}
             <div className="trello-card-add" onClick={() => navigate('/add')}>
                + Dodaj kolejną pozycję
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}