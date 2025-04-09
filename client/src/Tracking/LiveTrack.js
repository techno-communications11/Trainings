import React, { useState } from 'react';
import { Search, Package, Calendar, Clock, Truck, User, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

const LiveTrack = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => setTrackingNumber(e.target.value);

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
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Tracking data:', data); // Debugging line
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
    if (statusLower.includes('picked up') || statusLower.includes('label created')) return '#ffc107';
    return '#6c757d';
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: '—', time: '—' };
    
    // Split the ISO string to preserve the original date and time without time zone conversion
    const [datePart] = dateTime.split('T');
    const timePart = dateTime.split('T')[1].split('-')[0]; // Extract time before offset (e.g., "17:36:24")
    
    // Convert 24-hour time to 12-hour format with AM/PM
    const [hours, minutes, seconds] = timePart.split(':');
    let period = 'AM';
    let twelveHour = parseInt(hours, 10);
    
    if (twelveHour >= 12) {
        period = 'PM';
        if (twelveHour > 12) {
            twelveHour -= 12;
        }
    } else if (twelveHour === 0) {
        twelveHour = 12;
    }
    
    const twelveHourTime = `${twelveHour}:${minutes}:${seconds} ${period}`;
    
    return {
        date: datePart, // e.g., "2025-03-18"
        time: twelveHourTime, // e.g., "5:36:24 PM"
    };
};

  const formatShortDate = (dateTime) => {
    if (!dateTime) return '—';
    // Extract the date part from the ISO string without conversion
    const [datePart] = dateTime.split('T');
    const [year, month, day] = datePart.split('-');
    return `${month}/${day}/${year.slice(-2)}`; // e.g., "03/18/25"
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <Package size={48} className="text-primary mb-3" style={{ animation: 'bounce 2s infinite' }} />
        <h2 className="display-6 fw-bold text-gradient">
          Track Your Package <img src="/fedex.webp" height={80} alt="FedEx Logo" />
        </h2>
        <p className="text-muted lead">Enter your tracking number for detailed status updates</p>
      </div>

      <div className="row justify-content-center mb-4">
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
            />
            <button
              className="btn btn-primary px-4 fw-bold"
              onClick={handleTrack}
              disabled={loading}
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center my-4">
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
          <div className="card-header bg-white border-bottom p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Truck className="text-primary me-3" size={32} />
                <div>
                  <h4 className="mb-1 fw-bold">Tracking Number: {trackingData.trackingNumber}</h4>
                  <p className="mb-0 text-muted">Service: {trackingData.serviceType}</p>
                </div>
              </div>
              <div>
                <span className="badge fs-6" style={{ backgroundColor: getStatusColor(trackingData.statusByLocale), color: '#fff' }}>
                  {trackingData.statusByLocale}
                </span>
              </div>
            </div>
          </div>

          <div className="card-body p-4">
            <div className="row g-4">
              {/* Latest Update */}
              <div className="col-12">
                <div className="p-3 bg-light rounded-3">
                  <h5 className="fw-bold mb-3">Latest Update</h5>
                  <div className="d-flex align-items-start">
                    <CheckCircle size={24} style={{ color: getStatusColor(trackingData.statusByLocale) }} />
                    <div className="ms-3">
                      <p className="mb-1 fs-5" style={{ color: getStatusColor(trackingData.statusByLocale) }}>
                        {trackingData.statusByLocale}
                      </p>
                      <p className="text-muted mb-0">{trackingData.description}</p>
                      {trackingData.actualDeliveryDate && (
                        <p className="text-muted mt-1">
                          Delivered on: {formatShortDate(trackingData.actualDeliveryDate)} at{' '}
                          {formatDateTime(trackingData.actualDeliveryDate).time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipment Facts */}
              <div className="col-md-6">
                <div className="p-3 border rounded-3 h-100">
                  <h5 className="fw-bold mb-3">Shipment Facts</h5>
                  <p><strong>Service:</strong> {trackingData.serviceType}</p>
                  <p><strong>Packaging:</strong> {trackingData.packaging}</p>
                  <p><strong>Weight:</strong> {trackingData.weight}</p>
                  <p><strong>Shipped From:</strong> {trackingData.shipperCity}</p>
                  <p><strong>Destination:</strong> {trackingData.recipientCity}</p>
                  {trackingData.receivedByName && (
                    <p><strong>Signed for by:</strong> {trackingData.receivedByName}</p>
                  )}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="col-md-6">
                <div className="p-3 border rounded-3 h-100">
                  <h5 className="fw-bold mb-3">Delivery Details</h5>
                  <p><strong>Attempts:</strong> {trackingData.deliveryAttempts}</p>
                  {trackingData.actualDeliveryDate && (
                    <p><strong>Delivered:</strong> {formatShortDate(trackingData.actualDeliveryDate)} at{' '}
                    {formatDateTime(trackingData.actualDeliveryDate).time}</p>
                  )}
                </div>
              </div>

              {/* Tracking History */}
              {trackingData.events && trackingData.events.length > 0 && (
                <div className="col-12">
                  <div className="p-3 border rounded-3">
                    <h5 className="fw-bold mb-3">Travel History</h5>
                    <ul className="timeline">
                      {trackingData.events.map((event, index) => {
                        const { date, time } = formatDateTime(event.dateTime);
                        return (
                          <li key={index} className="timeline-item mb-4">
                            <div className="timeline-icon">
                              <MapPin size={20} style={{ color: getStatusColor(event.derivedStatus) }} />
                            </div>
                            <div className="timeline-content">
                              <h6 className="fw-semibold mb-1">{event.event}</h6>
                              <p className="text-muted mb-1">{event.location}</p>
                              <p className="text-muted mb-0">
                                {formatShortDate(event.dateTime)} at {time}
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
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        .text-gradient {
          background: linear-gradient(45deg, #4a154b, #007bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .transition {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default LiveTrack;