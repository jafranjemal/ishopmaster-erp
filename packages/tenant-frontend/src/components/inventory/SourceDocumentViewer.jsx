import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "ui-library";
import useAuth from "../../context/useAuth";
import { FileText, ArrowUpRight } from "lucide-react";

/**
 * A component to display a summary of a source document (e.g., PO, Sale) in a modal.
 */
const SourceDocumentViewer = ({ document, type }) => {
  const { formatDate, formatCurrency } = useAuth();

  if (!document || !type) {
    return (
      <p className="text-slate-400">No source document details available.</p>
    );
  }

  // We can expand this with a switch statement for different document types later
  if (type === "PurchaseOrder") {
    return (
      <div className="space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-400" />
            Purchase Order
          </CardTitle>
          <CardDescription>
            This stock movement originated from PO:{" "}
            <span className="font-mono text-indigo-400">
              {document.poNumber}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Supplier:</span>
            <span className="font-medium">
              {document.supplierId?.name || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">PO Date:</span>
            <span className="font-medium">
              {formatDate(document.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Value:</span>
            <span className="font-medium font-mono">
              {formatCurrency(document.totalAmount)}
            </span>
          </div>
        </CardContent>
        <div className="pt-4 text-right">
          <Link to={`/procurement/po/${document._id}`}>
            <Button variant="outline">
              View Full PO <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fallback for other document types
  return (
    <pre className="text-xs bg-slate-900 p-4 rounded-md overflow-x-auto">
      {JSON.stringify(document, null, 2)}
    </pre>
  );
};

export default SourceDocumentViewer;
