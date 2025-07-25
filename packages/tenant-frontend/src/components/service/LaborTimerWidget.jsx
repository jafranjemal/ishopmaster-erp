import { Hourglass, Loader2, PauseCircle, PlayCircle, StopCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from 'ui-library';
import { StatusLockBadge } from './StatusLockBadge';

/**
 * Definitive Labor Timer Widget
 *
 * Props:
 * - activeTimer: Object | current in-progress or paused timer
 * - onStart: Function | start or resume handler
 * - onPause: Function | pause handler
 * - onStop: Function | stop handler
 * - isPaused: boolean | whether the timer is currently paused
 * - totalHoursLogged: number | total hours from all previous completed/paused sessions
 * - totalEstimatedHours: number | the total estimated hours for the job
 * - isSaving: boolean | if an API request is ongoing
 * - ticket: object | the repair ticket (must have a 'status' field)
 */
const LaborTimerWidget = ({
  activeTimer,
  onStart,
  onPause,
  onStop,
  isPaused,
  totalHoursLogged,
  totalEstimatedHours,
  isSaving,
  ticket,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const allowedStatuses = ['repair_active', 'approval_pending'];
  const activeStatuses = ['in_progress'];

  const isTimerActive = activeTimer && activeStatuses.includes(activeTimer.status);
  const isControlLocked = !allowedStatuses.includes(ticket?.status);

  // Calculates the duration of the current, live session
  const elapsedTime =
    isTimerActive && activeTimer?.startTime ? (currentTime - new Date(activeTimer.startTime).getTime()) / 3600000 : 0;

  // Correctly calculates the total *live* logged time
  const totalHoursLoggedLive = (totalHoursLogged || 0) + elapsedTime;

  useEffect(() => {
    if (isTimerActive) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerActive]);

  const formatHours = (hours, showSeconds = false) => {
    if (hours === null || hours === undefined || isNaN(hours)) {
      return showSeconds ? '00:00:00' : '0h 00m';
    }
    const totalSeconds = Math.floor(hours * 3600); // Use floor to avoid rounding up display time
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return showSeconds
      ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const sessionTime = isTimerActive ? formatHours(elapsedTime, true) : '--:--:--';

  return (
    <div className='relative p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg'>
      {/* Live status indicator */}
      {isTimerActive && (
        <div className='absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full'>
          <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
          LIVE
        </div>
      )}
      {/* Locked state badge */}
      {isControlLocked && <StatusLockBadge status={ticket?.status} />}

      {/* Main Time Display */}
      <div className='text-center mb-6'>
        <div className='text-sm text-slate-500 mb-1'>Total Time Logged</div>
        <div className={`text-5xl font-light tracking-tighter ${isTimerActive ? 'text-emerald-400' : 'text-white'}`}>
          {formatHours(totalHoursLoggedLive, isTimerActive)}
        </div>
        {/* ✨ NEW: Estimated Time Comparison */}
        {totalEstimatedHours > 0 && (
          <div className='flex items-center justify-center gap-2 text-sm text-slate-400 mt-2 font-mono'>
            <Hourglass size={14} />
            <span>
              {formatHours(totalHoursLoggedLive)} / {formatHours(totalEstimatedHours)} Est.
            </span>
          </div>
        )}
      </div>
      {/* Session Status Display */}
      <div className='flex justify-center gap-4 mb-8'>
        <div className='text-center'>
          <div className='text-xs text-slate-500 mb-1'>Status</div>
          <div className='text-sm font-medium text-slate-300'>
            {isPaused ? 'Paused' : isTimerActive ? 'Tracking' : 'Idle'}
          </div>
        </div>
        <div className='w-px bg-slate-800'></div>
        <div className='text-center'>
          <div className='text-xs text-slate-500 mb-1'>Current Session</div>
          <div className='text-sm font-medium text-indigo-300'>{sessionTime}</div>
        </div>
      </div>
      {/* Control Buttons */}
      <div className='mt-6 flex flex-wrap gap-1 font-mono text-xs'>
        {!isTimerActive ? (
          <>
            <Button
              onClick={onStart}
              disabled={isSaving || isControlLocked}
              className='flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg'
            >
              {isSaving ? (
                <Loader2 className='h-5 w-5 animate-spin mx-auto' />
              ) : (
                <>
                  <div className='flex items-center justify-center gap-2'>
                    <PlayCircle className='h-5 w-5' />
                    <span>{isPaused ? 'Resume Timer' : 'Start Timer'}</span>
                  </div>
                </>
              )}
            </Button>

            {activeTimer && activeTimer.status && (
              <Button
                variant='destructive'
                onClick={onStop}
                disabled={isSaving || isControlLocked}
                className='flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all shadow-lg'
              >
                {isSaving ? (
                  <Loader2 className='h-5 w-5 animate-spin mx-auto' />
                ) : (
                  <div className='flex items-center justify-center gap-2'>
                    <StopCircle className='h-5 w-5' />
                    <span>Stop Timer</span>
                  </div>
                )}
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant='outline'
              onClick={onPause}
              disabled={isSaving || isControlLocked}
              className='flex-1 py-3 rounded-xl bg-slate-700 border-slate-600 hover:bg-slate-600 transition-all shadow-lg'
            >
              {isSaving ? (
                <Loader2 className='h-5 w-5 animate-spin mx-auto' />
              ) : (
                <div className='flex items-center justify-center gap-2'>
                  <PauseCircle className='h-5 w-5' />
                  <span>Pause</span>
                </div>
              )}
            </Button>

            {activeTimer && activeTimer.status && (
              <Button
                variant='destructive'
                onClick={onStop}
                disabled={isSaving || isControlLocked}
                className='flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all shadow-lg'
              >
                {isSaving ? (
                  <Loader2 className='h-5 w-5 animate-spin mx-auto' />
                ) : (
                  <div className='flex items-center justify-center gap-2'>
                    <StopCircle className='h-5 w-5' />
                    <span>Stop Timer</span>
                  </div>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LaborTimerWidget;
