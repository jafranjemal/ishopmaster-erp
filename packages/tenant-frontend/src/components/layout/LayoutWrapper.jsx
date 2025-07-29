import { Outlet } from 'react-router-dom';
import Layout from './Layout'; // Your existing Layout component

/**
 * @desc A wrapper component that applies the main application Layout (Sidebar, TopBar)
 * to a group of nested routes. This is the standard pattern for React Router v6.
 */
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet /> {/* 👈 This is the critical part. Child routes will render here. */}
    </Layout>
  );
};

export default LayoutWrapper;
