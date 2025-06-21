import React from "react";
import { Button, TableCell } from "../../../../ui-library/src";
import { FilePenLine, Trash2 } from "lucide-react";

// A "dumb" presentational component. It only knows how to render a list of tenants.
const TenantList = ({ tenants, onEdit, onDelete }) => {
  if (tenants.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-8">
        No tenants found. Click "Create New Tenant" to get started.
      </p>
    );
  }

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Subdomain
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                License Expiry
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {tenants.map((tenant) => (
              <tr
                key={tenant._id}
                className="hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {tenant.companyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                  {tenant.subdomain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tenant.isActive
                        ? "bg-green-800 text-green-100"
                        : "bg-red-800 text-red-100"
                    }`}
                  >
                    {tenant.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(tenant.licenseExpiry).toLocaleDateString()}
                </td>

                <td className="text-right space-x-2">
                  {/* Action buttons trigger callbacks passed in via props */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(tenant)}
                    aria-label={`Edit ${tenant.companyName}`}
                  >
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(tenant)}
                    aria-label={`Delete ${tenant.companyName}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantList;
