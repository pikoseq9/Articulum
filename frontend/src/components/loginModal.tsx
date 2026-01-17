import React, { useState } from "react";
import api from "../axios";
import { useAuth } from "../authContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void; 
}

interface UserDto {
  displayName: string;
  userName: string;
  token: string;
  isMfaRequired: boolean;
  isMfaEnabled: boolean;
  mfaMethod?: "authenticator" | "email"; 
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); 
  const [username, setUsername] = useState(""); 

  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
    const [mfaMethod, setMfaMethod] = useState<"authenticator" | "email" | null>(null);

  if (!isOpen) return null;

  const handleLoginResponse = (data: UserDto) => {
      if (data.isMfaRequired) {
        
          setStep("mfa");
          setMfaMethod(data.mfaMethod || null);
          setError("");
          if (data.mfaMethod === "email") {
              setError("Kod został wysłany na Twój e-mail");
          }
      } else {
          onLogin(data);
          onClose();
          resetForm();
      }
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        const res = await api.post<UserDto>("/account/login", { email, password });
        handleLoginResponse(res.data);
      } else {
        const res = await api.post<UserDto>("/account/register", { 
            email, 
            password, 
            displayName: displayName, 
            userName: username 
        });
        onLogin(res.data); 
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
          const errors = Object.values(err.response.data.errors).flat().join(", ");
          setError(errors);
      } else if (typeof err.response?.data === 'string') {
          setError(err.response.data);
      } else {
          setError("Błąd logowania/rejestracji");
      }
    }
  };

  const submitMfa = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await api.post<UserDto>("/account/verify-mfa", { email, code: mfaCode });
          onLogin(res.data);
          onClose();
          resetForm();
      } catch (err: any) {
          setError("Nieprawidłowy kod MFA");
      }
  }

  const resetForm = () => {
      setStep("credentials");
      setEmail("");
      setPassword("");
      setDisplayName("");
      setUsername("");
      setMfaCode("");
      setError("");
      setMfaMethod(null);
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
            {step === "mfa" ? "Weryfikacja dwuetapowa" : (mode === "login" ? "Logowanie" : "Rejestracja")}
        </h2>

        {step === "credentials" && (
            <form onSubmit={submitCredentials}>
            {mode === "register" && (
                <>
                    <input
                        type="text"
                        placeholder="Nazwa użytkownika (login)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nazwa wyświetlana"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                    />
                </>
            )}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {error && <p className="error" style={{color: 'red', fontSize: '0.9em'}}>{error}</p>}

            <div className="modal-buttons">
                <button type="submit" className="btn-login">{mode === "login" ? "Dalej" : "Zarejestruj"}</button>
                <button type="button" className="btn-toggle" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? "Przejdź do rejestracji" : "Przejdź do logowania"}
                </button>
            </div>
            </form>
        )}

        {step === "mfa" && (
            <form onSubmit={submitMfa}>
                {mfaMethod === "authenticator" && (
                    <p>Podaj 6-cyfrowy kod z aplikacji Authenticator.</p>
                )}
                {mfaMethod === "email" && (
                    <p>Podaj kod wysłany na Twój e-mail.</p>
                )}
                <input 
                    type="text" 
                    placeholder="Kod 6-cyfrowy"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    maxLength={6}
                    autoFocus
                />
                 {error && <p className="error" style={{color: 'red'}}>{error}</p>}
                 <button type="submit" className="btn-login">Zaloguj</button>
                 <button type="button" onClick={() => {setStep("credentials"); setError("")}} style={{marginTop: '10px'}}>Wróć</button>
            </form>
        )}

        <button className="btn-close" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default LoginModal;