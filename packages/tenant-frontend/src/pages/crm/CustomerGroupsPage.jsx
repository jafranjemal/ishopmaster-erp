import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { tenantCustomerGroupService, tenantCustomerService } from "../../services/api";
import { Button, Modal, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import { PlusCircle, UserPlus, Trash2, ShieldAlert } from "lucide-react";
import CustomerGroupList from "../../components/crm/groups/CustomerGroupList";
import CustomerGroupForm from "../../components/crm/groups/CustomerGroupForm";
import AssignCustomerModal from "../../components/crm/groups/AssignCustomerModal";

const CustomerGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: "", data: null });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [groupsRes, customersRes] = await Promise.all([
        tenantCustomerGroupService.getAll(),
        tenantCustomerService.getAll({ limit: 5000 }), // Fetch all for assignment modal
      ]);
      setGroups(groupsRes.data.data);
      setAllCustomers(customersRes.data.data);
    } catch (error) {
      toast.error("Failed to load customer group data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groupMembers = useMemo(() => {
    if (!selectedGroup) return [];
    return allCustomers.filter((c) => c.customerGroupId === selectedGroup._id);
  }, [selectedGroup, allCustomers]);

  const handleSaveGroup = async (formData) => {
    setIsSaving(true);
    const apiCall = modalState.data ? tenantCustomerGroupService.update(modalState.data._id, formData) : tenantCustomerGroupService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving group...",
        success: "Group saved!",
        error: (err) => err.response?.data?.error || "Save failed.",
      });
      fetchData();
      setModalState({ isOpen: false });
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignCustomers = async (customerIds) => {
    const promises = customerIds.map((id) => tenantCustomerService.update(id, { customerGroupId: selectedGroup._id }));

    try {
      await toast.promise(Promise.all(promises), { loading: "Assigning customers...", success: "Customers assigned!", error: "Assignment failed." });
      // Instead of a full refetch, we update the local state directly for an instant UI update.
      setAllCustomers((prevCustomers) =>
        prevCustomers.map((cust) => (customerIds.includes(cust._id) ? { ...cust, customerGroupId: selectedGroup._id } : cust))
      );
      // Also update the count on the group list
      setGroups((prevGroups) =>
        prevGroups.map((g) => (g._id === selectedGroup._id ? { ...g, customerCount: g.customerCount + customerIds.length } : g))
      );
    } catch (err) {
      /* handled by toast */
    }
  };

  const handleRemoveCustomer = async (customerId) => {
    try {
      await toast.promise(tenantCustomerService.update(customerId, { customerGroupId: null }), {
        loading: "Removing...",
        success: "Customer removed from group.",
        error: "Removal failed.",
      });
      setAllCustomers((prevCustomers) => prevCustomers.map((cust) => (cust._id === customerId ? { ...cust, customerGroupId: null } : cust)));
      setGroups((prevGroups) => prevGroups.map((g) => (g._id === selectedGroup._id ? { ...g, customerCount: g.customerCount - 1 } : g)));
    } catch (err) {
      /* handled by toast */
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantCustomerGroupService.delete(deleteConfirm._id), {
        loading: `Deleting "${deleteConfirm.name}"...`,
        success: "Group deleted.",
        error: (err) => err.response?.data?.error || "Delete failed.",
      });
      setSelectedGroup(null); // Deselect the group
      fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      /* handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Groups</h1>
        <Button onClick={() => setModalState({ isOpen: true, type: "group" })}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-4">
          <CustomerGroupList
            groups={groups}
            selectedGroupId={selectedGroup?._id}
            onSelect={setSelectedGroup}
            onEdit={(group) => setModalState({ isOpen: true, type: "group", data: group })}
            onDelete={setDeleteConfirm}
          />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedGroup ? `Members of "${selectedGroup.name}"` : "Select a Group"}</CardTitle>
              {selectedGroup && (
                <Button size="sm" onClick={() => setIsAssignModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Customers
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedGroup && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-400 h-24">
                        Select a group to see its members.
                      </TableCell>
                    </TableRow>
                  )}
                  {selectedGroup && groupMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-400 h-24">
                        This group has no members.
                      </TableCell>
                    </TableRow>
                  )}
                  {selectedGroup &&
                    groupMembers.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomer(c._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false })} title={modalState.data ? "Edit Group" : "Create New Group"}>
        <CustomerGroupForm
          groupToEdit={modalState.data}
          onSave={handleSaveGroup}
          onCancel={() => setModalState({ isOpen: false })}
          isSaving={isSaving}
        />
      </Modal>
      {selectedGroup && (
        <AssignCustomerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignCustomers}
          allCustomers={allCustomers}
          groupMembers={groupMembers}
        />
      )}
      <Modal isOpen={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete group "{deleteConfirm?.name}"?</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteGroup}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default CustomerGroupsPage;
