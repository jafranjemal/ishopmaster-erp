import { Loader2, PlayCircle, StopCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'ui-library';

const LaborTimerWidget = ({ activeTimer, onStart, onStop, isTimerActive, totalHoursLogged: ttlHrs, isSaving }) => {
  const formatHours = (hours, showSeconds = false) => {
    if (hours === null || hours === undefined || isNaN(hours)) {
      return showSeconds ? '00:00:00' : '0h 00m';
    }

    const totalSeconds = Math.round(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (showSeconds) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const animationRef = useRef(null);

  const elapsedTime =
    isTimerActive && activeTimer?.startTime ? (currentTime - new Date(activeTimer.startTime).getTime()) / 3600000 : 0;

  //const totalHours = (ttlHrs || 0) + elapsedTime;

  const isActive = isTimerActive && activeTimer;
  const sessionTime = isActive ? formatHours(elapsedTime, true) : '00:00:00';
  const totalHours = ttlHrs || 0;

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const formatStartTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const maxHours = 40; // Assuming 40h as full progress
  const progress = Math.min(100, (totalHours / maxHours) * 100);

  //   return (
  //     <div className='p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 shadow-2xl'>
  //       <div className='grid grid-cols-[auto_1fr_auto] items-center gap-5'>
  //         {/* Icon with status indicator */}
  //         <div className='relative'>
  //           <div className='p-3 bg-gradient-to-br from-indigo-700 to-indigo-800 rounded-xl shadow-lg'>
  //             <Timer className='h-8 w-8 text-indigo-200' />
  //           </div>
  //           {isActive && (
  //             <span className='absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse'></span>
  //           )}
  //         </div>

  //         {/* Time display */}
  //         <div>
  //           <div className='flex items-center gap-2 mb-1'>
  //             <span className='text-sm text-slate-400 font-medium'>Total Estimated Time</span>
  //             {isSaving && <Loader2 className='h-3 w-3 animate-spin text-slate-500' />}
  //           </div>
  //           <div className='flex items-baseline gap-2'>
  //             <p className={`text-3xl font-bold ${isActive ? 'text-emerald-400' : 'text-white'}`}>
  //               {formatHours(ttlHrs, isActive)}
  //             </p>
  //             {isActive && (
  //               <span className='text-xs font-medium text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full'>
  //                 LIVE
  //               </span>
  //             )}
  //           </div>
  //         </div>

  //         {/* Control buttons */}
  //         <div className='flex gap-2'>
  //           {!isTimerActive ? (
  //             <Button
  //               onClick={onStart}
  //               disabled={isSaving}
  //               className='px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-md'
  //             >
  //               {isSaving ? <Loader2 className='h-5 w-5 animate-spin' /> : <PlayCircle className='h-5 w-5' />}
  //             </Button>
  //           ) : (
  //             <Button
  //               variant='destructive'
  //               onClick={onStop}
  //               disabled={isSaving}
  //               className='px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all shadow-md relative overflow-hidden'
  //             >
  //               {isSaving ? (
  //                 <Loader2 className='h-5 w-5 animate-spin' />
  //               ) : (
  //                 <>
  //                   <StopCircle className='h-5 w-5 relative z-10' />
  //                   {isActive && <span className='absolute inset-0 bg-rose-500 animate-pulse-slow opacity-40'></span>}
  //                 </>
  //               )}
  //             </Button>
  //           )}
  //         </div>
  //       </div>

  //       {/* Session info bar */}
  //       <div className='mt-4 pt-4 border-t border-slate-700/50'>
  //         <div className='flex justify-between items-center'>
  //           <div className='flex items-center gap-2 text-slate-500 text-sm'>
  //             <Info className='h-4 w-4' />
  //             <span>{isActive ? `Started at ${formatStartTime(activeTimer?.startTime)}` : 'No active session'}</span>
  //           </div>

  //           {isActive && (
  //             <div className='flex items-center gap-2'>
  //               <span className='text-xs text-slate-400'>Session:</span>
  //               <span className='font-medium text-emerald-400'>{sessionTime}</span>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );

  //   return (
  //     <div className='p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden'>
  //       <div className='mb-4'>
  //         <div className='flex justify-between items-start mb-2'>
  //           <div className='flex items-center gap-2'>
  //             <Timer className='h-6 w-6 text-indigo-400' />
  //             <h3 className='font-medium text-slate-300'>Time Tracker</h3>
  //           </div>
  //           {isActive && (
  //             <span className='flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full'>
  //               <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
  //               LIVE
  //             </span>
  //           )}
  //         </div>

  //         {/* Progress bar */}
  //         <div className='h-2 bg-slate-700 rounded-full overflow-hidden mb-4'>
  //           <div
  //             className='h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000 ease-out'
  //             style={{ width: `${progress}%` }}
  //           ></div>
  //         </div>
  //       </div>

  //       <div className='grid grid-cols-2 gap-4'>
  //         {/* Time display */}
  //         <div className='bg-slate-800/50 p-4 rounded-xl'>
  //           <div className='text-sm text-slate-400 mb-1'>Total Time</div>
  //           <div className={`text-2xl font-bold ${isActive ? 'text-emerald-400' : 'text-white'}`}>
  //             {formatHours(totalHours)}
  //           </div>
  //         </div>

  //         {/* Session info */}
  //         <div className='bg-slate-800/50 p-4 rounded-xl'>
  //           <div className='text-sm text-slate-400 mb-1'>Current Session</div>
  //           <div className='text-2xl font-bold text-indigo-300'>{isActive ? sessionTime : '--:--:--'}</div>
  //         </div>
  //       </div>

  //       {/* Control buttons */}
  //       <div className='mt-6 flex gap-3'>
  //         {!isTimerActive ? (
  //           <Button
  //             onClick={onStart}
  //             disabled={isSaving}
  //             className='flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg'
  //           >
  //             {isSaving ? (
  //               <Loader2 className='h-5 w-5 animate-spin mx-auto' />
  //             ) : (
  //               <div className='flex items-center justify-center gap-2'>
  //                 <PlayCircle className='h-5 w-5' />
  //                 <span>Start Timer</span>
  //               </div>
  //             )}
  //           </Button>
  //         ) : (
  //           <Button
  //             variant='destructive'
  //             onClick={onStop}
  //             disabled={isSaving}
  //             className='flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all shadow-lg relative overflow-hidden'
  //           >
  //             {isSaving ? (
  //               <Loader2 className='h-5 w-5 animate-spin mx-auto' />
  //             ) : (
  //               <div className='flex items-center justify-center gap-2 relative z-10'>
  //                 <StopCircle className='h-5 w-5' />
  //                 <span>Stop Timer</span>
  //               </div>
  //             )}
  //             {isActive && !isSaving && (
  //               <span className='absolute inset-0 bg-rose-500 animate-pulse-slow opacity-30'></span>
  //             )}
  //           </Button>
  //         )}
  //       </div>

  //       {/* Footer info */}
  //       {isActive && (
  //         <div className='mt-4 pt-3 text-xs text-slate-500 text-center border-t border-slate-700/50'>
  //           Started at {formatStartTime(activeTimer?.startTime)}
  //         </div>
  //       )}
  //     </div>
  //   );
  return (
    <div className='relative p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg'>
      {/* Floating status indicator */}
      {isActive && (
        <div className='absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full'>
          <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
          LIVE
        </div>
      )}

      {/* Main time display */}
      <div className='text-center mb-6'>
        <div className='text-sm text-slate-500 mb-1'>Total Time Logged</div>
        <div className={`text-5xl font-light tracking-tighter ${isActive ? 'text-emerald-400' : 'text-white'}`}>
          {formatHours(totalHours, isActive)}
        </div>
      </div>

      {/* Session info */}
      <div className='flex justify-center gap-4 mb-8'>
        <div className='text-center'>
          <div className='text-xs text-slate-500 mb-1'>Status</div>
          <div className='text-sm font-medium text-slate-300'>{isActive ? 'Tracking' : 'Idle'}</div>
        </div>

        <div className='w-px bg-slate-800'></div>

        <div className='text-center'>
          <div className='text-xs text-slate-500 mb-1'>Session</div>
          <div className='text-sm font-medium text-indigo-300'>{isActive ? sessionTime : '--:--:--'}</div>
        </div>
      </div>

      {/* Control buttons */}
      <div className='flex justify-center'>
        {!isTimerActive ? (
          <Button
            onClick={onStart}
            disabled={isSaving}
            className='rounded-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg'
          >
            {isSaving ? (
              <Loader2 className='h-6 w-6 animate-spin' />
            ) : (
              <div className='flex items-center gap-2'>
                <PlayCircle className='h-6 w-6' />
                <span className='font-medium'>Start Timer</span>
              </div>
            )}
          </Button>
        ) : (
          <Button
            variant='destructive'
            onClick={onStop}
            disabled={isSaving}
            className='rounded-full px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all shadow-lg relative overflow-hidden'
          >
            {isSaving ? (
              <Loader2 className='h-6 w-6 animate-spin' />
            ) : (
              <div className='flex items-center gap-2 relative z-10'>
                <StopCircle className='h-6 w-6' />
                <span className='font-medium'>Stop Timer</span>
              </div>
            )}
            {isActive && !isSaving && (
              <span className='absolute inset-0 bg-rose-500 animate-pulse-slow opacity-30'></span>
            )}
          </Button>
        )}
      </div>

      {/* Start time info */}
      {isActive && (
        <div className='mt-6 text-center text-xs text-slate-600'>
          Started at {formatStartTime(activeTimer?.startTime)}
        </div>
      )}
    </div>
  );
};

export default LaborTimerWidget;
