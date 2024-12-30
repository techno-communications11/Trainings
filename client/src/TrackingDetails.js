import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './Login.css';  // Create this CSS file for styling
import { RxUpdate } from "react-icons/rx";
import { IoMdDownload } from "react-icons/io";

const TrackingDetails = () => {
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date,setDate]=useState(null);

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/tracking-details`);
        const data = await response.json();
        setTrackingDetails(data.trackingDetails);
        setFilteredDetails(data.trackingDetails);
        setDate([ ...new Set(data.trackingDetails.map((detail) => detail.Date))])
        const uniqueMarkets = [...new Set(data.trackingDetails.map((detail) => detail.Market))];
        setMarkets(uniqueMarkets);
      } catch (err) {
        setError('Error fetching tracking details. Please check the server or network connection.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingDetails();
  }, []);


  const handleMarketFilter = (event) => {
    const market = event.target.value;
    setSelectedMarket(market);

    if (market === 'All') {
      setFilteredDetails(trackingDetails);
    } else {
      setFilteredDetails(trackingDetails.filter((detail) => detail.Market === market));
    }
  };

  const getRowStyle = (assignedDate) => {
    // Get current date in Chicago (Central Time Zone)
    const currentDateChicago = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
    
    // Convert the current date in Chicago time to a Date object
    const chicagoDate = new Date(currentDateChicago);
  
    // Set the time to midnight for both dates to ignore the time part
    chicagoDate.setHours(0, 0, 0, 0);
    const assignedDateObj = new Date(assignedDate);
    assignedDateObj.setHours(0, 0, 0, 0);
  
    // Calculate the duration in days
    const duration = Math.ceil((chicagoDate - assignedDateObj) / (1000 * 60 * 60 * 24));
  
    if (duration-1 >= 14) {
      return 'table-danger'; // Red background for > 14 days
    } else if (duration-1 >= 7) {
      return 'table-warning'; // Yellow background for 7-14 days
    }
    return '';
  };
  
  const getComment = (assignedDate) => {
    // Get current date in Chicago (Central Time Zone)
    const currentDateChicago = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
    
    // Convert the current date in Chicago time to a Date object
    const chicagoDate = new Date(currentDateChicago);
  
    // Set the time to midnight for both dates to ignore the time part
    chicagoDate.setHours(0, 0, 0, 0);
    const assignedDateObj = new Date(assignedDate);
    assignedDateObj.setHours(0, 0, 0, 0);
  
    // Calculate the duration in days
    const duration = Math.ceil((chicagoDate - assignedDateObj) / (1000 * 60 * 60 * 24));
  
    if (duration-1 >= 14) return 'Overdue';
    return '';
  };
  


  const exportToExcel = () => {
    const dataToExport = filteredDetails.map((detail, index) => {
      const duration = Math.ceil((new Date() - new Date(detail.assignedDate)) / (1000 * 60 * 60 * 24));
      const comment = getComment(detail.assignedDate);
      
      return {
        'SI No': index + 1,
        'NTID': detail.ntid,
        'Name': detail.name,
        'Status': detail.status,
        'AssignedDate': detail.assignedDate,
        'Duration': `${duration-1} days`,
        'Comments': comment,
        'DM': detail.dm,
        'Mainstore': detail.mainstore.toLowerCase(),
        'Doorcode': detail.doorcode,
        'Market': detail.Market.toLowerCase()
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Training Report');
    XLSX.writeFile(wb, 'training_report.xlsx');
  };

  if (error) {
    return <div className="alert alert-danger p-2 small">{error}</div>;
  }

  if (loading) {
    return <div className="text-center p-2 text-muted small">Loading...</div>;
  }

  return (
    <div className="card shadow-sm mt-2">
      <div className="card-body p-2">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <button onClick={exportToExcel} className="btn btn-primary btn-sm">
              <IoMdDownload className='fs-5'/> Export Excel
            </button>
            <span className='text-end ms-5 text-success fw-bolder'><RxUpdate className='fs-3'/>
     &nbsp; Uploaded On: {date.toString().slice(5,7)+"/"+date.toString().slice(8,10)+"/"+date.toString().slice(0,4)}
</span>

          </div>

          <div className="text-center">
            <h4 className="small mb-0">
              Ready! Express - Self-Paced (NEW HIRE TRAINING)
              <span className="ms-2 text-muted float-left">{new Date().toLocaleDateString()}</span>
             
            </h4>
          </div>

          <div className="d-flex align-items-center">
            <label htmlFor="marketFilter" className="small mb-0">Filter by Market:</label>
            <select
              id="marketFilter"
              value={selectedMarket}
              onChange={handleMarketFilter}
              className="form-select form-select-sm shadow-none border"
            >
              <option value="All">All</option>
              {markets.map((market) => (
                <option key={market} value={market}>
                  {market}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive" style={{ maxHeight: '700px', overflowY: 'auto' }}>
          <table className="table table-bordered table-hover table-sm">
            <thead>
              <tr>
                {[
                  'SI No', 'NTID', 'Name', 'Status', 'AssignedDate', 'Duration', 'Comments', 
                  'DM', 'Mainstore', 'Doorcode', 'Market'
                ].map((header) => (
                  <th
                    key={header}
                    style={{ backgroundColor: '#E10174', color: 'white' }}
                    className="text-center small"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="small">
              {filteredDetails.map((detail, index) => {
                const duration = Math.ceil(
                  (new Date() - new Date(detail.assignedDate)) / (1000 * 60 * 60 * 24)
                );
                
                
                return (
                  <tr key={index} className={getRowStyle(detail.assignedDate)}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{detail.ntid}</td>
                    <td className="text-center text-capitalize">{detail.name}</td>
                    <td className="text-center">{detail.status}</td>
                    <td className="text-center">{detail.assignedDate.slice(0,10)}</td>
                    <td className="text-center">{duration-1} days</td>
                    <td className="text-center">
                      {getComment(detail.assignedDate)}
                    </td>
                    <td className="text-center">{detail.dm}</td>
                    <td className="text-center text-capitalize">
                      {detail.mainstore.toLowerCase()}
                    </td>
                    <td className="text-center">{detail.doorcode}</td>
                    <td className="text-center text-capitalize">
                      {detail.Market.toLowerCase()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackingDetails;
