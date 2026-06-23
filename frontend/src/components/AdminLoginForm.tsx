import React, { useState } from "react";
import api from "../axios";
import { UserDto } from "../utils/types";
import { useNavigate } from "react-router-dom";
import { MfaVerifyModal } from "./MfaVerifyModal";

interface AdminLoginFormProps {
  onLogin: (user: UserDto) => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tempUser, setTempUser] = useState<UserDto | null>(null);
  const [showMfaModal, setShowMfaModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post<UserDto>("/api/Account/login", {
        email,
        password,
      });

      if (res.data.isMfaRequired) {
        setTempUser({ ...res.data, email: email });
        setShowMfaModal(true);
      } else {
        // Logowanie bez MFA
        onLogin(res.data);
        navigate("/admin");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        if (typeof err.response.data === "string") setError(err.response.data);
        else if (Array.isArray(err.response.data))
          setError(err.response.data.map((e: any) => e.description).join(", "));
        else setError("Wystąpił błąd logowania.");
      } else {
        setError("Błąd połączenia z serwerem.");
      }
    }
  };

  return (
    <div className="login-card">
      <h3>Zaloguj się jako administrator</h3>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="login">Email / Login</label>
          <input
            id="login"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Hasło</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Zaloguj
          </button>
        </div>
      </form>

      {showMfaModal && tempUser && (
        <MfaVerifyModal
          tempUser={tempUser}
          onSuccess={(userWithToken) => {
            setShowMfaModal(false);
            onLogin(userWithToken);
            navigate("/admin");
          }}
          onCancel={() => {
            setShowMfaModal(false);
            setTempUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminLoginForm;
