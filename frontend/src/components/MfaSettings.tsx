import React, { useState } from "react";
import api from "../axios";
import { useAuth } from "../authContext";

type SetupStep = "idle" | "setup-auth" | "disable";

export const MfaSettings = () => {
  const { user, login } = useAuth();

  const [step, setStep] = useState<SetupStep>("idle");
  const [mfaCode, setMfaCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaMessage, setMfaMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  if (!user) return null;

  const handleStartSetup = async () => {
    setMfaError("");
    setMfaMessage("");
    try {
      const res = await api.post(
        `/api/Account/enable-mfa?method=authenticator`,
      );
      setQrCodeUrl(res.data.qrCodeSetupImageUrl);
      setManualKey(res.data.manualEntryKey);
      setStep("setup-auth");
    } catch (err: any) {
      setMfaError("Nie udało się rozpocząć konfiguracji.");
    }
  };

  const handleConfirmSetup = async () => {
    setMfaError("");
    try {
      const res = await api.post(
        "/api/Account/confirm-mfa-enable",
        `"${mfaCode}"`,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      login(res.data);
      setStep("idle");
      setMfaCode("");
      setMfaMessage("Weryfikacja dwuetapowa została pomyślnie włączona!");
    } catch (err: any) {
      setMfaError(err.response?.data || "Nieprawidłowy kod.");
    }
  };

  const handleStartDisable = async () => {
    setMfaError("");
    setMfaMessage("");
    try {
      await api.post("/api/Account/send-disable-code");
      setStep("disable");
      setMfaMessage(
        "Wprowadź kod z aplikacji Authenticator, aby zatwierdzić wyłączenie ochrony.",
      );
    } catch (err) {
      setMfaError("Błąd podczas żądania wyłączenia.");
    }
  };

  const handleConfirmDisable = async () => {
    setMfaError("");
    try {
      await api.post("/api/Account/disable-mfa", { code: mfaCode });
      login({ ...user, isMfaEnabled: false, mfaMethod: null });
      setStep("idle");
      setMfaCode("");
      setMfaMessage("Weryfikacja dwuetapowa została wyłączona.");
    } catch (err: any) {
      setMfaError(err.response?.data || "Nieprawidłowy kod.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdMessage("");

    if (newPassword !== confirmPassword) {
      setPwdError("Nowe hasła nie są identyczne.");
      return;
    }

    try {
      await api.post("/api/Account/change-password", {
        currentPassword,
        newPassword,
      });
      setPwdMessage("Hasło zostało pomyślnie zmienione.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.response?.data && typeof err.response.data === "string") {
        setPwdError(err.response.data);
      } else {
        setPwdError(
          "Nie udało się zmienić hasła. Sprawdź obecne hasło i wymagania bezpieczeństwa.",
        );
      }
    }
  };

  return (
    <div className="admin-articles mfa-settings-container">
      <section>
        <h3 className="mfa-section-title">Weryfikacja dwuetapowa (MFA)</h3>

        {mfaMessage && <p className="mfa-success-text">{mfaMessage}</p>}
        {mfaError && <p className="mfa-error-text">{mfaError}</p>}

        {step === "idle" && (
          <div className="article-row mfa-article-row">
            <div className="article-info">
              <span className="article-title">Ochrona logowania (MFA)</span>
              <p className="mfa-status-text">
                Stan:{" "}
                <b
                  className={
                    user.isMfaEnabled
                      ? "mfa-status-enabled"
                      : "mfa-status-disabled"
                  }
                >
                  {user.isMfaEnabled ? "Włączone" : "Wyłączone"}
                </b>
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
                  onClick={handleStartSetup}
                >
                  Skonfiguruj MFA
                </button>
              )}
            </div>
          </div>
        )}

        {(step === "setup-auth" || step === "disable") && (
          <div className="mfa-setup-container">
            <h4 className="mfa-subtitle">
              {step === "disable"
                ? "Autoryzuj wyłączenie MFA"
                : "Konfiguracja aplikacji Authenticator"}
            </h4>

            {step === "setup-auth" && (
              <div className="qr-code-container mfa-qr-container">
                <img src={qrCodeUrl} alt="QR Code" className="mfa-qr-img" />
                <p className="mfa-manual-key-text">
                  Klucz ręczny: <b>{manualKey}</b>
                </p>
              </div>
            )}

            <div className="admin-form">
              <input
                type="text"
                placeholder="Wprowadź 6-cyfrowy kod"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                className="mfa-code-input"
              />
              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setStep("idle");
                    setMfaCode("");
                  }}
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={
                    step === "disable"
                      ? handleConfirmDisable
                      : handleConfirmSetup
                  }
                >
                  Zatwierdź
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
