import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantCategoryService, tenantDeviceService, tenantRepairTypeService, tenantProductService, tenantBrandService } from "../../../services/api";
import BreadcrumbNavigator from "./BreadcrumbNavigator";
import TileSelectionGrid from "./TileSelectionGrid";
import { Button } from "ui-library";
import { LoaderCircle, CheckCircle } from "lucide-react";

const HierarchyWizard = ({ startMode, onItemsSelected, onAddItem }) => {
  const [step, setStep] = useState("INITIALIZING");
  const [path, setPath] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [selections, setSelections] = useState({});
  const [problemSelections, setProblemSelections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ categories: [], brands: [], devices: [], repairTypes: [] });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [catRes, brandRes] = await Promise.all([tenantCategoryService.getAll(), tenantBrandService.getAll()]);
      setData({ categories: catRes.data.data, brands: brandRes.data.data, devices: [], repairTypes: [] });
    } catch (error) {
      toast.error("Failed to load hierarchy data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateToStep = useCallback(
    async (newStep, newSelections = {}, newPath = []) => {
      setIsLoading(true);
      setStep(newStep);
      setSelections(newSelections);
      setPath(newPath);
      console.log("startMode : ", startMode);
      console.log("step : ", newStep);
      console.log("newSelections : ", newSelections);
      console.log("newPath : ", newPath);
      try {
        let itemsToShow = [];
        switch (newStep) {
          case "SELECT_PRODUCT_TYPE":
            itemsToShow = [
              { _id: "non-serialized", name: "Non-Serialized" },
              { _id: "serialized", name: "Serialized" },
            ];
            break;
          case "CATEGORY": {
            const res = await tenantCategoryService.getAll();
            const rootName = startMode === "REPAIRS" ? "Services" : "Products";
            const root = res.data.data.find((c) => c.name === rootName && !c.parent);
            itemsToShow = root ? root.children : [];
            setPath(root ? [{ _id: root._id, name: root.name }] : []);
            break;
          }
          case "BRAND": {
            const res = await tenantBrandService.getAll();
            itemsToShow = res.data.data;
            break;
          }
          case "DEVICE": {
            const res = await tenantDeviceService.getAll({ brandId: newSelections.brand._id });
            itemsToShow = res.data.data;
            break;
          }
          case "PROBLEM": {
            const res = await tenantRepairTypeService.getAll({ deviceId: newSelections.device._id });
            itemsToShow = res.data.data;
            break;
          }
          case "PRODUCT_LIST": {
            const res = await tenantProductService.getAllVariants({
              categoryId: newSelections.category._id,
              templateType: newSelections.productType,
            });
            itemsToShow = res.data.data;
            break;
          }
        }
        setDisplayItems(itemsToShow);
      } catch (error) {
        toast.error(`Failed to load data for wizard.`);
      } finally {
        setIsLoading(false);
      }
    },
    [startMode]
  );

  useEffect(() => {
    const initialStep = startMode === "ACCESSORIES" ? "SELECT_PRODUCT_TYPE" : "CATEGORY";
    navigateToStep(initialStep);
  }, [startMode, navigateToStep]);

  const handleSelect = (item) => {
    if (step === "SELECT_PRODUCT_TYPE") navigateToStep("CATEGORY", { productType: item._id }, [item]);
    else if (step === "CATEGORY") navigateToStep("BRAND", { ...selections, category: item }, [...path, item]);
    else if (step === "BRAND") navigateToStep("DEVICE", { ...selections, brand: item }, [...path, item]);
    else if (step === "DEVICE") navigateToStep("PROBLEM", { ...selections, device: item }, [...path, item]);
    else if (step === "PROBLEM") {
      setProblemSelections((prev) => (prev.some((p) => p._id === item._id) ? prev.filter((p) => p._id !== item._id) : [...prev, item]));
    } else if (step === "PRODUCT_LIST") onAddItem(item);
  };

  const handleBreadcrumbNavigate = (index) => {
    // This logic allows jumping back to any previous step
    if (index < 0) {
      const initialStep = startMode === "ACCESSORIES" ? "SELECT_PRODUCT_TYPE" : "CATEGORY";
      navigateToStep(initialStep);
    } else {
      // In a more complex app, we'd determine the step from the path item type
      // For now, this is a simplified reset.
    }
  };

  const handleAddToJob = () => {
    const jobItems = problemSelections.map((problem) => ({
      lineType: "repair_service",
      productVariantId: problem.productVariantId,
      description: `${problem.name} for ${selections.device.name}`,
      quantity: 1,
      unitPrice: problem.defaultPrice,
      finalPrice: problem.defaultPrice,
      cartId: Date.now() + Math.random(),
    }));
    onItemsSelected(jobItems);
    navigateToStep("CATEGORY"); // Reset wizard
  };

  const renderCurrentStep = () => {
    if (isLoading)
      return (
        <div className="flex justify-center items-center h-full">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      );
    let itemType = "category";
    if (step === "DEVICE") itemType = "device";
    if (step === "PROBLEM") itemType = "problem";
    return <TileSelectionGrid items={displayItems} onSelect={handleSelect} itemType={itemType} selectedIds={problemSelections.map((p) => p._id)} />;
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <BreadcrumbNavigator path={path} onNavigate={handleBreadcrumbNavigate} />
      <div className="flex-grow overflow-y-auto pr-2">{renderCurrentStep()}</div>

      {step === "PROBLEM" && (
        <div className="flex-shrink-0 pt-4 border-t border-slate-700">
          <Button className="w-full h-12 text-base" onClick={handleAddToJob} disabled={problemSelections.length === 0}>
            <CheckCircle className="h-5 w-5 mr-2" />
            Add {problemSelections.length} Service(s) to Job
          </Button>
        </div>
      )}
    </div>
  );
};
export default HierarchyWizard;
