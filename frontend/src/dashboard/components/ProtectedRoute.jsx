import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    fetch('/api/me/')
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null;
  return authed ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;