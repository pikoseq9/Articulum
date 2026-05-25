import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
// @ts-ignore: CSS module import without type declarations
import './App.css';
import { useAuth } from './authContext';
import LatestArticles from './components/articles/LatestArticles';
import About from './components/About';
import ArticleSearch from './components/ArticleSearch';
import Contact from './components/Contact';
import NotFound from './components/NotFound';

const Archive = () => <div><h2>Roczniki</h2></div>;
const Editorial = () => <div><h2>Redakcja</h2></div>;
const ForAuthors = () => <div><h2>Dla autorów</h2></div>;
const ReviewProcess = () => <div><h2>Proces recenzji</h2></div>;
const Reviewers = () => <div><h2>Recenzenci</h2></div>;
const AdminPanel = () => <div><h2>Panel Administratora</h2></div>;
const Login = () => <div><h2>Logowanie</h2></div>;

function App() {
  const { user, logout, appLoading } = useAuth(); 

  if (appLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#131620', color: 'white' }}>
        <h2>Ładowanie czasopisma...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className='app-container'>
        
        <header className="top-header">
          <div className="logo-container">
            <h1 className="logo-text">Articulum</h1>
          </div>
          
          <div className="search-container">
            <ArticleSearch />
          </div>

          <div className="admin-container">
            {user ? (
              <button onClick={logout} className="admin-lock-btn unlock-btn" title="Wyloguj">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
              </button>
            ) : (
              <NavLink to="/login" className="admin-lock-btn" title="Zaloguj jako admin">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </NavLink>
            )}
          </div>
        </header>

        <div className="layout-wrapper">
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>O czasopiśmie</NavLink>
              <NavLink to="/latest" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Najnowsze artykuły</NavLink>
              <NavLink to="/archive" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Roczniki</NavLink>
              <NavLink to="/editorial" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Redakcja</NavLink>
              <NavLink to="/authors" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dla autorów</NavLink>
              <NavLink to="/review-process" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Proces recenzji</NavLink>
              <NavLink to="/reviewers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Recenzenci</NavLink>
              <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Kontakt</NavLink>
              
              {user && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active admin-link" : "nav-link admin-link"}>
                  Panel Administratora
                </NavLink>
              )}
            </nav>
          </aside>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/latest" element={<LatestArticles />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/editorial" element={<Editorial />} />
              <Route path="/authors" element={<ForAuthors />} />
              <Route path="/review-process" element={<ReviewProcess />} />
              <Route path="/reviewers" element={<Reviewers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;