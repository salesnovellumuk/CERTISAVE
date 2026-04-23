import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/BookingDetailPage.css';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking]                     = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeRequest, setChangeRequest]         = useState({ preferred_date: '', preferred_time: '', notes: '' });
  const [submitting, setSubmitting]               = useState(false);
  const [message, setMessage]                     = useState('');
  const [messageType, setMessageType]             = useState('success');

  useEffect(() => {
    const fetchBooking = async () => {
      const res = await fetch(`/api/booked-courses/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
      }
      setLoading(false);
    };
    fetchBooking();
  }, [id]);

  const showMsg = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 6000);
  };

  const handleSubmitChange = async () => {
    if (!changeRequest.preferred_date) {
      showMsg('Please provide a preferred date', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/change-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking:        id,
          preferred_date: changeRequest.preferred_date,
          preferred_time: changeRequest.preferred_time || null,
          notes:          changeRequest.notes,
        }),
      });
      if (res.ok) {
        setShowChangeRequest(false);
        setChangeRequest({ preferred_date: '', preferred_time: '', notes: '' });
        showMsg("Change request submitted. We'll be in touch shortly.");
      } else {
        showMsg('Something went wrong, please try again.', 'error');
      }
    } catch {
      showMsg('Something went wrong, please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const isUpcoming = (dateStr) => new Date(dateStr) >= new Date();

  if (loading) return <p className="loading">Loading...</p>;
  if (!booking) return <p className="loading">Booking not found.</p>;

  const upcoming = isUpcoming(booking.course_date);

  return (
    <div className="booking-detail-wrapper">
      <button onClick={() => navigate('/dashboard/bookings')} className="booking-detail-back">
        ← Back to Bookings
      </button>

      {message && (
        <div className={`booking-detail-message booking-detail-message--${messageType}`}>
          {message}
        </div>
      )}

      <div className={`booking-detail-banner ${upcoming ? 'booking-detail-banner--upcoming' : 'booking-detail-banner--past'}`}>
        {upcoming ? 'Upcoming booking' : 'Completed'}
      </div>

      <div className="booking-detail-card">
        <div className="booking-detail-card-top">
          <div className="booking-detail-date-block">
            <span className="booking-detail-day">
              {new Date(booking.course_date).toLocaleDateString('en-GB', { day: 'numeric' })}
            </span>
            <span className="booking-detail-month">
              {new Date(booking.course_date).toLocaleDateString('en-GB', { month: 'short' })}
            </span>
            <span className="booking-detail-year">
              {new Date(booking.course_date).toLocaleDateString('en-GB', { year: 'numeric' })}
            </span>
          </div>
          <div className="booking-detail-title-block">
            <h1 className="booking-detail-title">{booking.cert_type_name}</h1>
            <p className="booking-detail-employee">{booking.employee_name}</p>
          </div>
        </div>

        <div className="booking-detail-grid">
          <div className="booking-detail-field">
            <span className="booking-detail-field-label">Date</span>
            <span className="booking-detail-field-value">{formatDate(booking.course_date)}</span>
          </div>
          <div className="booking-detail-field">
            <span className="booking-detail-field-label">Time</span>
            <span className="booking-detail-field-value">
              {formatTime(booking.course_time) || <span className="booking-detail-empty">Not specified</span>}
            </span>
          </div>
          <div className="booking-detail-field">
            <span className="booking-detail-field-label">Provider</span>
            <span className="booking-detail-field-value">
              {booking.provider || <span className="booking-detail-empty">Not specified</span>}
            </span>
          </div>
          <div className="booking-detail-field">
            <span className="booking-detail-field-label">Location</span>
            <span className="booking-detail-field-value">
              {booking.location || <span className="booking-detail-empty">Not specified</span>}
            </span>
          </div>
          {booking.cost && (
            <div className="booking-detail-field">
              <span className="booking-detail-field-label">Cost</span>
              <span className="booking-detail-field-value">£{booking.cost}</span>
            </div>
          )}
          {booking.notes && (
            <div className="booking-detail-field booking-detail-field--wide">
              <span className="booking-detail-field-label">Notes</span>
              <span className="booking-detail-field-value">{booking.notes}</span>
            </div>
          )}
        </div>
      </div>

      {upcoming && (
        <div className="booking-detail-actions">
          <button onClick={() => setShowChangeRequest(true)} className="booking-detail-change-btn">
            Request a change
          </button>
        </div>
      )}

      {showChangeRequest && (
        <>
          <div className="booking-change-backdrop" onClick={() => setShowChangeRequest(false)} />
          <div className="booking-change-modal">
            <div className="booking-change-modal-handle" />
            <h3 className="booking-detail-change-title">Request a change</h3>
            <p className="booking-detail-change-subtitle">
              Let us know your preferred date and time and we'll do our best to accommodate.
            </p>
            <div className="booking-detail-form-row">
              <div className="booking-detail-form-field">
                <label className="booking-detail-label">Preferred date</label>
                <input
                  type="date"
                  value={changeRequest.preferred_date}
                  onChange={e => setChangeRequest(prev => ({ ...prev, preferred_date: e.target.value }))}
                  className="booking-detail-input booking-detail-input--date"
                />
              </div>
              <div className="booking-detail-form-field">
                <label className="booking-detail-label">Preferred time (optional)</label>
                <input
                  type="time"
                  value={changeRequest.preferred_time}
                  onChange={e => setChangeRequest(prev => ({ ...prev, preferred_time: e.target.value }))}
                  className="booking-detail-input booking-detail-input--date"
                />
              </div>
            </div>
            <label className="booking-detail-label">Additional notes (optional)</label>
            <textarea
              value={changeRequest.notes}
              onChange={e => setChangeRequest(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Anything else we should know..."
              className="booking-detail-textarea"
              rows={3}
            />
            <div className="booking-detail-form-actions">
              <button onClick={handleSubmitChange} disabled={submitting} className="booking-detail-save-btn">
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
              <button onClick={() => setShowChangeRequest(false)} className="booking-detail-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingDetailPage;