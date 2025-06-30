import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "ui-library";

const RepairTicketDetailView = ({ ticket }) => (
  <Card>
    <CardHeader>
      <CardTitle>
        {ticket.deviceDetails.manufacturer} {ticket.deviceDetails.model}
      </CardTitle>
      <CardDescription>Customer: {ticket.customerId.name}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-semibold text-slate-300">Customer Complaint</h4>
        <p className="text-sm p-3 bg-slate-900/50 rounded-md">{ticket.customerComplaint}</p>
      </div>
      <div>
        <h4 className="font-semibold text-slate-300">Pre-Repair Checklist</h4>
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          {Object.entries(ticket.preRepairChecklist || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-slate-400">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
export default RepairTicketDetailView;
