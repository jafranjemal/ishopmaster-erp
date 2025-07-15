import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthProvider';
import { Button } from 'ui-library';

const PortalHeader = () => {
  // Use the hook to get the current state and functions
  const { isAuthenticated, customer, logout } = useCustomerAuth();

  return (
    <header className='p-4 border-b border-slate-700 flex justify-between items-center'>
      <h1 className='font-bold text-xl text-white'>iShopMaster Customer Portal</h1>
      {isAuthenticated && customer && (
        <div className='flex items-center gap-4'>
          <span>Welcome, {customer.name}!</span>
          <Button variant='outline' size='sm' onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};
const PortalLayout = ({ children }) => {
  return (
    <div className='flex flex-col min-h-screen bg-slate-900 text-slate-100'>
      <PortalHeader />
      <main className='flex-grow container mx-auto p-4 lg:p-8'>{children}</main>
    </div>
  );
};
export default PortalLayout;
