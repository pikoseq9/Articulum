import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import './App.css';
import Dashboard from './components/Dashboard';
import Details from './components/Details';
import BookForm from './components/BookForm';
import ProfilePage from './components/ProfilePage';
import NotFound from './components/NotFound';
import LoginModal from './components/loginModal';
import AllRead from './components/AllRead';
import { useAuth } from './authContext';
import { CommunitySidebar } from './components/community/CommunitySidebar';
import CommunityView from './components/community/CommunityView';

function App() {
  const { user, login, logout, appLoading } = useAuth(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (appLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#1e1c1b', 
        color: '#e3ded9' 
      }}>
        <h2>Ładowanie biblioteki...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
        <div className='content'>
          {user && (
            <nav className='nav-btns'>
              <Link to="/community">
                <button 
                  className="btn-profile"
                  style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                >
                    👥 Społeczność
                </button>
              </Link>
              
              <Link to="/profile">
                <button className="btn-profile">Mój Profil</button>
              </Link>
              <div className='login-btn'>
                <button onClick={logout}>Wyloguj</button>
              </div>
            </nav>
          )}

          <LoginModal
            isOpen={!user} 
            onClose={() => {}}
            onLogin={login}
          />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/show/:id" element={<Details />} />
            <Route path="/add" element={<BookForm />} />
            <Route path="/edit/:id" element={<BookForm />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/community" element={<CommunityView />} />
            <Route path="/profile/history" element={<AllRead />} />
            <Route path='/*' element={<NotFound />} />
          </Routes>
        </div>
        {user && (
            <CommunitySidebar 
                variant="drawer"
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
        )}
    </BrowserRouter>
  );
}

export default App;