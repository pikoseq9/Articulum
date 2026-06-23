import React, { useState } from "react";
import api from "../axios";
import { useAuth } from "../authContext";

type SetupStep = "idle" | "select" | "setup-auth" | "setup-email" | "disable";

export const MfaSettings = () => {
  const { user, login } = useAuth();
  const [step, setStep] = useState<SetupStep>("idle");
  const [code, setCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!user) return null;

  const handleSelectMethod = async (method: "authenticator" | "email") => {
    setError("");
    try {
      const res = await api.post(`/api/Account/enable-mfa?method=${method}`);
      if (method === "authenticator") {
        setQrCodeUrl(res.data.qrCodeSetupImageUrl);
        setManualKey(res.data.manualEntryKey);
        setStep("setup-auth");
      } else {
        setMessage(res.data.message);
        setStep("setup-email");
      }
    } catch (err: any) {
      setError("Nie udało się rozpocząć konfiguracji.");
    }
  };

  const handleConfirmSetup = async () => {
    setError("");
    try {
      const res = await api.post(
        "/api/Account/confirm-mfa-enable",
        `"${code}"`,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      login(res.data);
      setStep("idle");
      setCode("");
      setMessage("MFA zostało pomyślnie włączone!");
    } catch (err: any) {
      setError(err.response?.data || "Nieprawidłowy kod.");
    }
  };

  const handleStartDisable = async () => {
    setError("");
    try {
      await api.post("/api/Account/send-disable-code");
      setStep("disable");
      setMessage(
        "Jeśli używasz e-maila, kod został wysłany. W przeciwnym razie wpisz kod z aplikacji.",
      );
    } catch (err) {
      setError("Błąd podczas żądania wyłączenia.");
    }
  };

  const handleConfirmDisable = async () => {
    setError("");
    try {
      await api.post("/api/Account/disable-mfa", { code });
      login({ ...user, isMfaEnabled: false, mfaMethod: null });
      setStep("idle");
      setCode("");
      setMessage("MFA zostało wyłączone.");
    } catch (err: any) {
      setError(err.response?.data || "Nieprawidłowy kod.");
    }
  };

  return (
    <div className="admin-articles" style={{ padding: "20px" }}>
      <h3>Bezpieczeństwo konta</h3>

      {message && (
        <p style={{ color: "#10b981", marginBottom: "15px" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

      {step === "idle" && (
        <div className="article-row">
          <div className="article-info">
            <span className="article-title">Weryfikacja dwuetapowa (MFA)</span>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Stan: <b>{user.isMfaEnabled ? "Włączone" : "Wyłączone"}</b>
            </p>
          </div>
          <div className="action-buttons">
            {user.isMfaEnabled ? (
              <button
                type="button"
                className="btn-cancel"
                onClick={handleStartDisable}
              >
                Wyłącz MFA
              </button>
            ) : (
              <button
                type="button"
                className="btn-submit"
                onClick={() => setStep("select")}
              >
                Skonfiguruj MFA
              </button>
            )}
          </div>
        </div>
      )}

      {step === "select" && (
        <div>
          <h4>Wybierz metodę autoryzacji:</h4>
          <div className="mfa-options">
            <div
              className="mfa-card"
              onClick={() => handleSelectMethod("authenticator")}
            >
              <span style={{ fontSize: "24px", display: "block" }}>📱</span>
              <b>Aplikacja Authenticator</b>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Skanuj kod QR za pomocą Google/Microsoft Auth
              </p>
            </div>
            <div
              className="mfa-card"
              onClick={() => handleSelectMethod("email")}
            >
              <span style={{ fontSize: "24px", display: "block" }}>📧</span>
              <b>Wiadomość E-mail</b>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Odbieraj jednorazowe kody na swoją skrzynkę
              </p>
            </div>
          </div>
          <button
            className="text-link-btn"
            style={{ marginTop: "15px" }}
            onClick={() => setStep("idle")}
          >
            Powrót
          </button>
        </div>
      )}

      {(step === "setup-auth" ||
        step === "setup-email" ||
        step === "disable") && (
        <div style={{ maxWidth: "400px" }}>
          <h4>
            {step === "disable"
              ? "Autoryzuj wyłączenie MFA"
              : "Potwierdź konfigurację"}
          </h4>

          {step === "setup-auth" && (
            <div className="qr-code-container">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                style={{ width: "200px", height: "200px" }}
              />
              <p style={{ fontSize: "12px", color: "#666" }}>
                Klucz ręczny: {manualKey}
              </p>
            </div>
          )}

          <div className="admin-form" style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="Wprowadź 6-cyfrowy kod"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setStep("idle");
                  setCode("");
                }}
              >
                Anuluj
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={
                  step === "disable" ? handleConfirmDisable : handleConfirmSetup
                }
              >
                Zatwierdź
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
