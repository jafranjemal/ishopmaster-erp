import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "ui-library";
import { Link } from "react-router-dom";
import useAuth from "../../context/useAuth";

const TicketCard = ({ ticket, provided, innerRef }) => {
  const { formatDate } = useAuth();
  return (
    <div ref={innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-4">
      <Card className="bg-slate-800 hover:bg-slate-700/50 transition-colors">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-bold">
            <Link to={`/service/tickets/${ticket._id}`} className="hover:underline">
              {ticket.ticketNumber}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-xs space-y-2">
          <p className="text-slate-100 font-medium">
            {ticket.deviceDetails?.manufacturer} {ticket.deviceDetails?.model}
          </p>
          <p className="text-slate-400">Customer: {ticket.customerId?.name || "N/A"}</p>
          <p className="text-slate-400">Intake: {formatDate(ticket.createdAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
};
export default TicketCard;
