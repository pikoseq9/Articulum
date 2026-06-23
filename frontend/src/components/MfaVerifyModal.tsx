import React, { useState } from "react";
import api from "../axios";
import { UserDto } from "../utils/types";

interface MfaVerifyModalProps {
  tempUser: UserDto;
  onSuccess: (userWithToken: UserDto) => void;
  onCancel: () => void;
}

export const MfaVerifyModal: React.FC<MfaVerifyModalProps> = ({
  tempUser,
  onSuccess,
  onCancel,
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<UserDto>("/api/Account/verify-mfa", {
        email: tempUser.email,
        code: code,
      });

      onSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data || "Nieprawidłowy kod weryfikacyjny.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Weryfikacja dwuetapowa</h3>
        <p style={{ marginBottom: "20px", color: "#64748b" }}>
          Wprowadź 6-cyfrowy kod z{" "}
          {tempUser.mfaMethod === "authenticator"
            ? "aplikacji Authenticator"
            : "wiadomości e-mail"}
          .
        </p>

        <form onSubmit={handleVerify} className="admin-form">
          <input
            type="text"
            placeholder="Wprowadź kod"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={6}
            style={{
              textAlign: "center",
              letterSpacing: "4px",
              fontSize: "20px",
            }}
          />

          {error && <p style={{ color: "red", margin: "10px 0" }}>{error}</p>}

          <div className="form-actions-row">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={loading}
            >
              Anuluj
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Weryfikacja..." : "Potwierdź"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
