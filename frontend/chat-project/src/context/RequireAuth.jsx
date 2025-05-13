import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:8000/auth/verify', {
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
