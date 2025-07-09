import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import useAuth from "../../../context/useAuth";

const TransferDetailView = ({ transfer }) => {
  const { formatDate } = useAuth();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Transfer Order #{transfer.transferId}</CardTitle>
          <Badge variant="outline" className="capitalize text-base px-3 py-1">
            {transfer.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">From (Source)</h4>
            <p className="text-slate-100">{transfer.fromBranchId.name}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">To (Destination)</h4>
            <p className="text-slate-100">{transfer.toBranchId.name}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Key Dates</h4>
            <p className="text-slate-400">
              Created: <span className="text-slate-100">{formatDate(transfer.createdAt)}</span>
            </p>
            {transfer.dispatchDate && (
              <p className="text-slate-400">
                Dispatched: <span className="text-slate-100">{formatDate(transfer.dispatchDate)}</span>
              </p>
            )}
            {transfer.receivedDate && (
              <p className="text-slate-400">
                Received: <span className="text-slate-100">{formatDate(transfer.receivedDate)}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Items to be Transferred</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.ProductVariantId?.variantName || "N/A"}</TableCell>
                  <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {transfer.notes && (
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Notes</h4>
            <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded-md">{transfer.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferDetailView;
