import { Outlet } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import LicenseWarningBanner from './LicenseWarningBanner';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * Main layout shell for the tenant application.
 * Updated for React Router v6 nested routing using <Outlet />.
 */
const Layout = () => {
  const { isLicenseExpired } = useAuth();

  return (
    <div className='flex h-screen bg-slate-900'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <TopBar />
        {isLicenseExpired && <LicenseWarningBanner />}

        <main className='flex-1 overflow-x-hidden overflow-y-auto bg-slate-900'>
          <div className='container mx-auto px-6 py-8'>
            <Outlet /> {/* 👈 Nested routes will render here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
