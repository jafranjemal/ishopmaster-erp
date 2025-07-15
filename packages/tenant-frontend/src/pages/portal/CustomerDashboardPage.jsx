import React from 'react';
// This is the main hub for a fully logged-in customer.
const CustomerDashboardPage = () => {
  return (
    <div>
      <h1 className='text-3xl font-bold'>My Account Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
        <div className='p-4 bg-slate-800 rounded-lg'>
          <h3>Recent Orders</h3>
          {/* List orders here */}
        </div>
        <div className='p-4 bg-slate-800 rounded-lg'>
          <h3>Active Repairs</h3>
          {/* List repairs here */}
        </div>
      </div>
    </div>
  );
};
export default CustomerDashboardPage;
