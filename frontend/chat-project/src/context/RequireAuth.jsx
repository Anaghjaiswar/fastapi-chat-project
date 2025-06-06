// src/components/RequireAuth.jsx

import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { BACKEND_URL } from "../config/config";

export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      // Log the URL we’re about to fetch:
      const verifyUrl = `${BACKEND_URL}/auth/verify`;
      console.log("⏳ Calling verify at:", verifyUrl);

      try {
        const res = await fetch(verifyUrl, {
          credentials: 'include',
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
