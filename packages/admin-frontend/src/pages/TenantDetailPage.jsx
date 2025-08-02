"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Activity, AlertTriangle, ArrowLeft, Building2, CalendarDays, Database, Globe, MapPin, Settings, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Badge, Button, Card } from "ui-library";

import { useGoBack } from "../hooks/useGoBack";
import api, { adminTenantService } from "../services/api";

const masterListsToRestore = [
  { key: "brands", name: "Brands", description: "Restores the 'Brand' collection to factory defaults." },
  { key: "categories", name: "Product Categories", description: "Restores the 'Category' collection to factory defaults." },
  { key: "attributesAndSets", name: "Attributes & Sets", description: "Restores both 'Attribute' and 'AttributeSet' collections." },
  { key: "devices", name: "Devices", description: "Restores the 'Device' collection to factory defaults." },
  { key: "warrantyPolicies", name: "Warranty Policies", description: "Restores the 'WarrantyPolicy' collection to factory defaults." },
  { key: "qcChecklists", name: "QC Checklists", description: "Restores the 'QcChecklistTemplate' collection." },
  {
    key: "productTemplatesAndVariants",
    name: "Products & Variants",
    description: "WARNING: Restores the entire product catalog, including all variants.",
  },
];
const TenantDetailPage = () => {
  const { id } = useParams();
  const [loadingList, setLoadingList] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const goBack = useGoBack(`/tenants`);
  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [tenantRes] = await Promise.all([adminTenantService.getById(id)]);
      setTenant(tenantRes.data.data);
    } catch (error) {
      toast.error("Failed to load invoice details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const daysDiff = (expiry) => Math.ceil((new Date(expiry) - new Date()) / 86400000);

  const status =
    daysDiff(tenant?.licenseExpiry) < 0
      ? { text: "Expired", variant: "destructive", icon: <Activity className="w-4 h-4" /> }
      : daysDiff(tenant?.licenseExpiry) <= 14
        ? { text: "Expiring Soon", variant: "warning", icon: <Activity className="w-4 h-4" /> }
        : { text: "Active", variant: "success", icon: <Activity className="w-4 h-4" /> };

  const handleRestore = async (list) => {
    if (
      !window.confirm(
        `Are you sure you want to restore the "${list.name}" list? \n\nAll current data in this list for this tenant will be PERMANENTLY DELETED and replaced with the system defaults.`
      )
    ) {
      return;
    }

    setLoadingList(list.key);
    try {
      const res = await api.post(`/admin/tenants/${tenant._id}/master-data/restore`, { listName: list.key });
      // toast.success(res.data.message);
      alert(res.data.message); // Simple alert for now
      // You may want to refresh the tenant data here to show updated stats
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to restore list.";
      // toast.error(errorMessage);
      alert(`Error: ${errorMessage}`); // Simple alert for now
    } finally {
      setLoadingList(null);
    }
  };

  if (loading) return <p className="p-8 text-center">Loading tenant Details...</p>;
  if (!tenant) return <p className="p-8 text-center">tenant not found.</p>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={goBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to tenants
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tenant.companyName}</h1>
            <p className="text-slate-400 text-sm">{tenant.subdomain}.erp-system.com</p>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="overview" className="bg-slate-900 rounded-xl">
        <Tabs.List className="flex p-2 border-b border-slate-800">
          {[
            { value: "overview", icon: <Building2 className="w-4 h-4" />, label: "Overview" },
            { value: "branches", icon: <MapPin className="w-4 h-4" />, label: "Branches" },
            { value: "users", icon: <Users className="w-4 h-4" />, label: "Users" },
            { value: "settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-slate-800 data-[state=active]:text-white hover:text-white text-slate-400"
            >
              {tab.icon}
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" /> Company Info
                </h3>
                <Badge variant={tenant.isActive ? "success" : "destructive"}>{tenant.isActive ? "Active" : "Inactive"}</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Database</span>
                  <span className="font-mono text-sm">{tenant.dbName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Created</span>
                  <span>{formatDate(tenant.createdAt)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Modules</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                    {tenant.enabledModules?.map((module) => (
                      <Badge key={module} variant="secondary" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-lg">License Details</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${status.variant}-500`}></div>
                  <div>
                    <p className="font-medium">License Status</p>
                    <Badge variant={status.variant} className="mt-1">
                      {status.icon} {status.text}
                    </Badge>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Expiration date</p>
                  <p className="text-lg font-medium">{formatDate(tenant.licenseExpiry)}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{daysDiff(tenant.licenseExpiry)} days remaining</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-${status.variant}-500`}
                        style={{ width: `${Math.max(0, Math.min(100, daysDiff(tenant.licenseExpiry)))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-lg">System Metrics</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Branches</p>
                    <p className="text-xl font-bold">{tenant.branches?.length || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Active Users</p>
                    <p className="text-xl font-bold">
                      {tenant.users?.filter((u) => u.isActive).length || 0}/{tenant.users?.length || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Tabs.Content>

        {/* Branches Tab */}
        <Tabs.Content value="branches" className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Branch Network</h2>
            <p className="text-slate-400">All locations for this tenant</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenant.branches?.map((branch) => (
              <Card key={branch._id} className="hover:border-indigo-500 transition-colors">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{branch.name}</h3>
                    {branch.isPrimary && (
                      <Badge variant="success" className="px-2 py-1 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        {branch.address.street && <p>{branch.address.street}</p>}
                        <p>
                          {branch.address.city}, {branch.address.state}
                        </p>
                        <p>
                          {branch.address.postalCode}, {branch.address.country}
                        </p>
                      </div>
                    </div>

                    {branch.contact && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>Contact: {branch.contact.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                      <Badge variant={branch.isActive ? "success" : "destructive"} className="text-xs">
                        {branch.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-slate-500">Created: {formatDate(branch.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Tabs.Content>

        {/* Users Tab */}
        <Tabs.Content value="users" className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">User Management</h2>
            <p className="text-slate-400">All users with access to this tenant</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-left text-sm">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tenant.users?.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-900">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{user.email}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{tenant.branches?.find((b) => b._id === user.assignedBranchId)?.name || "N/A"}</td>
                    <td className="p-3">
                      <Badge variant={user.isActive ? "success" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="p-3 text-sm text-slate-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* Settings Tab */}
        <Tabs.Content value="settings" className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" /> Localization Settings
                </h3>

                <div className="space-y-4">
                  {Object.entries(tenant.settings?.localization || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="font-medium">{Array.isArray(value) ? value.join(", ") : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" /> Module Configuration
                </h3>

                <div className="space-y-4">
                  {Object.entries(tenant.settings || {})
                    .filter(([key]) => key !== "localization")
                    .map(([module, config]) => (
                      <div key={module} className="bg-slate-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 uppercase">{module} Settings</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(config).map(([setting, value]) => (
                            <div key={setting} className="truncate">
                              <div className="text-slate-400 truncate">{setting.replace(/([A-Z])/g, " $1").trim()}</div>
                              <div className="font-medium truncate">{typeof value === "object" ? JSON.stringify(value) : value.toString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>

            {/* ====================================================================== */}
            {/* NEW: Master Data Management Card */}
            {/* ====================================================================== */}
            <Card className="lg:col-span-2">
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" /> Master Data Management
                </h3>
                <div className="space-y-3">
                  {masterListsToRestore.map((list) => (
                    <div key={list.key} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div>
                        <p className="font-medium">{list.name}</p>
                        <p className="text-xs text-slate-400">{list.description}</p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleRestore(list)}
                        disabled={loadingList === list.key}
                        className="flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {loadingList === list.key ? "Restoring..." : "Restore"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default TenantDetailPage;
