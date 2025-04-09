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
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch tracking data');
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
    const headers = ['SI.NO', 'Tracking Number', 'Status', 'Description', 'Date', 'Time', 'Attempts', 'Received By', 'Service Type'];
    const csvData = [
      headers.join(','),
      ...trackingData.map((item, index) => {
        const relevantDate = item.statusByLocale.toLowerCase().includes('delivered')
          ? item.actualDeliveryDate
          : item.statusByLocale.toLowerCase().includes('out for delivery')
          ? item.outForDeliveryDate
          : item.estimatedDeliveryDate;
        const { date, time } = formatDateTime(relevantDate);
        return [
          index + 1,
          item.trackingNumber,
          item.statusByLocale,
          `"${item.description}"`,
          date,
          time,
          item.deliveryAttempts || '0',
          item.receivedByName || '',
          item.serviceType || '',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tracking_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return 'bg-success';
    if (statusLower.includes('out for delivery')) return 'bg-primary';
    if (statusLower.includes('on the way') || statusLower.includes('in transit')) return 'bg-warning';
    if (statusLower.includes('error')) return 'bg-danger';
    return 'bg-secondary';
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: '/', time: '/' };

    // Parse the date string into a Date object
    const dateObj = new Date(dateTime);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return { date: '/', time: '/' };

    // Format date and time for human readability in America/Chicago time zone
    const optionsDate = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Chicago' };
    const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago' };

    const date = dateObj.toLocaleDateString('en-US', optionsDate); // e.g., "Mar 14, 2025"
    const time = dateObj.toLocaleTimeString('en-US', optionsTime); // e.g., "11:40 AM"

    return { date, time };
  };

  const filteredData = trackingData.filter(item =>
    (String(item.trackingNumber)?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (String(item.statusByLocale)?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (String(item.description)?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
        <h4 className="alert-heading mb-1">Failed to load tracking data</h4>
        <p className="mb-0">{error}</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3">
      <div className="card shadow-lg border-0 rounded-3">
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
                <span className="input-group-text bg-light border-end-0">
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
              <button onClick={handleDownload} className="btn btn-outline-success me-2">
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
                <th className="text-center fw-bold">Service Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                const relevantDate = item.statusByLocale.toLowerCase().includes('delivered')
                  ? item.actualDeliveryDate
                  : item.statusByLocale.toLowerCase().includes('out for delivery')
                  ? item.outForDeliveryDate
                  : item.estimatedDeliveryDate;
                const { date, time } = formatDateTime(relevantDate);
                return (
                  <tr key={item.trackingNumber}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center fw-semibold">{item.trackingNumber}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadgeClass(item.statusByLocale)} rounded-pill px-3 py-2`}>
                        {item.statusByLocale}
                      </span>
                    </td>
                    <td className="text-center">
                      <p className="text-muted mb-0 text-truncate" style={{ maxWidth: '300px' }}>
                        {item.description}
                      </p>
                    </td>
                    <td className="text-center">{date}</td>
                    <td className="text-center">{time}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark">{item.deliveryAttempts || '0'}</span>
                    </td>
                    <td className="text-center">{item.receivedByName || '—'}</td>
                    <td className="text-center">{item.serviceType || '—'}</td>
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