import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Dropdown, OverlayTrigger, Popover ,Card, Col,Row} from 'react-bootstrap';
import './Login.css'; 
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FaUserCheck, FaGraduationCap, FaChartLine,FaClock } from 'react-icons/fa';

function Home() {
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState('All'); 
  let training=0;
  let rdm=0;
  let passdue=0
 
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
        rdm+=1;
      }
      if (detail.status === "Training Pending") {
        training+=1;
      }

      if (detail.status === "RDM Approval") {
        countsByMarket[market].rdmApprovalCount += 1;
      }

      if (detail.status === "Training Pending") {
        countsByMarket[market].trainingPendingCount += 1;
      }
      if (daysDifference >= 14) {
        countsByMarket[market].passDueCount += 1;
        passdue+=1;
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
  const cards = [
    {
      title: 'RDM Approval',
      value: rdm,
      icon: <FaUserCheck size={24} />,
      gradient: 'linear-gradient(135deg, #32c3a6 0%, #2e8b9a 100%)',
      delay: 'animate__delay-0s'
    },
    {
      title: 'Training Pending',
      value: training,
      icon: <FaGraduationCap size={24} />,
      gradient: 'linear-gradient(135deg, #49a3f1 0%, #1A73E8 100%)',
      delay: 'animate__delay-0.1s'
    },
    {
      title: 'passDue',
      value: passdue,
      icon: <FaClock size={24} />,
      gradient: 'linear-gradient(135deg,rgb(15, 66, 60) 0%, #764ba2 100%)',
      delay: 'animate__delay-0.2s'
    },
    {
      title: 'Total',
      value: trackingDetails.length,
      icon: <FaChartLine size={24} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      delay: 'animate__delay-0.2s'
    }
  ];

  return (
    <Container className="col-md-12">
      <h3 className="mt-4  text-center" style={{ color: "#E10174" }}>Trainings Dashboard</h3>
      <Row className="g-4 justify-content-around mt-2 mb-4">
      {cards.map((card, index) => (
        <Col key={index} xs={12} sm={6} md={4} lg={3}>
          <Card 
            className={`h-100 shadow-lg border-0 rounded-4 overflow-hidden animate__animated animate__fadeIn ${card.delay}`}
            style={{ 
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            <div 
              className="position-absolute w-100 h-100" 
              style={{
                background: card.gradient,
                opacity: 0.95,
                zIndex: 1
              }}
            />
            <Card.Body className="position-relative d-flex flex-column align-items-center p-4" style={{ zIndex: 2 }}>
              <div className="mb-3 p-3 rounded-circle bg-white bg-opacity-25">
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
              <Card.Title className="mb-3 text-white fw-bold">
                {card.title}
              </Card.Title>
              <h2 className="display-5 mb-0 fw-bold text-white">
                {card.value}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
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
                <button className="custom-dropdown1 border-0 bg-transparent text-white fw-bolder shadow-none">
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
