import { createContext, useContext, useEffect, useState } from "react";
import api from "./axios";

interface User {
  isMfaEnabled: boolean;
  displayName: string;
  userName: string;
  token: string;
}

interface AuthContextType {
  [x: string]: any;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);  

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    api.get<User>("/Account")
      .then(res => {
        setUser(res.data);
        localStorage.setItem("jwt", res.data.token);
      })
      .catch(() => {
        localStorage.removeItem("jwt");
        setUser(null);
      });
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("jwt", userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
