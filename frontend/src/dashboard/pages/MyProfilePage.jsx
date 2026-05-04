import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const MyProfilePage = () => {
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch('/api/employees/');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setEmployeeId(data[0].id);
          }
        }
      } catch {}
      setLoading(false);
    };
    fetchEmployee();
  }, []);

  if (loading) return <p className="loading">Loading...</p>;
  if (!employeeId) return <p className="loading">No profile found.</p>;

  return <Navigate to={`/dashboard/employees/${employeeId}`} replace />;
};

export default MyProfilePage;