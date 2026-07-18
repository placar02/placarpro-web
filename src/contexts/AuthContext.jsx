'use client';

import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const csrfTokenRef = useRef(null);
  const [settings, setSettings] = useState({ system_name: 'PlacarPro', logo_url: '/placarpro-logo.png' });

  const updateSettingsTheme = useCallback((data = {}) => {
    setSettings((current) => ({ ...current, ...data }));
    if (data.system_name) document.title = data.system_name;
    if (data.primary_color) document.documentElement.style.setProperty('--primary-color', data.primary_color);
    if (data.secondary_color) document.documentElement.style.setProperty('--secondary-color', data.secondary_color);
    if (data.favicon_url) {
      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
      favicon.href = data.favicon_url;
    }
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/settings/public`).then(({ data }) => {
      updateSettingsTheme(data);
    }).catch(() => {});
  }, [updateSettingsTheme]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        csrfTokenRef.current = res.data.csrfToken || null;
        setUser(res.data.user);
      } catch (_err) {
        csrfTokenRef.current = null;
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API_URL, withCredentials: true });

    instance.interceptors.request.use((config) => {
      if (csrfTokenRef.current && !['get', 'head', 'options'].includes(String(config.method || '').toLowerCase())) {
        config.headers['X-CSRF-Token'] = csrfTokenRef.current;
      }
      return config;
    });

    return instance;
  }, []);

  const login = async (email, senha) => {
    const res = await api.post('/auth/login', { email, senha });
    csrfTokenRef.current = res.data.csrfToken || null;
    setUser(res.data.user);
  };

  const register = async (nome, email, senha) => {
    const res = await api.post('/auth/register', { nome, email, senha });
    csrfTokenRef.current = res.data.csrfToken || null;
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      csrfTokenRef.current = null;
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authenticated: Boolean(user), api, login, register, logout, loading, settings, updateSettingsTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
