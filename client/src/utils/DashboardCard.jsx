import { Card } from "react-bootstrap";

export function DashboardCard({ title, value, icon, gradient }) {
  return (
    <Card className="h-100 shadow-lg border-0 rounded-4 overflow-hidden">
      <div className="position-absolute w-100 h-100" style={{ background: gradient, opacity: 0.95, zIndex: 1 }} />
      <Card.Body className="position-relative d-flex flex-column align-items-center p-4" style={{ zIndex: 2 }}>
        <div className="mb-3 p-3 rounded-circle bg-white bg-opacity-25">{icon}</div>
        <Card.Title className="mb-3 text-white fw-bold">{title}</Card.Title>
        <h2 className="display-5 mb-0 fw-bold text-white">{value}</h2>
      </Card.Body>
    </Card>
  );
}
