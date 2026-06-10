'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setLoading(false);
  }, []);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API_URL });

    instance.interceptors.request.use((config) => {
      const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    return instance;
  }, [token]);

  useEffect(() => {
    if (loading) return;

    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [loading, token]);

  const login = async (email, senha) => {
    const res = await api.post('/auth/login', { email, senha });
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (nome, email, senha) => {
    const res = await api.post('/auth/register', { nome, email, senha });
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, api, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
