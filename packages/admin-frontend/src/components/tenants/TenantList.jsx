import React from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import { FilePenLine } from "lucide-react";
import { cn } from "ui-library/lib/utils";

const TenantList = ({ tenants, onEdit }) => {
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const getExpiryStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiry < 0) return { text: "Expired", color: "bg-red-600" };
    if (daysUntilExpiry <= 14) return { text: "Expiring Soon", color: "bg-amber-500" };
    return { text: "Active", color: "bg-green-600" };
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Subdomain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>License Expiry</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenants.map((tenant) => {
          const expiryStatus = getExpiryStatus(tenant.licenseExpiry);
          return (
            <TableRow key={tenant._id}>
              <TableCell className="font-medium">{tenant.companyName}</TableCell>
              <TableCell className="font-mono text-slate-400">{tenant.subdomain}</TableCell>
              <TableCell>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tenant.isActive ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
                  }`}
                >
                  {tenant.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", expiryStatus.color)}></span>
                  <span>{formatDate(tenant.licenseExpiry)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(tenant)}>
                  <FilePenLine className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export default TenantList;
