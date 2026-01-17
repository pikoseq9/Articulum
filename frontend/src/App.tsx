import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import './App.css'; // Importuje nasze nowe style globalne

// Komponenty
import Dashboard from './components/Dashboard';
import Details from './components/Details';
import BookForm from './components/BookForm';
import ProfilePage from './components/ProfilePage';
import NotFound from './components/NotFound';
import LoginModal from './components/loginModal';

// Auth
import { useAuth } from './authContext';

function App() {
  const { user, login, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setIsLoginOpen(false);
    }
  }, [user]);

  return (
    <BrowserRouter>
      <div className='content'>
        {user && (
          <nav className='nav-btns'>
            <Link to="/profile">
              <button className="btn-profile">Mój Profil</button>
            </Link>
            <div className='login-btn'>
                <button onClick={logout}>Wyloguj</button>
            </div>
          </nav>
        )}

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLogin={login}
        />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/show/:id" element={<Details />} />
          <Route path="/add" element={<BookForm />} />
          <Route path="/edit/:id" element={<BookForm />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path='/*' element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;