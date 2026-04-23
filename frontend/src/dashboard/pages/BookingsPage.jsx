import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookingsPage.css';

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m));
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState('date_asc');
  const [search, setSearch]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await fetch('/api/booked-courses/');
      const data = await res.json();
      setBookings(data);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const getFiltered = () => {
    let result = [...bookings];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.employee_name?.toLowerCase().includes(q) ||
        b.cert_type_name?.toLowerCase().includes(q) ||
        b.provider?.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q)
      );
    }
    if (sort === 'date_asc')  return result.sort((a, b) => new Date(a.course_date) - new Date(b.course_date));
    if (sort === 'date_desc') return result.sort((a, b) => new Date(b.course_date) - new Date(a.course_date));
    if (sort === 'name_asc')  return result.sort((a, b) => a.employee_name.localeCompare(b.employee_name));
    if (sort === 'name_desc') return result.sort((a, b) => b.employee_name.localeCompare(a.employee_name));
    return result;
  };

  const isUpcoming = (dateStr) => new Date(dateStr) >= new Date();

  if (loading) return <p className="loading">Loading...</p>;

  const filtered  = getFiltered();
  const upcoming  = filtered.filter(b => isUpcoming(b.course_date));
  const past      = filtered.filter(b => !isUpcoming(b.course_date));

  const BookingCard = ({ booking, isPast }) => {
    const d = new Date(booking.course_date);
    return (
      <div
        className={`booking-card ${isPast ? 'booking-card--past' : ''}`}
        onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
      >
        <div className="booking-card-top">
          <div className={`booking-date-block ${isPast ? 'booking-date-block--past' : ''}`}>
            <span className="booking-day">{d.toLocaleDateString('en-GB', { day: 'numeric' })}</span>
            <span className="booking-month">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
          </div>
          <span className={`booking-status ${isPast ? 'booking-status--past' : 'booking-status--upcoming'}`}>
            {isPast ? 'Completed' : 'Upcoming'}
          </span>
        </div>
        <div className="booking-card-body">
          <p className="booking-name">{booking.employee_name}</p>
          <p className="booking-cert">{booking.cert_type_name}</p>
        </div>
        <div className="booking-card-meta">
          {booking.course_time && (
            <span className="booking-meta-item"><IconClock />{formatTime(booking.course_time)}</span>
          )}
          {booking.provider && (
            <span className="booking-meta-item"><IconBuilding />{booking.provider}</span>
          )}
          {booking.location && (
            <span className="booking-meta-item"><IconMapPin />{booking.location}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bookings-wrapper">
      <div className="bookings-header">
        <h1 className="bookings-title">Bookings</h1>
        <p className="bookings-subtitle">All booked training courses for your team.</p>

        <div className="bookings-controls">
          <div className="bookings-search-wrap">
            <IconSearch />
            <input
              type="text"
              placeholder="Search by name, cert, provider..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bookings-search"
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="bookings-select">
            <option value='date_asc'>Date (soonest first)</option>
            <option value='date_desc'>Date (latest first)</option>
            <option value='name_asc'>Name A–Z</option>
            <option value='name_desc'>Name Z–A</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="bookings-empty">
          {search ? 'No bookings match your search.' : 'No bookings yet. When a course is booked for a team member it will appear here.'}
        </p>
      )}

      {upcoming.length > 0 && (
        <div className="bookings-section">
          <h2 className="bookings-section-title">Upcoming</h2>
          <div className="bookings-grid">
            {upcoming.map(b => <BookingCard key={b.id} booking={b} isPast={false} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="bookings-section">
          <h2 className="bookings-section-title">Past</h2>
          <div className="bookings-grid">
            {past.map(b => <BookingCard key={b.id} booking={b} isPast={true} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;