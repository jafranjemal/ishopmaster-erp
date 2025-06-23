import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "ui-library";
import useAuth from "../../context/useAuth";

const PurchaseOrderDetailView = ({ purchaseOrder }) => {
  const { formatDate, formatCurrency } = useAuth();
  const {
    poNumber,
    supplierId,
    destinationBranchId,
    status,
    orderDate,
    expectedDeliveryDate,
    totalAmount,
  } = purchaseOrder;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Purchase Order #{poNumber}</CardTitle>
          <Badge variant="secondary" className="capitalize text-base px-3 py-1">
            {status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Supplier</h4>
            <p className="text-slate-100">{supplierId.name}</p>
            <p className="text-slate-400">{supplierId.phone}</p>
            <p className="text-slate-400">{supplierId.email}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Destination</h4>
            <p className="text-slate-100">{destinationBranchId.name}</p>
            {/* We can add branch address here later */}
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Dates & Value</h4>
            <p className="text-slate-400">
              Order Date:{" "}
              <span className="text-slate-100">{formatDate(orderDate)}</span>
            </p>
            {expectedDeliveryDate && (
              <p className="text-slate-400">
                Expected:{" "}
                <span className="text-slate-100">
                  {formatDate(expectedDeliveryDate)}
                </span>
              </p>
            )}
            <p className="text-slate-400 mt-2">
              Total Value:{" "}
              <span className="font-semibold text-lg text-white">
                {formatCurrency(totalAmount)}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseOrderDetailView;
