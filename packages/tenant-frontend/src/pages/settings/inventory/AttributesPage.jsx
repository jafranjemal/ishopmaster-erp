import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { tenantAttributeService } from "../../../services/api";
import {
  Button,
  Modal,
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
  Badge,
} from "ui-library";
import AttributeSetForm from "../../../components/settings/inventory/AttributeSetForm";
import AttributeList from "../../../components/settings/inventory/AttributeList";
import AttributeForm from "../../../components/settings/inventory/AttributeForm";

const AttributesPage = () => {
  const [attributes, setAttributes] = useState([]);
  const [attributeSets, setAttributeSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "",
    data: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: "",
    data: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [attrsRes, setsRes] = await Promise.all([
        tenantAttributeService.getAllAttributes(),
        tenantAttributeService.getAllAttributeSets(),
      ]);
      setAttributes(attrsRes.data.data);
      setAttributeSets(setsRes.data.data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load attribute data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseModals = () => {
    setModalState({ isOpen: false, type: "", data: null });
    setDeleteConfirm({ isOpen: false, type: "", data: null });
  };

  const handleSave = async (data) => {
    setIsSaving(true);
    const { type, data: editingData } = modalState;
    const isEditMode = Boolean(editingData);
    let apiCall;

    if (type === "attribute") {
      apiCall = isEditMode
        ? tenantAttributeService.updateAttribute(editingData._id, data)
        : tenantAttributeService.createAttribute(data);
    } else {
      // 'attributeSet'
      apiCall = isEditMode
        ? tenantAttributeService.updateAttributeSet(editingData._id, data)
        : tenantAttributeService.createAttributeSet(data);
    }

    try {
      await toast.promise(apiCall, {
        loading: "Saving...",
        success: `${
          type === "attribute" ? "Attribute" : "Set"
        } saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save.",
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      console.log(error);

      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const { type, data } = deleteConfirm;
    if (!data) return;

    const apiCall =
      type === "attribute"
        ? tenantAttributeService.deleteAttribute(data._id)
        : tenantAttributeService.deleteAttributeSet(data._id);

    try {
      await toast.promise(apiCall, {
        loading: "Deleting...",
        success: `${type === "attribute" ? "Attribute" : "Set"} deleted.`,
        error: (err) => err.response?.data?.error || "Failed to delete.",
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      console.log(error);
      /* handled by toast */
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Attributes & Specifications</h1>
        <p className="mt-1 text-slate-400">
          Manage the core characteristics of your products.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center p-12">
          <p>Loading inventory settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Attribute Sets</CardTitle>
                <Button
                  size="sm"
                  onClick={() =>
                    setModalState({
                      isOpen: true,
                      type: "attributeSet",
                      data: null,
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> New Set
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Set Name</TableHead>
                    <TableHead>Attributes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributeSets.map((set) => (
                    <TableRow
                      key={set._id}
                      onClick={() =>
                        setModalState({
                          isOpen: true,
                          type: "attributeSet",
                          data: set,
                        })
                      }
                      className="cursor-pointer hover:bg-slate-800/50"
                    >
                      <TableCell className="font-medium">{set.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {set.attributes.map((attr) => (
                            <Badge key={attr._id} variant="secondary">
                              {attr.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Individual Attributes</CardTitle>
                <Button
                  size="sm"
                  onClick={() =>
                    setModalState({
                      isOpen: true,
                      type: "attribute",
                      data: null,
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> New Attribute
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AttributeList
                attributes={attributes}
                onEdit={(attr) =>
                  setModalState({ isOpen: true, type: "attribute", data: attr })
                }
                onDelete={(attr) =>
                  setDeleteConfirm({
                    isOpen: true,
                    type: "attribute",
                    data: attr,
                  })
                }
              />
            </CardContent>
          </Card>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={handleCloseModals}
        title={
          modalState.data
            ? `Edit ${modalState.type}`
            : `Create New ${modalState.type}`
        }
      >
        {modalState.type === "attributeSet" && (
          <AttributeSetForm
            setToEdit={modalState.data}
            allAttributes={attributes}
            onSave={handleSave}
            onCancel={handleCloseModals}
            isSaving={isSaving}
          />
        )}
        {modalState.type === "attribute" && (
          <AttributeForm
            attributeToEdit={modalState.data}
            onSave={handleSave}
            onCancel={handleCloseModals}
            isSaving={isSaving}
          />
        )}
      </Modal>

      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={handleCloseModals}
        title={`Confirm Deletion`}
      >
        <p>
          Are you sure you want to delete the {deleteConfirm.type} "
          {deleteConfirm.data?.name}"?
        </p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AttributesPage;
