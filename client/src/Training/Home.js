import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Lottie from "react-lottie";
import animationData from "./Animation.json";
import { useTrackingData } from "../utils/useTrackingData";
import { DashboardCard } from "../utils//DashboardCard";
import { MarketDropdown } from "../utils//MarketDropdown";
import { TrackingTable } from "../utils//TrackingTable";
import {
  FaUserCheck,
  FaGraduationCap,
  FaChartLine,
  FaClock,
} from "react-icons/fa";

export default function Home() {
  const { countsByMarket, totals, loading, error } = useTrackingData();
  const [selectedMarket, setSelectedMarket] = useState("All");

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  if (loading)
    return (
      <Container className="vh-100 d-flex justify-content-center align-items-center">
        <Lottie options={defaultOptions} height={150} width={150} />
      </Container>
    );
  if (error)
    return (
      <Container className="mt-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );

  const cards = [
    {
      title: "RDM Approval",
      value: totals.rdm,
      icon: <FaUserCheck size={24} />,
      gradient: "linear-gradient(135deg, #32c3a6 0%, #2e8b9a 100%)",
    },
    {
      title: "Training Pending",
      value: totals.training,
      icon: <FaGraduationCap size={24} />,
      gradient: "linear-gradient(135deg, #49a3f1 0%, #1A73E8 100%)",
    },
    {
      title: "Past Due",
      value: totals.passdue,
      icon: <FaClock size={24} />,
      gradient: "linear-gradient(135deg,rgb(15, 66, 60) 0%, #764ba2 100%)",
    },
    {
      title: "Total",
      value: totals.total,
      icon: <FaChartLine size={24} />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
  ];

  return (
    <Container>
      <h3 className="mt-4 text-center" style={{ color: "#E10174" }}>
        Trainings Dashboard
      </h3>
      <Row className="g-4 justify-content-around mt-2 mb-4">
        {cards.map((card, i) => (
          <Col key={i} xs={12} sm={6} md={4} lg={3}>
            <DashboardCard {...card} />
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-end  mb-2"  >
        <MarketDropdown
        
          markets={Object.keys(countsByMarket)}
          selected={selectedMarket}
          onSelect={setSelectedMarket}
        />
      </div>
      <TrackingTable
        countsByMarket={countsByMarket}
        selectedMarket={selectedMarket}
      />
    </Container>
  );
}
