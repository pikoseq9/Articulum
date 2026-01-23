import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import { useAuth } from "../authContext";
import './ProfilePage.css';

interface MfaSetupResponse {
  qrCodeSetupImageUrl?: string;
  manualEntryKey?: string;
}

type MfaMethod = "authenticator" | "email";

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState<MfaMethod | null>(null);
  const [mfaData, setMfaData] = useState<MfaSetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [showDisableMfa, setShowDisableMfa] = useState(false);
  const [description, setDescription] = useState(user?.bio || "");
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [goal, setGoal] = useState<number>(user?.myGoal ?? 0);
const [isSavingGoal, setIsSavingGoal] = useState(false);

  // 1. Synchronizacja opisu z bio użytkownika
  useEffect(() => {
    setDescription(user?.bio || "");
  }, [user?.bio]);
  useEffect(() => {
  setGoal(user?.myGoal ?? 0);
}, [user?.myGoal]);

  // 2. KLUCZOWA POPRAWKA: Jeśli user.isMfaEnabled zmieni się na true (np. po login(refreshedUser)),
  // czyścimy stany konfiguracji, żeby formularz wyboru zniknął.
  useEffect(() => {
    if (user?.isMfaEnabled) {
      setMethod(null);
      setMfaData(null);
      setCode("");
      setShowDisableMfa(false); // Resetujemy też widok wyłączania
    }
  }, [user?.isMfaEnabled]);


  useEffect(() => {
  if (statusMessage) {
    const timer = setTimeout(() => {
      setStatusMessage(null);
    }, 3000); // 3000ms = 3 sekundy

    return () => clearTimeout(timer); // Czyścimy timer, jeśli wiadomość zmieni się szybciej
  }
}, [statusMessage]);

  const handleSaveGoal = async () => {
  try {
    setIsSavingGoal(true);
    
    // Zapisujemy odpowiedź z POST do zmiennej res
    const res = await api.post("/api/account/update-goal", { newGoal: goal });
    login(res.data);

    setStatusMessage({ type: "success", text: "Cel roczny zapisany 🎯" });
  } catch {
    setStatusMessage({ type: "error", text: "Nie udało się zapisać celu" });
  } finally {
    setIsSavingGoal(false);
  }
};
 const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    console.log("Wybrany plik:", e.target.files[0]);
    setAvatarFile(e.target.files[0]);
  } else {
    console.log("Brak wybranego pliku");
  }
};
const handleUploadAvatar = async () => {
  if (!avatarFile) return;

  const formData = new FormData();
  formData.append("file", avatarFile);
  console.log("Plik:", avatarFile.name, avatarFile.type, avatarFile.size);
console.log(formData);
  try {
    const res = await api.post("/api/account/upload-avatar", formData);
    
    // aktualizujemy globalny user (np. login z AuthContext)
    login(res.data); 
    
    setStatusMessage({ type: "success", text: "Zdjęcie profilowe zaktualizowane!" });
    setAvatarFile(null); // reset input
    console.log(res.data)
  } catch {
    setStatusMessage({ type: "error", text: "Nie udało się zaktualizować zdjęcia." });
  }
};

  const handleEnableMfa = async (selectedMethod: MfaMethod) => {
    try {
      setStatusMessage(null);
      setMethod(selectedMethod);
      const res = await api.post<MfaSetupResponse>(`/api/account/enable-mfa?method=${selectedMethod}`);
      if (selectedMethod === "authenticator") {
        setMfaData(res.data);
      } else {
        setStatusMessage({ type: 'info', text: "Kod weryfikacyjny został wysłany na Twój e-mail." });
      }
    } catch {
      setMethod(null);
      setStatusMessage({ type: 'error', text: "Nie udało się rozpocząć konfiguracji MFA." });
    }
  };

  const openDisableMfa = async () => {
    setShowDisableMfa(true);
    setDisableCode("");
    setStatusMessage(null);
    try {
      await api.post("/api/account/send-disable-code");
    } catch {
      setStatusMessage({ type: "error", text: "Nie udało się wysłać kodu" });
    }
  };

  const disableMfa = async () => {
    try {
      await api.post("/api/account/disable-mfa", { code: disableCode });
      const res = await api.get("/api/account");
      login(res.data);
      setStatusMessage({ type: "success", text: "MFA zostało wyłączone" });
    } catch {
      setStatusMessage({ type: "error", text: "Nieprawidłowy kod" });
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/account/confirm-mfa-enable", JSON.stringify(code), {
        headers: { "Content-Type": "application/json" }
      });
      // Aktualizujemy globalny stan (user.isMfaEnabled stanie się true)
      login(res.data);
      setStatusMessage({ type: "success", text: "MFA aktywowane pomyślnie!" });
    } catch {
      setStatusMessage({ type: 'error', text: "Nieprawidłowy kod. Spróbuj ponownie." });
    }
  };

 const handleSaveBio = async () => {
    try {
      setIsSavingDesc(true);
      
      // POPRAWKA: Pobierz odpowiedź bezpośrednio z PUT (backend zwraca UserDto)
      const res = await api.put("/api/account/update-bio", { bio: description });

      login(res.data); 
      
      setStatusMessage({ type: "success", text: "Opis zapisany" });
    } catch {
      setStatusMessage({ type: "error", text: "Nie udało się zapisać opisu" });
    } finally {
      setIsSavingDesc(false);
    }
  };

  if (!user) return <div className="content"><p>Musisz być zalogowany.</p></div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <header className="profile-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span>←</span> Wróć do panelu
          </button>
        </header>

        <section className="profile-card profile-main-info">
          <div className="avatar-placeholder">
  {user.avatarUrl ? (
    <img  src={user.avatarUrl?.startsWith('http') 
    ? user.avatarUrl 
    : `http://localhost:5269${user.avatarUrl}`} alt="Avatar" className="avatar-image" />
  ) : (
    <span>{user.userName[0].toUpperCase()}</span>
  )}
