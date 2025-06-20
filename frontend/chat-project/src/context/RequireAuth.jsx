// src/components/RequireAuth.jsx

import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { BACKEND_URL } from "../config/config";

export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const verifyUrl = `${BACKEND_URL}/auth/verify`;
      const token = localStorage.getItem("access_token");
      console.log("⏳ Calling verify at:", verifyUrl);

      try {
        const res = await fetch(verifyUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log("🔹 Verify response status:", res.status);
        if (!res.ok) throw new Error('Not authenticated');
        setAuthed(true);
      } catch (err) {
        console.log("❌ Verify failed:", err.message);
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  return authed ? <Outlet /> : <Navigate to="/login" replace />;
}
