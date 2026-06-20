import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  Navigate
} from "react-router-dom";

import "./App.css";
import { useAuth } from "./authContext";

import LatestArticles from "./components/articles/LatestArticles";
import About from "./components/About";
import ArticleSearch from "./components/ArticleSearch";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import Archive from "./components/articles/Archive";
import Editorial from "./components/articles/Editorial";
import ReviewProcess from "./components/articles/ReviewProcess";
import Reviewers from "./components/articles/Reviewers";
import ForAuthors from "./components/articles/ForAuthors";
import AdminLoginForm from "./components/AdminLoginForm";
import AdminPanel from "./components/AdminPanel";


function AppContent() {
  const { user, login, logout, appLoading } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";


  if (appLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#131620",
          color: "white",
        }}
      >
        <h2>Ładowanie czasopisma...</h2>
      </div>
    );
  }


  if (isLoginPage) {
    return (
      <div className="login-layout">
        <NavLink to="/" className="login-logo">
          <img src="/logo.svg" alt="Articulum Logo" />
        </NavLink>

        <AdminLoginForm onLogin={login} />
      </div>
    );
  }


  return (
    <div className="app-container">

      <header className="top-header">

        <div className="logo-container">
          <NavLink to="/" className="logo-link">
            <img
              src="/logo.svg"
              className="logo-svg"
              alt="Articulum Logo"
            />
          </NavLink>
        </div>


        <div className="search-container">
          <ArticleSearch />
        </div>


        <div className="admin-container">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              <NavLink
                to="/admin"
                className="admin-account-btn unlock-btn"
                title={`Zalogowano jako ${user.displayName || "Administrator"}`}
                style={{ textDecoration: 'none' }}
              >
                {user.avatarUrl ? (
                  <img 
                    src={`http://localhost:5269${user.avatarUrl}`}
                    alt="Avatar" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '12px', 
                      objectFit: 'cover' 
                    }} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "AD"}
                  </span>
                )}
              </NavLink>

              <button
                onClick={logout}
                className="admin-logout-btn"
                title="Wyloguj się"
              >
                🚪
              </button>

            </div>
          ) : (
            <NavLink
              to="/login"
              className="admin-account-btn"
              title="Zaloguj jako administrator"
            >
              🔒
            </NavLink>
          )}
        </div>

      </header>


      <div className="layout-wrapper">


        <aside className="sidebar">

          <nav className="sidebar-nav">

            <NavLink to="/" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              O czasopiśmie
            </NavLink>


            <NavLink to="/latest" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              Najnowsze artykuły
            </NavLink>


            <NavLink to="/archive" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              Roczniki
            </NavLink>


            <NavLink to="/editorial" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              Redakcja
            </NavLink>


            <NavLink to="/authors" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              Dla autorów
            </NavLink>


            <NavLink to="/review-process" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              Proces recenzji
            </NavLink>


            <NavLink to="/reviewers" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              Recenzenci
            </NavLink>


            <NavLink to="/contact" className={({isActive}) =>
              isActive ? "nav-link active" : "nav-link"}>
              Kontakt
            </NavLink>


            {user && (
              <NavLink
                to="/admin"
                className={({isActive}) =>
                  isActive
                    ? "nav-link active admin-link"
                    : "nav-link admin-link"
                }
              >
                Panel Administratora
              </NavLink>
            )}

          </nav>

        </aside>


        <main className="main-content">

          <Routes>

            <Route path="/" element={<About />} />

            <Route
              path="/latest"
              element={<LatestArticles />}
            />

            <Route
              path="/archive"
              element={<Archive />}
            />

            <Route
              path="/editorial"
              element={<Editorial />}
            />

            <Route
              path="/authors"
              element={<ForAuthors />}
            />

            <Route
              path="/review-process"
              element={<ReviewProcess />}
            />

            <Route
              path="/reviewers"
              element={<Reviewers />}
            />

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/admin"
              element={
                user ? (
                  <AdminPanel />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AppContent />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;