import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import useAuth from "../../context/useAuth";

const GRNDetailView = ({ grn }) => {
  const { formatDate } = useAuth();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Goods Receipt Note #{grn.grnNumber}</CardTitle>
            <CardDescription>
              Received on {formatDate(grn.receivedDate)} by {grn.receivedBy?.name || "N/A"}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize text-base px-3 py-1">
            {grn.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Supplier</h4>
            <p className="text-slate-100">{grn.supplierId.name}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Original Purchase Order</h4>
            <p className="font-mono text-indigo-400">{grn.purchaseOrderId.poNumber}</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Received Items</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grn.items.map((item, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">{item.ProductVariantsId.variantName}</div>
                      <div className="text-xs text-slate-400 font-mono">SKU: {item.ProductVariantsId.sku}</div>
                    </TableCell>
                    <TableCell className="text-right font-bold">{item.quantityReceived}</TableCell>
                  </TableRow>
                  {item.receivedSerials && item.receivedSerials.length > 0 && (
                    <TableRow className="bg-slate-900/50">
                      <TableCell colSpan={2} className="py-2 px-6">
                        <p className="text-xs font-semibold text-slate-400 mb-1">Serial Numbers Received:</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {item.receivedSerials.map((serial) => (
                            <span key={serial} className="font-mono text-xs text-slate-300">
                              {serial}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
export default GRNDetailView;
