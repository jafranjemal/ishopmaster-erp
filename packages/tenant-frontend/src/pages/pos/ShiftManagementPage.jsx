import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantShiftService } from "../../services/api";
import { Button, Modal, Card, CardContent, CardHeader, CardTitle, CardDescription } from "ui-library";
import { Power, PowerOff } from "lucide-react";
import ShiftOpenForm from "../../components/pos/ShiftOpenForm";
import ShiftCloseForm from "../../components/pos/ShiftCloseForm";
import useAuth from "../../context/useAuth";

const ShiftManagementPage = () => {
  const [activeShift, setActiveShift] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatDate } = useAuth();

  const checkActiveShift = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantShiftService.getActive();
      setActiveShift(response.data.data);
    } catch (error) {
      toast.error("Could not check shift status.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkActiveShift();
  }, [checkActiveShift]);

  const handleOpenShift = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantShiftService.openShift(formData), {
        /* ... */
      });
      checkActiveShift();
      setIsModalOpen(false);
    } catch (err) {
      /* ... */
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseShift = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantShiftService.closeShift(activeShift._id, formData), {
        /* ... */
      });
      checkActiveShift();
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Checking shift status...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Shift Management</h1>
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>{activeShift ? `Shift In Progress` : `No Active Shift`}</CardTitle>
          <CardDescription>
            {activeShift ? `Started on ${formatDate(activeShift.shift_start)}` : `Start a new shift to begin making sales.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeShift ? (
            <Button variant="destructive" size="lg" onClick={() => setIsModalOpen(true)}>
              <PowerOff className="mr-2 h-4 w-4" /> Close Shift
            </Button>
          ) : (
            <Button variant="success" size="lg" onClick={() => setIsModalOpen(true)}>
              <Power className="mr-2 h-4 w-4" /> Start New Shift
            </Button>
          )}
        </CardContent>
      </Card>

      {/* This single modal is used for both open and close forms */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeShift ? "Close Shift & Reconcile" : "Start New Shift"}>
        {activeShift ? (
          <ShiftCloseForm activeShift={activeShift} onSave={handleCloseShift} onCancel={() => setIsModalOpen(false)} isSaving={isSaving} />
        ) : (
          <ShiftOpenForm onSave={handleOpenShift} onCancel={() => setIsModalOpen(false)} isSaving={isSaving} />
        )}
      </Modal>

      {/* A placeholder for the Shift History table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shift History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center p-4 text-slate-400">Shift history table will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
export default ShiftManagementPage;
