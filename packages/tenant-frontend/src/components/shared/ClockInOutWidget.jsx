import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantAttendanceService } from "../../services/api";
import { Button } from "ui-library";
import { LogIn, LogOut, LoaderCircle } from "lucide-react";
import { cn } from "ui-library";

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const ClockInOutWidget = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const checkActiveSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantAttendanceService.getActiveSession();
      setActiveSession(response.data.data);
    } catch (error) {
      // No need to show an error if they just don't have a session
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  useEffect(() => {
    let interval;
    if (activeSession) {
      const startTime = new Date(activeSession.checkInTime).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleClockIn = async () => {
    setIsSubmitting(true);
    try {
      await toast.promise(tenantAttendanceService.clockIn(), {
        loading: "Clocking in...",
        success: "Successfully clocked in!",
        error: (err) => err.response?.data?.error || "Failed to clock in.",
      });
      checkActiveSession();
    } catch (error) {
      /* Handled by toast */
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    setIsSubmitting(true);
    try {
      await toast.promise(tenantAttendanceService.clockOut(), {
        loading: "Clocking out...",
        success: "Successfully clocked out!",
        error: (err) => err.response?.data?.error || "Failed to clock out.",
      });
      setActiveSession(null); // Immediately update UI
      setElapsedTime(0);
    } catch (error) {
      /* Handled by toast */
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-32 h-10">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {activeSession ? (
        <>
          <span className="font-mono text-sm bg-slate-700 px-2 py-1 rounded-md">{formatDuration(elapsedTime)}</span>
          <Button variant="destructive" size="sm" onClick={handleClockOut} disabled={isSubmitting}>
            <LogOut className="h-4 w-4 mr-2" />
            Clock Out
          </Button>
        </>
      ) : (
        <Button variant="success" size="sm" onClick={handleClockIn} disabled={isSubmitting}>
          <LogIn className="h-4 w-4 mr-2" />
          Clock In
        </Button>
      )}
    </div>
  );
};

export default ClockInOutWidget;
