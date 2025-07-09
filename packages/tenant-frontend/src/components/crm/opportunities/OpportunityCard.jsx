import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "ui-library";
import useAuth from "../../../context/useAuth";
import { Link } from "react-router-dom";

const OpportunityCard = ({ opportunity, provided, innerRef }) => {
  const { formatCurrency } = useAuth();
  return (
    <div ref={innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-4">
      <Link to={`/crm/opportunities/${opportunity._id}`}>
        <Card className="bg-slate-800 hover:bg-slate-700/50">
          <CardContent className="p-3 text-sm">
            <p className="font-bold text-slate-100">{opportunity.name}</p>
            <p className="text-xs text-slate-400">{opportunity.accountId?.name}</p>
            <p className="text-lg font-bold text-green-400 mt-2">{formatCurrency(opportunity.amount)}</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};
export default OpportunityCard;
