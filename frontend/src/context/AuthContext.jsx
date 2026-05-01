import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  loginApi,
  registerApi,
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
} from "../api/authApi.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const persist = (u, t) => {
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const refreshProfile = useCallback(async () => {
    try {
      const res = await getProfileApi();
      const u = res?.data?.user;
      if (u) {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch {
      // token invalid — clear
      setUser(null);
      setToken(null);
      persist(null, null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [token, refreshProfile]);

  const login = async (payload) => {
    const res = await loginApi(payload);
    const u = res?.data?.user;
    const t = res?.data?.token;
    setUser(u);
    setToken(t);
    persist(u, t);
    return res;
  };

  const register = async (payload) => {
    const res = await registerApi(payload);
    const u = res?.data?.user;
    const t = res?.data?.token;
    setUser(u);
    setToken(t);
    persist(u, t);
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    persist(null, null);
  };

  const updateProfile = async (payload) => {
    const res = await updateProfileApi(payload);
    const u = res?.data?.user;
    if (u) {
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    }
    return res;
  };

  const changePassword = (payload) => changePasswordApi(payload);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
