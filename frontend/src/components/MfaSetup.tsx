import React, { useState } from 'react';
import api from '../axios';

type MfaMethod = "authenticator" | "email";

interface MfaSetupProps {
  onClose?: () => void;
}

const MfaSetup: React.FC<MfaSetupProps> = ({ onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<MfaMethod | null>(null);

    const startSetup = async (selectedMethod: MfaMethod) => {
    setMethod(selectedMethod);
    try {
        // ZMIANA: /api prefix
        const res = await api.post(`/api/account/enable-mfa?method=${selectedMethod}`);

        if (selectedMethod === "authenticator") {
            setQrCodeUrl(res.data.qrCodeSetupImageUrl);
            setManualKey(res.data.manualEntryKey);
        }
        if (selectedMethod === "email") {
            setMessage("Kod weryfikacyjny został wysłany na Twój e-mail.");
        }
    } catch(err) {
        setMessage("Błąd inicjalizacji MFA.");
    }
};

    const confirmSetup = async () => {
        try {
            await api.post("/api/account/confirm-mfa-enable", JSON.stringify(code), {
                headers: { 'Content-Type': 'application/json' }
            });
            setMessage("MFA zostało włączone pomyślnie! ✅");
            setQrCodeUrl(null);
            if(onClose) setTimeout(onClose, 2000);
        } catch (e) {
            setMessage("Błędny kod. Spróbuj ponownie.");
        }
    }

    return (
        <div className="mfa-setup-container">
            <h3>Konfiguracja MFA</h3>
            
            {!method && (
              <div className="mfa-choices">
                <button onClick={() => startSetup("authenticator")}>📲 Aplikacja Authenticator</button>
                <button onClick={() => startSetup("email")}>📧 Email</button>
              </div>
            )}

            {method === "authenticator" && qrCodeUrl && (
              <div className="qr-section">
                    <p>Zeskanuj kod w Google/Microsoft Authenticator:</p>
                    <img src={qrCodeUrl} alt="QR Code" style={{width: 150, height: 150}}/>
                    <p><small>Klucz ręczny: {manualKey}</small></p>
                    <input value={code} onChange={e => setCode(e.target.value)} placeholder="Kod z aplikacji" />
                    <button onClick={confirmSetup}>Potwierdź</button>
              </div>
            )}

            {method === "email" && (
                <div className="email-section">
                    <p>Wpisz kod z e-maila:</p>
                    <input value={code} onChange={e => setCode(e.target.value)} placeholder="Kod z maila" />
                    <button onClick={confirmSetup}>Potwierdź</button>
                </div>
            )}
            
            {message && <p className="mfa-message">{message}</p>}
        </div>
    );
};

export default MfaSetup;