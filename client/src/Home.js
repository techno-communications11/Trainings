import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Dropdown, OverlayTrigger, Popover ,Tooltip} from 'react-bootstrap';
import './Login.css'; 
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

function Home() {
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState('All'); 

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/tracking-details`);
        const data = await response.json();
        setTrackingDetails(data.trackingDetails);
      } catch (err) {
        setError('Error fetching tracking details. Please check the server or network connection.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrackingDetails();
  }, []);

  const calculateMarketCounts = () => {
    const countsByMarket = {};

    trackingDetails.forEach(detail => {
      const market = detail.Market || 'Unknown';
      const assignedDate = new Date(detail.assignedDate);
      const now = new Date();
      const daysDifference = Math.floor((now - assignedDate) / (1000 * 60 * 60 * 24));

      if (!countsByMarket[market]) {
        countsByMarket[market] = {
          rdmApprovalCount: 0,
          trainingPendingCount: 0,
          passDueCount: 0,
          totalCount: 0
        };
      }

      if (detail.status === "RDM Approval") {
        countsByMarket[market].rdmApprovalCount += 1;
      }

      if (detail.status === "Training Pending") {
        countsByMarket[market].trainingPendingCount += 1;
      }
      if (daysDifference >= 14) {
        countsByMarket[market].passDueCount += 1;
      }
      countsByMarket[market].totalCount += 1;
    });

    return countsByMarket;
  };

  const countsByMarket = calculateMarketCounts();

  const handleMarketSelection = (market) => {
    setSelectedMarket(market);
  };

  const filteredCounts = selectedMarket === 'All' ? countsByMarket : { [selectedMarket]: countsByMarket[selectedMarket] };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="col-md-12">
      <h3 className="mt-4  text-center" style={{ color: "#E10174" }}>Trainings Dashboard</h3>
      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr className="text-center">
            <th>
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Header as="h3">Select Market</Popover.Header>
                    <Popover.Body>
                      <Dropdown.Item onClick={() => handleMarketSelection('All')}>
                        All
                      </Dropdown.Item>
                      {Object.keys(countsByMarket).map((market, index) => (
                        <Dropdown.Item key={index} onClick={() => handleMarketSelection(market)} className='text-capitalize'>
                          {market?.toLocaleLowerCase()}
                        </Dropdown.Item>
                      ))}
                    </Popover.Body>
                  </Popover>
                }
              >
                <button className="custom-dropdown border-0 bg-transparent text-white fw-bolder shadow-none">
                {selectedMarket === 'All' ? 'Market ' : selectedMarket}<MdOutlineKeyboardArrowDown className='fs-3'/>
                </button>
              </OverlayTrigger>
            </th>
            <th>
                <span>RDM Approval</span>
            </th>
            <th>
                <span>Training Pending</span>
            </th>
            <th>
                <span>Pass Due</span>
            </th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody className="text-center text-capitalize">
          {Object.keys(filteredCounts).length > 0 ? (
            Object.keys(filteredCounts).map((market, index) => (
              <tr key={index}>
                <td>{market?.toLocaleLowerCase()}</td>
                <td>{filteredCounts[market].rdmApprovalCount}</td>
                <td>{filteredCounts[market].trainingPendingCount}</td>
                <td>{filteredCounts[market].passDueCount}</td>
                <td>{filteredCounts[market].totalCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default Home;
