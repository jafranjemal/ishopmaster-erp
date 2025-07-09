import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import * as Tabs from "@radix-ui/react-tabs";
import { tenantPricingService, tenantCustomerGroupService, tenantCategoryService } from "../../services/api";
import { Button, Modal, Card, CardContent, CardHeader, CardTitle } from "ui-library";
import { PlusCircle, ShieldAlert } from "lucide-react";
import PricingRuleList from "../../components/settings/pricing/PricingRuleList";
import PromotionList from "../../components/settings/pricing/PromotionList";
import PricingRuleForm from "../../components/settings/pricing/PricingRuleForm";
import PromotionForm from "../../components/settings/pricing/PromotionForm";

const PricingManagementPage = () => {
  const [rules, setRules] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, type: "", data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rulesRes, promoRes, groupsRes, catRes] = await Promise.all([
        tenantPricingService.getAllRules(),
        tenantPricingService.getAllPromotions(),
        tenantCustomerGroupService.getAll(),
        tenantCategoryService.getAll(),
      ]);
      setRules(rulesRes.data.data);
      setPromotions(promoRes.data.data);
      setCustomerGroups(groupsRes.data.data);
      setCategories(catRes.data.data.filter((c) => !c.parentCategory)); // Assuming top-level categories for now
    } catch (error) {
      toast.error("Failed to load pricing data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    const { type, data } = modalState;
    const isEdit = Boolean(data);
    let apiCall;
    if (type === "rule") {
      apiCall = isEdit ? tenantPricingService.updateRule(data._id, formData) : tenantPricingService.createRule(formData);
    } else {
      // promotion
      apiCall = isEdit ? tenantPricingService.updatePromotion(data._id, formData) : tenantPricingService.createPromotion(formData);
    }
    try {
      await toast.promise(apiCall, {
        loading: "Saving...",
        success: "Saved successfully!",
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

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { type, data } = deleteConfirm;
    let apiCall;
    if (type === "rule") apiCall = tenantPricingService.deleteRule(data._id);
    else apiCall = tenantPricingService.deletePromotion(data._id);

    try {
      await toast.promise(apiCall, {
        loading: `Deleting...`,
        success: "Item deleted.",
        error: (err) => err.response?.data?.error || "Delete failed.",
      });
      fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      /* handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Pricing & Promotions</h1>

      <Tabs.Root defaultValue="rules" className="w-full">
        <Tabs.List className="flex border-b border-slate-700 relative">
          <Tabs.Trigger value="rules" className="ui-tabs-trigger relative px-4 py-2 font-medium text-sm data-[state=active]:text-indigo-400">
            Pricing Rules
          </Tabs.Trigger>
          <Tabs.Trigger value="promotions" className="ui-tabs-trigger relative px-4 py-2 font-medium text-sm data-[state=active]:text-indigo-400">
            Promotions
          </Tabs.Trigger>
        </Tabs.List>

        <div className="pt-6 space-y-6">
          {/* Rules Tab */}
          <Tabs.Content value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Rules List</h2>
              <Button onClick={() => setModalState({ isOpen: true, type: "rule" })} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Rule
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-slate-400">Loading rules...</div>
                ) : rules.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic">No pricing rules found.</div>
                ) : (
                  <PricingRuleList
                    rules={rules}
                    onEdit={(item) => setModalState({ isOpen: true, type: "rule", data: item })}
                    onDelete={(item) => setDeleteConfirm({ type: "rule", data: item })}
                  />
                )}
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* Promotions Tab */}
          <Tabs.Content value="promotions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Promotions List</h2>
              <Button onClick={() => setModalState({ isOpen: true, type: "promotion" })} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Promotion
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-slate-400">Loading promotions...</div>
                ) : promotions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic">No promotions available.</div>
                ) : (
                  <PromotionList
                    promotions={promotions}
                    onEdit={(item) => setModalState({ isOpen: true, type: "promotion", data: item })}
                    onDelete={(item) => setDeleteConfirm({ type: "promotion", data: item })}
                  />
                )}
              </CardContent>
            </Card>
          </Tabs.Content>
        </div>
      </Tabs.Root>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        title={`${modalState.data ? "Edit" : "Create"} ${modalState.type === "rule" ? "Pricing Rule" : "Promotion"}`}
      >
        {modalState.type === "rule" && (
          <PricingRuleForm
            ruleToEdit={modalState.data}
            customerGroups={customerGroups}
            categories={categories}
            onSave={handleSave}
            onCancel={() => setModalState({ isOpen: false })}
            isSaving={isSaving}
          />
        )}
        {modalState.type === "promotion" && (
          <PromotionForm
            promotionToEdit={modalState.data}
            onSave={handleSave}
            onCancel={() => setModalState({ isOpen: false })}
            isSaving={isSaving}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-sm text-slate-300">
            Are you sure you want to delete <strong>{deleteConfirm?.data?.name}</strong>?
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
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
export default PricingManagementPage;
