import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Download, TruckIcon, Search, Filter } from 'lucide-react';
import { Table } from 'react-bootstrap';

const TrackingDataTable = () => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getalltrackingdata`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Important for sending cookies
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tracking data');
        }
        const data = await response.json();
        setTrackingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    try {
      // Convert data to CSV string
      const headers = ['Tracking Number', 'Status', 'Description', 'Delivery Date', 'Attempts', 'Received By'];
      const csvData = [
        headers.join(','),
        ...trackingData.map(item => [
          item.trackingNumber,
          item.statusByLocale,
          `"${item.description}"`,  // Handle commas in description
          item.deliveryDate,
          item.deliveryAttempts,
          item.receivedByName || ''
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'tracking_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return 'bg-success';
    if (statusLower.includes('in transit')) return 'bg-info';
    if (statusLower.includes('pending')) return 'bg-warning';
    if (statusLower.includes('failed')) return 'bg-danger';
    return 'bg-secondary';
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: '—', time: '—' };
  
    const [date, time] = dateTime.split('T');
    
    // Create a new Date object with the given time (UTC)
    const dateObj = new Date(dateTime);
  
    // Use UTC methods to get the correct time in AM/PM format
    const options = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };
    const formattedTime = new Intl.DateTimeFormat('en-US', options).format(dateObj);
    
    return {
      date: date,   // The date portion (e.g., 2025-01-13)
      time: formattedTime,  // The formatted time with AM/PM (e.g., 12:00 AM)
    };
  };
  
  
  
  const filteredData = trackingData.filter(item => {
    console.log('Tracking Number:', item.trackingNumber, 'Type:', typeof item.trackingNumber);  // Debug log
    return (
      (String(item.trackingNumber)?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (String(item.statusByLocale)?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (String(item.description)?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });
  
  

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-grow text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3 text-primary">Loading tracking data...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4 shadow-sm" role="alert">
        <div className="d-flex align-items-center">
          <div>
            <h4 className="alert-heading mb-1">Failed to load tracking data</h4>
            <p className="mb-0">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3">
      <div className="card shadow-lg border-0 rounded-3">
        {/* Header Section */}
        <div className="card-header bg-white py-3 border-bottom border-2">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h4 className="mb-0 text-primary d-flex align-items-center">
                <TruckIcon className="me-2" />
                Shipment Tracking
              </h4>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="  input-group-text bg-light border-end-0">
                  <Search className="text-warning fw-bold" size={18} />
                </span>
                <input
                  type="text"
                  className="form-control border shadow-none"
                  placeholder="Search tracking number, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4 text-end">
              <button 
                onClick={handleDownload} 
                className="btn btn-outline-success me-2"
              >
                <Download className="me-2" size={18} />
                Export CSV
              </button>
              <button className="btn btn-primary">
                <Filter className="me-2" size={18} />
                {filteredData.length} Shipments
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-responsive" style={{ maxHeight: '79vh' }}>
          <Table className="table table-hover align-middle mb-0 table-sm">
            <thead className="bg-light text-dark sticky-top">
              <tr>
                <th className="text-center fw-bold">SI.NO</th>
                <th className="text-center fw-bold">Tracking Number</th>
                <th className="text-center fw-bold">Status</th>
                <th className="text-center fw-bold">Description</th>
                <th className="text-center fw-bold">Date</th>
                <th className="text-center fw-bold">Time</th>
                <th className="text-center fw-bold">Attempts</th>
                <th className="text-center fw-bold">Received By</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                const { date, time } = formatDateTime(item.deliveryDate);
                console.log(date, time);  // This should now correctly show the expected time without issues.
                
                return (
                  <tr key={item.trackingNumber}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center fw-semibold">{item.trackingNumber}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadgeClass(item.statusByLocale)} rounded-pill px-3 py-2`}>
                        {item.statusByLocale}
                      </span>
                    </td>
                    <td>
                      <p className="text-muted mb-0 text-truncate text-center" style={{ maxWidth: '300px' }}>
                        {item.description}
                      </p>
                    </td>
                    <td className="text-center">{date}</td>
                    <td className="text-center">{time}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark">{item.deliveryAttempts}</span>
                    </td>
                    <td className="text-center">{item.receivedByName || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TrackingDataTable;
