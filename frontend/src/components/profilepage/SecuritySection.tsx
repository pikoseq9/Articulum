import React from 'react';

interface SecuritySectionProps {
  user: any;
  method: string | null;
  mfaData: any;
  code: string;
  setCode: (val: string) => void;
  disableCode: string;
  setDisableCode: (val: string) => void;
  showDisableMfa: boolean;
  setShowDisableMfa: (val: boolean) => void;
  onEnableMfa: (method: "authenticator" | "email") => void;
  onVerifyMfa: (e: React.FormEvent) => void;
  onDisableMfa: () => void;
  onOpenDisableMfa: () => void;
  onCancelSetup: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = (props) => {
  const { 
    user, method, mfaData, code, setCode, disableCode, setDisableCode, 
    showDisableMfa, setShowDisableMfa, onEnableMfa, onVerifyMfa, 
    onDisableMfa, onOpenDisableMfa, onCancelSetup 
  } = props;

  return (
    <section className="profile-card">
      <div className="card-header">
        <h3>Bezpieczeństwo</h3>
        <p>Weryfikacja dwuetapowa chroni Twoje konto.</p>
      </div>
      
      {user.isMfaEnabled ? (
        <div className="mfa-active-status">
          <div className="status-badge"><span className="dot pulse"></span> MFA Aktywne</div>
          {!showDisableMfa ? (
            <button className="btn-danger-outline" onClick={onOpenDisableMfa}>Wyłącz zabezpieczenia</button>
          ) : (
            <div className="inline-action-box">
              <input value={disableCode} onChange={e => setDisableCode(e.target.value)} placeholder="Kod" maxLength={6} />
              <div className="action-buttons">
                <button onClick={onDisableMfa} className="btn-danger">Wyłącz</button>
                <button className="btn-primaryt" onClick={() => setShowDisableMfa(false)}>Anuluj</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mfa-setup-options">
          {!method ? (
            <div className="mfa-actions-grid">
              <button className="method-card" onClick={() => onEnableMfa("authenticator")}>
                <span className="icon">📱</span><strong>Authenticator</strong>
              </button>
              <button className="method-card" onClick={() => onEnableMfa("email")}>
                <span className="icon">📧</span><strong>E-mail</strong>
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
              <form onSubmit={onVerifyMfa} className="verify-inline">
                <input type="text" maxLength={6} placeholder="Kod" value={code} onChange={e => setCode(e.target.value)} required />
                <button type="submit" className="btn-primary">Zweryfikuj</button>
              </form>
              <button className="btn-primary" onClick={onCancelSetup}>Anuluj</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};