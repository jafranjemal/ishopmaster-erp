import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import useAuth from "../../context/useAuth";

const AwaitingInvoiceList = ({ grns, selectedGrnIds, onSelectionChange }) => {
  const { formatDate } = useAuth();

  // Group GRNs by supplier
  const groupedBySupplier = useMemo(() => {
    return grns.reduce((acc, grn) => {
      const supplierId = grn.supplierId._id;
      if (!acc[supplierId]) {
        acc[supplierId] = {
          name: grn.supplierId.name,
          grns: [],
        };
      }
      acc[supplierId].grns.push(grn);
      return acc;
    }, {});
  }, [grns]);

  const handleToggle = (grnId) => {
    const newSelection = selectedGrnIds.includes(grnId)
      ? selectedGrnIds.filter((id) => id !== grnId)
      : [...selectedGrnIds, grnId];
    onSelectionChange(newSelection);
  };

  // Determine which supplier is currently selected based on the first selected GRN
  const firstSelectedGrn = grns.find((g) => selectedGrnIds.includes(g._id));
  const activeSupplierId = firstSelectedGrn?.supplierId._id || null;

  if (Object.keys(groupedBySupplier).length === 0) {
    return (
      <div className="text-center p-8 text-slate-400">
        The work queue is empty. All received goods have been invoiced.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedBySupplier).map(([supplierId, data]) => {
        const isSupplierDisabled =
          activeSupplierId && activeSupplierId !== supplierId;
        return (
          <Card
            key={supplierId}
            className={isSupplierDisabled ? "opacity-50" : ""}
          >
            <CardHeader>
              <CardTitle>{data.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>GRN #</TableHead>
                    <TableHead>PO #</TableHead>
                    <TableHead>Received Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.grns.map((grn) => (
                    <TableRow key={grn._id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedGrnIds.includes(grn._id)}
                          onChange={() => handleToggle(grn._id)}
                          disabled={isSupplierDisabled}
                        />
                      </TableCell>
                      <TableCell className="font-mono">
                        {grn.grnNumber}
                      </TableCell>
                      <TableCell className="font-mono">
                        {grn.purchaseOrderId?.poNumber || "N/A"}
                      </TableCell>
                      <TableCell>{formatDate(grn.receivedDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AwaitingInvoiceList;
