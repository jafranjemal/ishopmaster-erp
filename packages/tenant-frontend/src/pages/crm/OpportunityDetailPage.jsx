import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantOpportunityService, tenantSalesOrderService } from "../../services/api";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "ui-library";
import OpportunityItemEditor from "../../components/crm/opportunities/OpportunityItemEditor";
import useAuth from "../../context/useAuth";

const OpportunityDetailPage = () => {
  const { id: opportunityId } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!opportunityId) return;
    try {
      setIsLoading(true);
      const res = await tenantOpportunityService.getById(opportunityId);
      setOpportunity(res.data.data);
    } catch (error) {
      toast.error("Failed to load opportunity.");
      navigate("/crm/opportunities");
    } finally {
      setIsLoading(false);
    }
  }, [opportunityId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateItemOld = (index, field, value) => {
    const newItems = [...opportunity.items];
    newItems[index][field] = value;
    // Recalculate final price for the line
    newItems[index].finalPrice = newItems[index].quantity * newItems[index].unitPrice;
    // In a real app, you'd also recalculate the total opportunity amount
    setOpportunity((prev) => ({ ...prev, items: newItems }));
  };

  const handleFinalizeDeal = async () => {
    setIsSaving(true);
    try {
      // This would call the API to convert the opportunity to a Sales Order
      await toast.promise(tenantSalesOrderService.createFromOpportunity(opportunityId), {
        loading: "Finalizing deal...",
        success: "Sales Order created!",
        error: "Failed to finalize deal.",
      });
      navigate("/crm/opportunities");
    } catch (err) {
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateOpportunityItems = async (newItems) => {
    const newTotalAmount = newItems.reduce((sum, item) => sum + item.finalPrice, 0);
    const updatedOpportunity = { ...opportunity, items: newItems, amount: newTotalAmount };

    // Optimistic UI update for a snappy experience
    setOpportunity(updatedOpportunity);

    try {
      await tenantOpportunityService.update(opportunityId, { items: newItems, amount: newTotalAmount });
      toast.success("Opportunity items updated.");
    } catch (error) {
      console.log(error);
      toast.error("Failed to save changes. Reverting.");
      fetchData(); // Revert to server state on failure
    }
  };

  const handleAddItem = (newItem) => {
    const newItems = [...(opportunity.items || []), newItem];
    updateOpportunityItems(newItems);
  };

  const handleRemoveItem = (indexToRemove) => {
    const newItems = opportunity.items.filter((_, index) => index !== indexToRemove);
    updateOpportunityItems(newItems);
  };

  const handleUpdateItem = (indexToUpdate, field, value) => {
    const newItems = opportunity.items.map((item, index) => {
      if (index === indexToUpdate) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate final price for the line if quantity or unit price changes
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.finalPrice = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
        }
        return updatedItem;
      }
      return item;
    });
    updateOpportunityItems(newItems);
  };

  if (isLoading || !opportunity) return <div className="p-8 text-center">Loading Opportunity...</div>;

  return (
    <div className="space-y-6">
      <Link to="/crm/opportunities" className="flex items-center text-sm text-indigo-400 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pipeline
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{opportunity.name}</h1>
          <p className="text-slate-400">For: {opportunity.accountId?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" /> Save as Quotation
          </Button>
          <Button onClick={handleFinalizeDeal} disabled={isSaving}>
            <CheckCircle className="h-4 w-4 mr-2" /> Mark as Closed-Won
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm text-slate-400">Total Value</dt>
              <dd className="text-2xl font-bold text-green-400">{formatCurrency(opportunity.amount)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Stage</dt>
              <dd className="font-semibold">{opportunity.stage}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Expected Close</dt>
              <dd className="font-semibold">{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</dd>
            </div>
          </div>
        </CardContent>
      </Card>

      <OpportunityItemEditor items={opportunity.items} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onUpdateItem={handleUpdateItem} />
    </div>
  );
};
export default OpportunityDetailPage;
