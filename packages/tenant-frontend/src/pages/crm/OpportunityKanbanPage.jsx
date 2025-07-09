import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantOpportunityService, tenantSalesOrderService } from "../../services/api";
import KanbanBoard from "../../components/crm/opportunities/KanbanBoard";
import LossReasonModal from "../../components/crm/opportunities/LossReasonModal";

const OpportunityKanbanPage = () => {
  const [columns, setColumns] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lossModalState, setLossModalState] = useState({ isOpen: false, opportunityId: null });

  const STAGES = ["Prospecting", "Qualification", "Needs Analysis", "Proposal Sent", "Negotiation", "Closed-Won", "Closed-Lost"];

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantOpportunityService.getAll();
      const opportunities = res.data.data;

      const groupedByStage = STAGES.reduce((acc, stage) => {
        acc[stage] = { name: stage.replace("_", " "), items: [] };
        return acc;
      }, {});

      opportunities.forEach((opp) => {
        if (groupedByStage[opp.stage]) {
          groupedByStage[opp.stage].items.push(opp);
        }
      });
      setColumns(groupedByStage);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load opportunities.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newStage = destination.droppableId;
    if (source.droppableId === newStage) return;

    // --- DEFINITIVE WORKFLOW LOGIC ---
    if (newStage === "Closed-Lost") {
      setLossModalState({ isOpen: true, opportunityId: draggableId });
      return; // Stop here, let the modal handle the next step
    }

    const apiCall =
      newStage === "Closed-Won"
        ? tenantSalesOrderService.createFromOpportunity(draggableId)
        : tenantOpportunityService.updateStage(draggableId, newStage);

    // Optimistic UI update can be added here for a smoother feel

    try {
      await toast.promise(apiCall, {
        loading: "Updating opportunity...",
        success: `Opportunity moved to ${newStage}!`,
        error: "Update failed.",
      });
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmLoss = async (reason) => {
    const { opportunityId } = lossModalState;
    try {
      await toast.promise(tenantOpportunityService.updateStage(opportunityId, "Closed-Lost", reason), {
        loading: "Archiving opportunity...",
        success: "Opportunity marked as lost.",
        error: "Update failed.",
      });
      fetchData();
    } catch (err) {
      console.log(err);
    } finally {
      setLossModalState({ isOpen: false, opportunityId: null });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sales Pipeline</h1>
      {isLoading ? <p>Loading...</p> : <KanbanBoard columns={columns} onDragEnd={handleDragEnd} />}
      <LossReasonModal isOpen={lossModalState.isOpen} onClose={() => setLossModalState({ isOpen: false })} onConfirm={handleConfirmLoss} />
    </div>
  );
};
export default OpportunityKanbanPage;
