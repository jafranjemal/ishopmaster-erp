import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import { Button } from 'ui-library';
import { Clock, History, LayoutGrid, LogOut, Maximize, Minimize } from 'lucide-react';
import ClockInOutWidget from '../shared/ClockInOutWidget';
import ApplicationMenuBar from './pos/ApplicationMenuBar';
import PosHeader from './pos/PosHeader';

const PosTopBar = ({ onLayoutToggle, onToggleFullscreen, isFullscreen, onRecallSale }) => {
  const { user, logout } = useAuth();
  return (
    <header className='flex-shrink-0 bg-slate-800 border-b border-slate-700 px-4 h-16 flex items-center justify-between z-20'>
      <div className='flex items-center gap-4'>
        <Link to='/dashboard' className='font-bold text-lg text-white'>
          iShop
        </Link>
        <div className='h-8 w-px bg-slate-700'></div>
        <nav className='flex items-center gap-1'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/pos/shifts'>
              <Clock className='h-4 w-4 mr-2' />
              Shift
            </Link>
          </Button>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/pos/sales-history'>
              <History className='h-4 w-4 mr-2' />
              History
            </Link>
          </Button>

          <PosHeader onRecallSale={onRecallSale} />
        </nav>
      </div>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={onLayoutToggle} title='Switch Layout'>
          <LayoutGrid className='h-5 w-5 text-slate-400' />
        </Button>

        {/* --- THE NEW FULLSCREEN BUTTON --- */}
        <Button
          variant='ghost'
          size='icon'
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className='h-5 w-5 text-slate-400' />
          ) : (
            <Maximize className='h-5 w-5 text-slate-400' />
          )}
        </Button>
        <div className='h-8 w-px bg-slate-700'></div>

        <ClockInOutWidget />
        <div className='h-8 w-px bg-slate-700'></div>
        <div className='text-right'>
          <p className='text-sm font-semibold text-slate-100'>{user?.name}</p>
          <p className='text-xs text-slate-400'>{user?.assignedBranch?.name || 'Main Branch'}</p>
        </div>
        <Button variant='ghost' size='icon' onClick={logout} title='Logout'>
          <LogOut className='h-5 w-5 text-slate-400' />
        </Button>
      </div>
    </header>
  );
};

const PosLayout = ({ children, onLayoutToggle, onRecallSale }) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className='flex flex-col h-screen bg-slate-900 text-slate-100'>
      <ApplicationMenuBar />
      <PosTopBar
        onRecallSale={onRecallSale}
        onLayoutToggle={onLayoutToggle}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />
      <main className='flex-1 p-4 lg:p-6 overflow-hidden'>{children}</main>
    </div>
  );
};

export default PosLayout;
