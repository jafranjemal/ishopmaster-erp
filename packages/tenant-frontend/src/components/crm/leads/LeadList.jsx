import React from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import { ArrowRight } from "lucide-react";

const LeadList = ({ leads, onConvert }) => {
  if (!leads || leads.length === 0) {
    return <div className="p-8 text-center text-slate-400">Your new leads inbox is empty.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead._id}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell className="text-slate-400">{lead.company || "N/A"}</TableCell>
            <TableCell>
              <Badge variant="outline">{lead.source}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {lead.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" onClick={() => onConvert(lead._id)} disabled={lead.status !== "new"}>
                Convert <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default LeadList;