</div>

<input type="file" accept="image/*" onChange={handleAvatarChange} />
{avatarFile && (
  <button className="btn-primary" onClick={handleUploadAvatar}>
    Zaktualizuj zdjęcie
  </button>
)}
          <div className="info-text">
            <h1>{user.displayName}</h1>
            <p className="username">@{user.userName}</p>
            {user.bio ? <p className="bio-preview">"{user.bio}"</p> : <p className="bio-empty">Brak opisu profilu</p>}
          </div>
        </section>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="card-header">
              <h3>O mnie</h3>
              <p>Twój publiczny opis widoczny dla innych.</p>
            </div>
            
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Napisz coś o sobie..."
              maxLength={200}
            />
            <div className="card-footer">
              <span className="char-count">{description.length}/200</span>
              <button className="btn-primary" disabled={isSavingDesc} onClick={handleSaveBio}>
                {isSavingDesc ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </div>
          </section>

  {/* Sekcja: CEL I HISTORIA */}
  <section className="profile-card">
    <div className="card-header">
      <h3>Postępy i Historia</h3>
      <p>Twój cel roczny oraz archiwum lektur.</p>
    </div>

    <div className="goal-section-content">
      <input
        type="number"
        min={1}
        max={1000}
        value={goal}
        onChange={(e) => setGoal(Number(e.target.value))}
        className="goal-input"
      />
      <button className="btn-primary" disabled={isSavingGoal} onClick={handleSaveGoal}>
        {isSavingGoal ? "Zapisywanie..." : "Zaktualizuj cel"}
      </button>
    </div>

    <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />

    <button className="btn-primary" onClick={() => navigate('/profile/history')}>
      
      <span>Pełna historia przeczytanych</span>
    </button>
  </section>

          <section className="profile-card">
            <div className="card-header">
              <h3>Bezpieczeństwo</h3>
              <p>Weryfikacja dwuetapowa chroni Twoje konto.</p>
            </div>

            {user.isMfaEnabled ? (
              <div className="mfa-active-status">
                <div className="status-badge">
                  <span className="dot pulse"></span> MFA Aktywne
                </div>
                {!showDisableMfa ? (
                  <button className="btn-danger-outline" onClick={openDisableMfa}>Wyłącz zabezpieczenia</button>
                ) : (
                  <div className="inline-action-box">
                    <input value={disableCode} onChange={e => setDisableCode(e.target.value)} placeholder="Kod z maila" maxLength={6} />
                    <div className="action-buttons">
                      <button onClick={disableMfa} className="btn-danger">Wyłącz</button>
                      <button className="btn-primaryt" onClick={() => setShowDisableMfa(false)}>Anuluj</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mfa-setup-options">
                {!method ? (
                  <div className="mfa-actions-grid">
                    <button className="method-card" onClick={() => handleEnableMfa("authenticator")}>
                      <span className="icon">📱</span>
                      <strong>Authenticator</strong>
                      <small>Aplikacja mobilna</small>
                    </button>
                    <button className="method-card" onClick={() => handleEnableMfa("email")}>
                      <span className="icon">📧</span>
                      <strong>E-mail</strong>
                      <small>Kod na pocztę</small>
                    </button>
                  </div>
                ) : (
                  <div className="setup-workflow">
                    {method === "authenticator" && mfaData && (
                      <div className="qr-container">
                        <img src={mfaData.qrCodeSetupImageUrl} alt="QR" className="qr-image" />
                        <p className="manual-key">Klucz: <code>{mfaData.manualEntryKey}</code></p>
                      </div>
                    )}
                    <form onSubmit={handleVerifyMfa} className="verify-inline">
                      <input type="text" maxLength={6} placeholder="Kod" value={code} onChange={e => setCode(e.target.value)} required />
                      <button type="submit" className="btn-primary">Zweryfikuj</button>
                    </form>
                    <button className="btn-primary" onClick={() => { setMethod(null); setMfaData(null); }}>Anuluj</button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {statusMessage && (
          <div className={`toast-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;