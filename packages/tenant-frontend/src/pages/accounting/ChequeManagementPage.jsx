import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantChequeService } from "../../services/api";
import {
  Button,
  Modal,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "ui-library";
import PendingChequeList from "../../components/accounting/PendingChequeList";
import { ShieldAlert } from "lucide-react";

const ChequeManagementPage = () => {
  const [pendingCheques, setPendingCheques] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState({
    isOpen: false,
    cheque: null,
    status: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantChequeService.getPending();
      setPendingCheques(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch pending cheques.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async () => {
    const { cheque, status } = confirmAction;
    if (!cheque || !status) return;

    try {
      await toast.promise(
        tenantChequeService.updateStatus(cheque._id, { status }),
        {
          loading: `Marking cheque #${cheque.chequeNumber} as ${status}...`,
          success: `Cheque successfully marked as ${status}.`,
          error: (err) =>
            err.response?.data?.error || `Failed to update cheque status.`,
        }
      );
      fetchData(); // Refresh the list
    } catch (error) {
      console.log(error);
      // Error is handled by the toast
    } finally {
      setConfirmAction({ isOpen: false, cheque: null, status: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cheque Management</h1>
        <p className="mt-1 text-slate-400">
          Manage the lifecycle of received and issued cheques.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Cheques</CardTitle>
          <CardDescription>
            This is the work queue of all cheques awaiting bank clearance. Mark
            them as cleared or bounced to finalize the financial transaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading pending cheques...</p>
          ) : (
            <PendingChequeList
              cheques={pendingCheques}
              onMarkCleared={(cheque) =>
                setConfirmAction({ isOpen: true, cheque, status: "cleared" })
              }
              onMarkBounced={(cheque) =>
                setConfirmAction({ isOpen: true, cheque, status: "bounced" })
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction({ isOpen: false })}
        title="Confirm Action"
      >
        <div className="text-center">
          <ShieldAlert
            className={`mx-auto h-12 w-12 ${
              confirmAction.status === "bounced"
                ? "text-red-500"
                : "text-amber-400"
            }`}
          />
          <p className="mt-4">
            Are you sure you want to mark cheque #
            {confirmAction.cheque?.chequeNumber} as{" "}
            <span className="font-bold capitalize">{confirmAction.status}</span>
            ?
          </p>
          <p className="text-sm text-slate-400 mt-2">
            This will post a permanent, non-reversible transaction to your
            General Ledger.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setConfirmAction({ isOpen: false })}
          >
            Cancel
          </Button>
          <Button
            variant={
              confirmAction.status === "bounced" ? "destructive" : "success"
            }
            onClick={handleUpdateStatus}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChequeManagementPage;
