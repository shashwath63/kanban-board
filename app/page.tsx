'use client';

import React, { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Application } from '@/types';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchApplications(storedToken);
    }
  }, []);

  const fetchApplications = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/applications', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      } else {
        // If unauthorized, clear token
        if (res.status === 401) {
            setToken(null);
            localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        fetchApplications(data.token);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Auth error', error);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setApplications([]);
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          <h1 className="mb-6 text-center text-2xl font-bold">{isLogin ? 'Login' : 'Sign Up'}</h1>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <button type="submit" className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between bg-white p-4 shadow-sm dark:bg-gray-800">
        <h1 className="text-xl font-bold dark:text-white">House of Edtech</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">Loading...</div>
        ) : (
          <KanbanBoard initialApplications={applications} token={token} />
        )}
      </main>
    </div>
  );
}
