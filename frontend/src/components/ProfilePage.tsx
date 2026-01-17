import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import { useAuth } from "../authContext";

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

  const handleEnableMfa = async (selectedMethod: MfaMethod) => {
    try {
      setStatusMessage(null);
      setMethod(selectedMethod);
      const res = await api.post<MfaSetupResponse>(`/account/enable-mfa?method=${selectedMethod}`);
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
      await api.post("/account/send-disable-code");
    } catch {
      setStatusMessage({ type: "error", text: "Nie udało się wysłać kodu" });
    }
  };

  const disableMfa = async () => {
    try {
      await api.post("/account/disable-mfa", { code: disableCode });
      const res = await api.get("/account");
      login(res.data);
      setShowDisableMfa(false);
      setStatusMessage({ type: "success", text: "MFA zostało wyłączone" });
    } catch {
      setStatusMessage({ type: "error", text: "Nieprawidłowy kod" });
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/account/confirm-mfa-enable", JSON.stringify(code), {
        headers: { "Content-Type": "application/json" }
      });
      setMethod(null);
      setMfaData(null);
      setCode("");
      if (user) login(res.data);
    } catch {
      setStatusMessage({ type: 'error', text: "Nieprawidłowy kod. Spróbuj ponownie." });
    }
  };

  if (!user) return <div className="content"><p>Musisz być zalogowany.</p></div>;

  return (
    <div className="content profile-container">
      <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>Powrót</button>
      
      <div className="profile-header">
        <h1>Twój Profil</h1>
        <div className="user-info">
          <p><strong>Użytkownik:</strong> {user.displayName} (<strong>{user.userName}</strong>)</p>
        </div>
      </div>

      <hr className="divider" />

      <div className="mfa-section">
        <h2>Bezpieczeństwo</h2>

        {user.isMfaEnabled ? (
          <>
            <div className="status-msg success" style={{ textAlign: 'center' }}>
              Weryfikacja dwuetapowa jest <strong>WŁĄCZONA</strong>.
            </div>
            <div style={{ marginTop: 20 }}>
              {!showDisableMfa ? (
                <button className="btn-danger" onClick={openDisableMfa}>Wyłącz MFA</button>
              ) : (
                <div className="mfa-disable-box">
                  <h4>Wyłącz MFA</h4>
                  <input value={disableCode} onChange={e => setDisableCode(e.target.value)} placeholder="123456" maxLength={6} />
                  <div style={{ marginTop: 10 }}>
                    <button onClick={disableMfa} className="btn-danger">Potwierdź</button>
                    <button className="btn-text" onClick={() => setShowDisableMfa(false)} style={{ marginLeft: 10 }}>Anuluj</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="mfa-desc">Zwiększ bezpieczeństwo konta wybierając metodę MFA:</p>
            {!method && (
              <div className="mfa-actions" style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" onClick={() => handleEnableMfa("authenticator")}>Authenticator</button>
                <button className="btn-secondary" onClick={() => handleEnableMfa("email")}>E-mail</button>
              </div>
            )}
          </>
        )}

        {statusMessage && <div className={`status-msg ${statusMessage.type}`}>{statusMessage.text}</div>}

        {method && !user.isMfaEnabled && (
          <div className="mfa-setup-box" style={{ marginTop: 20 }}>
            {method === "authenticator" && mfaData && (
              <>
                <h3>Konfiguracja Authenticatora</h3>
                <img src={mfaData.qrCodeSetupImageUrl} alt="QR" className="qr-image" />
                <div className="manual-key-box"><p>Klucz: <code>{mfaData.manualEntryKey}</code></p></div>
              </>
            )}
            {method === "email" && <h3>Weryfikacja E-mail</h3>}
            
            <form onSubmit={handleVerifyMfa} className="mfa-verify-form">
              <input type="text" maxLength={6} placeholder="123456" value={code} onChange={e => setCode(e.target.value)} required />
              <button type="submit" className="btn-primary">Potwierdź</button>
            </form>
            <button className="btn-text" onClick={() => { setMethod(null); setMfaData(null); }}>Anuluj</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;