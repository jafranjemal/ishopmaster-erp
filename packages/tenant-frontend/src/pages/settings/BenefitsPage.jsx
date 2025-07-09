import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantBenefitTypeService, tenantAccountingService } from "../../services/api";
import { Button, Modal, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import { PlusCircle } from "lucide-react";
import BenefitTypeForm from "../../components/hr/benefits/BenefitTypeForm";

const BenefitsPage = () => {
  const [benefitTypes, setBenefitTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [typesRes, accountsRes] = await Promise.all([tenantBenefitTypeService.getAll(), tenantAccountingService.getAllAccounts()]);
      setBenefitTypes(typesRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch (error) {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    const apiCall = editingItem ? tenantBenefitTypeService.update(editingItem._id, formData) : tenantBenefitTypeService.create(formData);
    try {
      await toast.promise(apiCall, { loading: "Saving...", success: "Benefit type saved!", error: "Save failed." });
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      /* handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Benefit Types</h1>
        <Button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Benefit Type
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Linked Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefitTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell className="capitalize">{type.type}</TableCell>
                  <TableCell>{type.linkedLiabilityAccountId?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Benefit Type" : "Create Benefit Type"}>
        <BenefitTypeForm itemToEdit={editingItem} accounts={accounts} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
export default BenefitsPage;
