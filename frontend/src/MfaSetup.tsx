import React, { useState } from 'react';
import api from './axios';

type MfaMethod = "authenticator" | "email";

type MfaSetupProps = {
  onClose: () => void;
};
const MfaSetup: React.FC<MfaSetupProps> = ({ onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<MfaMethod | null>(null);
  


    const startSetup = async (selectedMethod: MfaMethod) => {
    setMethod(selectedMethod);

    const res = await api.post(
        `/account/enable-mfa?method=${selectedMethod}`
    );

    if (selectedMethod === "authenticator") {
        setQrCodeUrl(res.data.qrCodeSetupImageUrl);
        setManualKey(res.data.manualEntryKey);
    }

    if (selectedMethod === "email") {
        setMessage("Kod został wysłany na e-mail");
    }
};


    const confirmSetup = async () => {
        try {
            // W C# endpoint oczekuje stringa "code", axios domyślnie wysyła JSON
            // więc wysyłamy JSON string: "123456" z nagłówkiem Content-Type: application/json
            const res = await api.post("/account/confirm-mfa-enable", JSON.stringify(code), {
                headers: { 'Content-Type': 'application/json' }
            });
            setMessage("MFA zostało włączone pomyślnie!");
            setQrCodeUrl(null); // ukryj QR
        } catch (e) {
            setMessage("Błędny kod. Spróbuj ponownie.");
        }
    }

    return (
        <div style={{padding: 20, border: '1px solid #ccc', marginTop: 20}}>
            <h3>Uwierzytelnianie dwuskładnikowe (MFA)</h3>
            
    {/* WYBÓR METODY */}
    {!method && (
      <>
        <p>Wybierz metodę uwierzytelniania:</p>

        <button onClick={() => startSetup("authenticator")}>
          Aplikacja Authenticator
        </button>

        <button onClick={() => startSetup("email")}>
           Kod na e-mail
        </button>
      </>
    )}

    {/* AUTHENTICATOR */}
    {method === "authenticator" && qrCodeUrl && (
      <div>
                    <p>1. Zeskanuj ten kod w Google Authenticator / Microsoft Authenticator:</p>
                    <img src={qrCodeUrl} alt="QR Code" />
                    <p><small>Lub wpisz ręcznie: {manualKey}</small></p>

                    <p>2. Podaj kod z aplikacji aby potwierdzić:</p>
                    <input 
                        value={code} 
                        onChange={e => setCode(e.target.value)} 
                        placeholder="123456"
                    />
                    <button onClick={confirmSetup}>Potwierdź</button>
                </div>
    )}
    {/* EMAIL */}
        {method === "email" && (
        <div>
            <p>Kod został wysłany na Twój e-mail. Wpisz go poniżej, aby potwierdzić:</p>
            <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="123456"
            />
            <button onClick={confirmSetup}>Potwierdź</button>
        </div>
        )}
    {message && <p>{message}</p>}
        </div>

        
    );
  
};

export default MfaSetup;