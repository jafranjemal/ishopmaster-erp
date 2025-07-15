import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { portalAuthService } from '../../services/portalApi';
import { toast } from 'react-hot-toast';
import { Button } from 'ui-library';

const TrackRepairPage = () => {
  const [searchParams] = useSearchParams();
  const [repairTicket, setRepairTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No access token provided.');
      setIsLoading(false);
      return;
    }
    portalAuthService
      .validateToken(token)
      .then((res) => setRepairTicket(res.data.data.repairTicket))
      .catch(() => setError('Invalid or expired link.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleRequestFullLogin = async () => {
    try {
      await toast.promise(portalAuthService.requestLoginLink(token), {
        /* ... */
      });
      // Show a success message to the user
    } catch (err) {
      /* ... */
    }
  };

  if (isLoading) return <p>Validating...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Status for Repair #{repairTicket.ticketNumber}</h1>
      <p>Device: {repairTicket.deviceDetails.model}</p>
      <p>
        Status: <span className='font-bold'>{repairTicket.status}</span>
      </p>
      <hr className='my-8' />
      <Button onClick={handleRequestFullLogin}>Sign In to View Full Account</Button>
    </div>
  );
};
export default TrackRepairPage;
