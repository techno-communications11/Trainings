import React, { useState } from 'react'; //importing react and useState hook
import { Search, Package, Calendar,  Truck, User, CheckCircle, AlertCircle } from 'lucide-react';


const UpsLiveTrack = () => {
  const [trackingNumber, setTrackingNumber] = useState(''); // State to store the tracking number and set it or update it
  const [trackingData, setTrackingData] = useState(null); // State to store the tracking data and set it or update it
  // State to store the loading state and set it or update it
  const [loading, setLoading] = useState(false);
  // State to store the error message and set it or update it
  const [error, setError] = useState(null);
 
  const handleInputChange = (e) => { // Function to handle input change event
    setTrackingNumber(e.target.value); // Update the tracking number state with the input value
  };

  const handleTrack = async () => { // Function to handle track button click event
    // Check if the tracking number is empty and set an error message if it is
    if (!trackingNumber) { 
       // Set error message if tracking number is empty
      setError('Please enter a tracking number');
      return;
    }
    setLoading(true); // Set loading state to true
    // Reset error and tracking data states
    setError(null);
    // Reset tracking data state to null
    setTrackingData(null);
 // Make a POST request to the server to fetch tracking details

    try { // Try block to handle errors
      // Make a POST request to the server to fetch tracking details
      // await  is  to wait for the response from the server
      // fetch is a built-in function to make HTTP requests
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getupsindividual`, {
        method: 'POST', // HTTP method to use for the request
        // Headers to include in the request
        headers: {
          'Content-Type': 'application/json', // Content type of the request body
        },
        body: JSON.stringify({ trackingNumber }),
       credentials: 'include', // Include credentials (cookies) in the request
        // Include credentials (cookies) in the request
           // Convert the tracking number to JSON string and include it in the request body
      });
      const data = await response.json(); // Parse the response data as JSON  i
      if (response.ok) { // Check if the response is OK (status code 200)
        // If the response is OK, set the tracking data state with the response data
        setTrackingData(data);
      } else { // If the response is not OK, set an error message
        // Set error message with the error message from the response data or a default message
        throw new Error(data.error || 'Failed to fetch tracking details');
      }
    } catch (err) { // Catch block to handle errors
      // Set error message with the error message from the catch block or a default message
      setError(err.message || 'Failed to fetch tracking details');
    } finally { // Finally block to execute after try/catch
      // Set loading state to false after the request is completedw
      setLoading(false);
    }
  };

  console.log(trackingData, 'trackingData');

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return '#28a745';
    if (statusLower.includes('in transit') || statusLower.includes('on the way')) return '#007bff';
    if (statusLower.includes('pending')) return '#ffc107';
    return '#6c757d';
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: '—', time: '—' };

    const dateObj = new Date(dateTime);
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };

    return {
      date: dateObj.toLocaleDateString('en-US', optionsDate),
      time: dateObj.toLocaleTimeString('en-US', optionsTime),
    };
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="mb-1">
          <Package size={48} className="text-primary mb-3" style={{ animation: 'bounce 2s infinite' }} />
        </div>
        <h2 className="display-6 fw-bold text-gradient">Track your package <img src="/ups.jpg" height={80} alt="UPS Logo" /></h2>
        <p className="text-muted lead">Enter your tracking number to get the latest status</p>
      </div>

      {/* Search Box */}
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

      {/* Loading State */}
      {loading && (
        <div className="text-center my-1">
          <div className="spinner-grow text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center fade show" role="alert">
          <AlertCircle className="me-2" size={24} />
          <div>{error}</div>
        </div>
      )}

      {/* Tracking Results */}
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
              {/* Status Section */}
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

              {/* Delivery Date Section */}
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

              {/* Delivery Information Section */}
              <div className="col-md-6">
                <div className="p-3 border rounded-3 h-100 hover-shadow">
                  <div className="d-flex align-items-start">
                    <User className="text-primary" size={24} />
                    <div className="ms-3">
                      <h5 className="mb-2">Delivery Information</h5>
                      <p className="mb-1">Attempts: {trackingData.deliveryAttempts || 0}</p>
                      {trackingData.receivedByName && (
                        <p className="mb-0">Received By: {trackingData.receivedByName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Events Timeline */}
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

export default UpsLiveTrack;