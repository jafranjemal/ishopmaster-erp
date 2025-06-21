import React from "react";
import { Mail, Phone, MapPin, Truck } from "lucide-react";
import { Button, Badge } from "ui-library";

const SupplierProfileHeader = ({ supplier }) => {
  if (!supplier) return null;
  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white uppercase">
              {supplier.name}
            </h1>
            <Badge variant={supplier.isActive ? "success" : "destructive"}>
              {supplier.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="mt-4 flex gap-x-6 gap-y-2 text-slate-400 text-sm">
            {supplier.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{supplier.phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>{supplier.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Truck className="mr-2 h-4 w-4" /> New Purchase Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfileHeader;
