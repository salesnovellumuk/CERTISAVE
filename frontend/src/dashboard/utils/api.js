export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (res.status === 402) {
    window.location.href = '/dashboard/inactive';
    return null;
  }

  return res;
};