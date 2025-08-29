import { useState, useEffect, useMemo } from 'react';

export function useTrackingData() {
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/tracking-details`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        if (!data.trackingDetails) throw new Error('No tracking details found');
        setTrackingDetails(data.trackingDetails);
      } catch (err) {
        setError(err.message || 'Error fetching tracking details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingDetails();
  }, []);

  const countsByMarket = useMemo(() => {
    const counts = {};
    trackingDetails.forEach(detail => {
      const market = detail.Market || 'Unknown';
      const assignedDate = new Date(detail.assignedDate);
      const now = new Date();
      const daysDifference = Math.floor((now - assignedDate) / (1000*60*60*24));

      if (!counts[market]) counts[market] = { rdmApproval: 0, trainingPending: 0, passDue: 0, total: 0 };

      if (detail.status === "RDM Approval") counts[market].rdmApproval += 1;
      if (detail.status === "Training Pending") counts[market].trainingPending += 1;
      if (daysDifference >= 14) counts[market].passDue += 1;

      counts[market].total += 1;
    });
    return counts;
  }, [trackingDetails]);

  const totals = useMemo(() => {
    let rdm = 0, training = 0, passdue = 0;
    Object.values(countsByMarket).forEach(market => {
      rdm += market.rdmApproval;
      training += market.trainingPending;
      passdue += market.passDue;
    });
    return { rdm, training, passdue, total: trackingDetails.length };
  }, [countsByMarket, trackingDetails.length]);

  return { trackingDetails, countsByMarket, totals, loading, error };
}
