import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { portalAuthService, setTenantForPortalApi } from '../../services/portalApi';
import { LoaderCircle } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthProvider';

const PortalLoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const tenantId = searchParams.get('tenant'); // Get the tenant from the URL
  const auth = useCustomerAuth();

  useEffect(() => {
    if (!token) {
      toast.error('No login token provided. Please use the link from your email.');
      navigate('/portal/request-link'); // Redirect to a page where they can request a new link
      return;
    }
    setTenantForPortalApi(tenantId);
    const validate = async () => {
      try {
        const res = await portalAuthService.validateToken(token);

        const { sessionToken } = res.data;
        const { customer } = res.data.data;

        if (sessionToken) {
          auth.login(sessionToken, customer);
          toast.success(`Welcome, ${customer.name}!`);
          navigate('/portal/dashboard', { replace: true });
        } else {
          // Handle limited-access workflow
          navigate(`/portal/track?ticketId=${res.data.data.ticket._id}`, { replace: true });
        }
      } catch (error) {
        console.log('login error portal ', error);
        toast.error(error.response?.data?.error || 'Login failed.');
      }
    };
    validate();
  }, [tenantId, token, navigate, auth]);

  return (
    <div className='flex flex-col items-center justify-center h-64'>
      <LoaderCircle className='h-12 w-12 animate-spin text-indigo-400' />
      <p className='mt-4 text-lg'>Securely signing you in...</p>
    </div>
  );
};
export default PortalLoginPage;
