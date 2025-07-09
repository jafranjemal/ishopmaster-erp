import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantCategoryService, tenantDeviceService, tenantRepairTypeService } from "../../../services/api";
import BreadcrumbNavigator from "./BreadcrumbNavigator";
import TileSelectionGrid from "./TileSelectionGrid";
import { Button } from "ui-library";

const RepairWizard = ({ onJobCreated }) => {
  const [step, setStep] = useState("CATEGORY"); // CATEGORY, DEVICE, PROBLEM
  const [path, setPath] = useState([]);
  const [items, setItems] = useState([]);
  const [selections, setSelections] = useState({});
  const [problemSelections, setProblemSelections] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      if (step === "CATEGORY") {
        const res = await tenantCategoryService.getAll();
        setItems(res.data.data.filter((c) => !c.parent));
      } else if (step === "DEVICE" && selections.category) {
        const res = await tenantDeviceService.getAll({ categoryId: selections.category._id });
        setItems(res.data.data);
      } else if (step === "PROBLEM" && selections.device) {
        const res = await tenantRepairTypeService.getAll({ deviceId: selections.device._id });
        setItems(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load data for wizard.");
    }
  }, [step, selections]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelect = (item) => {
    if (step === "CATEGORY") {
      setSelections({ category: item });
      setPath([{ _id: item._id, name: item.name }]);
      setStep("DEVICE");
    } else if (step === "DEVICE") {
      setSelections((prev) => ({ ...prev, device: item }));
      setPath((prev) => [...prev, { _id: item._id, name: item.name }]);
      setStep("PROBLEM");
    } else if (step === "PROBLEM") {
      setProblemSelections((prev) => {
        const exists = prev.find((p) => p._id === item._id);
        return exists ? prev.filter((p) => p._id !== item._id) : [...prev, item];
      });
    }
  };

  const handleBreadcrumbNavigate = (index) => {
    /* ... logic to go back to a previous step ... */
  };

  const handleAddToJob = () => {
    const jobItems = problemSelections.map((problem) => ({
      lineType: "repair_service",
      productVariantId: problem.productVariantId, // This link needs to be established
      description: `${problem.name} for ${selections.device.name}`,
      quantity: 1,
      unitPrice: problem.defaultPrice,
      finalPrice: problem.defaultPrice,
      cartId: Date.now() + Math.random(),
    }));
    onJobCreated(jobItems);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <BreadcrumbNavigator path={path} onNavigate={handleBreadcrumbNavigate} />
      <div className="flex-grow overflow-y-auto">
        <TileSelectionGrid items={items} onSelect={handleSelect} itemType={step === "PROBLEM" ? "problem" : "category"} />
      </div>
      {step === "PROBLEM" && (
        <div className="flex-shrink-0 pt-4 border-t border-slate-700">
          <Button className="w-full" onClick={handleAddToJob} disabled={problemSelections.length === 0}>
            Add {problemSelections.length} Service(s) to Job
          </Button>
        </div>
      )}
    </div>
  );
};
export default RepairWizard;
