import React, { useState } from 'react';
import { Search, Package, Calendar, Clock, Truck, User, CheckCircle, AlertCircle } from 'lucide-react';

const LiveTrack = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
  };

  const handleTrack = async () => {
    if (!trackingNumber) {
      setError('Please enter a tracking number');
      return;
    }
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/gettrackindividual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
        credentials: 'include', // Important for sending cookies
      });
      const data = await response.json();
      if (response.ok) {
        setTrackingData(data);
      } else {
        throw new Error(data.error || 'Failed to fetch tracking details');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tracking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return '#28a745';
    if (statusLower.includes('in transit') || statusLower.includes('on the way')) return '#007bff';
    if (statusLower.includes('pending')) return '#ffc107';
    return '#6c757d';
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: '—', time: '—' };
    // Parse "2025-03-13 11:59:19" as local time (PDT in this case)
    const [datePart, timePart] = dateTime.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split(':');
    const dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    // Adjust for PDT (-07:00) explicitly since FedEx provides local time
    dateObj.setHours(dateObj.getHours() - 6);

    const optionsDate = { year: '2-digit', month: 'numeric', day: 'numeric' };
    const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };
    return {
      date: dateObj.toLocaleDateString('en-US', optionsDate).replace(/\//g, '/'), // "3/13/25"
      time: dateObj.toLocaleTimeString('en-US', optionsTime), // "11:59 AM"
    };
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-2">
        <div className="mb-1">
          <Package size={48} className="text-primary mb-3" style={{ animation: 'bounce 2s infinite' }} />
        </div>
        <h2 className="display-6 fw-bold text-gradient">
          Track your package <img src="/fedex.webp" height={80} alt="FedEx Logo" />
        </h2>
        <p className="text-muted lead">Enter your tracking number to get the latest status</p>
      </div>

      <div className="row justify-content-center mb-1">
        <div className="col-md-8">
          <div className="input-group input-group-lg shadow-sm hover-shadow transition">
            <span className="input-group-text bg-white border-end-0">
              <Search className="text-primary" size={24} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={handleInputChange}
              style={{ borderColor: '#dee2e6' }}
            />
            <button
              className="btn btn-primary px-2 fw-bold"
              onClick={handleTrack}
              disabled={loading}
              style={{ transition: 'all 0.3s ease' }}
            >
              {loading ? 'Tracking...' : 'Track Package'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center my-1">
          <div className="spinner-grow text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center fade show" role="alert">
          <AlertCircle className="me-2" size={24} />
          <div>{error}</div>
        </div>
      )}

      {trackingData && (
        <div className="card shadow-lg border-0 rounded-3 animate__animated animate__fadeIn">
          <div className="card-header bg-white border-bottom p-2">
            <div className="d-flex align-items-center">
              <Truck className="text-primary me-3" size={32} />
              <div>
                <h4 className="mb-1 fw-bold">Tracking Details</h4>
                <p className="mb-0 text-muted">
                  Tracking Number: <span className="fw-semibold">{trackingData.trackingNumber}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="card-body p-3">
            <div className="row g-4">
              <div className="col-12">
                <div className="d-flex align-items-start p-3 bg-light rounded-3">
                  <CheckCircle size={24} style={{ color: getStatusColor(trackingData.statusByLocale) }} />
                  <div className="ms-3">
                    <h5 className="mb-1 fw-bold">Status</h5>
                    <p className="mb-1 fs-5" style={{ color: getStatusColor(trackingData.statusByLocale) }}>
                      {trackingData.statusByLocale}
                    </p>
                    <p className="text-muted mb-0">{trackingData.description}</p>
                  </div>
                </div>
              </div>

              {trackingData.deliveryDate && (
                <div className="col-md-6">
                  <div className="p-3 border rounded-3 h-100 hover-shadow">
                    <div className="d-flex align-items-start">
                      <Calendar className="text-primary" size={24} />
                      <div className="ms-3">
                        <h5 className="mb-2">Delivery Date</h5>
                        <p className="mb-0 fs-6">
                          Date: {formatDateTime(trackingData.deliveryDate).date} <br />
                          Time: {formatDateTime(trackingData.deliveryDate).time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <div className="p-3 border rounded-3 h-100 hover-shadow">
                  <div className="d-flex align-items-start">
                    <User className="text-primary" size={24} />
                    <div className="ms-3">
                      <h5 className="mb-2">Delivery Information</h5>
                      <p className="mb-1">Attempts: {trackingData.deliveryAttempts}</p>
                      {trackingData.receivedByName && (
                        <p className="mb-0">Received By: {trackingData.receivedByName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {trackingData.events && trackingData.events.length > 0 && (
                <div className="col-12">
                  <div className="p-3 border rounded-3">
                    <h5 className="mb-3 fw-bold">Tracking History</h5>
                    <ul className="timeline">
                      {trackingData.events.map((event, index) => {
                        const { date, time } = formatDateTime(event.dateTime);
                        return (
                          <li key={index} className="timeline-item mb-4">
                            <div className="timeline-icon">
                              <CheckCircle size={20} style={{ color: getStatusColor(event.event) }} />
                            </div>
                            <div className="timeline-content">
                              <h6 className="fw-semibold mb-1">{event.event}</h6>
                              <p className="text-muted mb-1">{event.location}</p>
                              <p className="text-muted mb-0">
                                {date} at {time}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .timeline {
          list-style: none;
          padding: 0;
          position: relative;
        }
        .timeline:before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 10px;
          width: 2px;
          background: #dee2e6;
        }
        .timeline-item {
          position: relative;
          display: flex;
          align-items: flex-start;
        }
        .timeline-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .timeline-content {
          flex: 1;
          padding-left: 20px;
        }
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }
        .text-gradient {
          background: linear-gradient(45deg, #4a154b, #007bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .transition {
          transition: all 0.3s ease;
        }
        .fade {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LiveTrack;