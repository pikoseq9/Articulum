import './App.css';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Details from './components/Details';
import NotFound from './components/NotFound';
import { useEffect, useState } from 'react';
import LoginModal from './components/loginModal';
import { useAuth } from './authContext';
import ProfilePage from './components/ProfilePage';
import Dashboard from './components/Dashboard';
import BookForm from './components/BookForm';

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
        <div className='nav-btns'>
          <div className='login-btn'>
            {user ? (
              <button onClick={logout}>Wyloguj</button>
            ) : (
              <button onClick={() => setIsLoginOpen(true)}>Zaloguj</button>
            )}
          </div>
          {user && (
              <Link to="/profile">
                  <button className="btn-profile">Mój Profil</button>
              </Link>
          )}
        </div>        
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
          <Route path='/*' element={<NotFound />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
