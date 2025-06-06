import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { BACKEND_URL } from "../config/config";

export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/verify`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Not authenticated');
        setAuthed(true);
      } catch {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  return authed
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
