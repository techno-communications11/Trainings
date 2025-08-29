import { Table } from "react-bootstrap";

export function TrackingTable({ countsByMarket, selectedMarket }) {
  const filtered = selectedMarket === 'All' ? countsByMarket : { [selectedMarket]: countsByMarket[selectedMarket] };

  return (
    <Table striped bordered hover responsive className="table-sm text-center text-capitalize">
      <thead>
        <tr>
          <th>Market</th>
          <th>RDM Approval</th>
          <th>Training Pending</th>
          <th>Pass Due</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(filtered).length ? (
          Object.keys(filtered).map((market, idx) => (
            <tr key={idx}>
              <td>{market}</td>
              <td>{filtered[market].rdmApproval}</td>
              <td>{filtered[market].trainingPending}</td>
              <td>{filtered[market].passDue}</td>
              <td>{filtered[market].total}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No data available</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
