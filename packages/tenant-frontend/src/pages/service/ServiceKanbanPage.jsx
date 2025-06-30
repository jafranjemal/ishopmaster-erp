import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantRepairService } from "../../services/api";
import KanbanBoard from "../../components/service/KanbanBoard";
import { Link } from "react-router-dom";
import { Button } from "ui-library";
import { PlusCircle } from "lucide-react";

const KANBAN_COLUMNS = {
  intake: { name: "Intake / Awaiting Diagnosis", items: [] },
  diagnosing: { name: "Diagnosing", items: [] },
  awaiting_customer_approval: { name: "Awaiting Approval", items: [] },
  awaiting_parts: { name: "Awaiting Parts", items: [] },
  in_progress: { name: "Repair In Progress", items: [] },
  completed_pending_pickup: { name: "Ready for Pickup", items: [] },
};

const ServiceKanbanPage = () => {
  const [columns, setColumns] = useState(KANBAN_COLUMNS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all tickets that are not closed or cancelled
      const response = await tenantRepairService.getAll({ status: { $nin: ["closed", "cancelled"] } });

      // Group tickets into columns
      const newColumns = JSON.parse(JSON.stringify(KANBAN_COLUMNS)); // Deep copy
      response.data.data.forEach((ticket) => {
        if (newColumns[ticket.status]) {
          newColumns[ticket.status].items.push(ticket);
        }
      });
      setColumns(newColumns);
    } catch (error) {
      toast.error("Failed to load repair tickets.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [movedItem] = sourceItems.splice(source.index, 1);

    // Optimistic UI update
    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });
    destItems.splice(destination.index, 0, movedItem);
    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });

    // Call API to update status
    try {
      await toast.promise(tenantRepairService.updateTicketStatus(draggableId, { status: destination.droppableId }), {
        loading: "Updating status...",
        success: "Status updated!",
        error: "Update failed.",
      });
      // On success, the optimistic state is correct. We could refetch to be safe.
      fetchData();
    } catch (error) {
      // Revert UI on failure
      toast.error("Could not update status. Reverting change.");
      sourceItems.splice(source.index, 0, movedItem);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Service Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Service Dashboard</h1>
        <Link to="/service/tickets/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" /> New Repair Ticket
          </Button>
        </Link>
      </div>
      <KanbanBoard columns={columns} onDragEnd={handleDragEnd} />
    </div>
  );
};
export default ServiceKanbanPage;
