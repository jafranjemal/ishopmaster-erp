import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  tenantCategoryService,
  tenantDeviceService,
  tenantRepairTypeService,
  tenantProductService,
  tenantBrandService,
} from '../../../services/api';
import BreadcrumbNavigator from './BreadcrumbNavigator';
import TileSelectionGrid from './TileSelectionGrid';
import { Button } from 'ui-library';
import { LoaderCircle, CheckCircle } from 'lucide-react';

const STEP = {
  INIT: 'INITIALIZING',
  PRODUCT_TYPE: 'SELECT_PRODUCT_TYPE',
  CATEGORY: 'CATEGORY',
  BRAND: 'BRAND',
  DEVICE: 'DEVICE',
  TEMPLATE_SELECT: 'SELECT_TEMPLATE',
  TEMPLATE_LIST: 'PROBLEM_TEMPLATE',
  VARIANT_LIST: 'PRODUCT_LIST',
  VARIANT_SELECT: 'PROBLEM',
};

const STEP_MAP = {
  productType: STEP.CATEGORY,
  category: STEP.BRAND,
  brand: STEP.DEVICE,
  device: STEP.TEMPLATE_SELECT,
  template: STEP.VARIANT_LIST,
};

const HierarchyWizard = ({ startMode, onItemsSelected, onAddItem }) => {
  const [step, setStep] = useState(STEP.INIT);
  const [path, setPath] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [selections, setSelections] = useState({});
  const [problemSelections, setProblemSelections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRootData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [catRes, brandRes] = await Promise.all([tenantCategoryService.getAll(), tenantBrandService.getAll()]);
      return { categories: catRes.data.data, brands: brandRes.data.data };
    } catch {
      toast.error('Failed to load hierarchy data.');
      return { categories: [], brands: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialStep = startMode === 'ACCESSORIES' ? STEP.PRODUCT_TYPE : STEP.CATEGORY;
    navigateToStep(initialStep);
  }, [startMode]);

  const navigateToStep = async (newStep, newSelections = selections, newPath = path) => {
    setIsLoading(true);
    setStep(newStep);
    setSelections(newSelections);
    setPath(newPath);
    try {
      let items = [];
      switch (newStep) {
        case STEP.PRODUCT_TYPE:
          items = [
            { _id: 'non-serialized', name: 'Standard' },
            { _id: 'serialized', name: 'Serialized' },
            { _id: 'bundle', name: 'Bundle/Combo' },
          ];
          break;
        case STEP.CATEGORY: {
          const cats = await tenantCategoryService.getAll();
          const rootName = startMode === 'REPAIRS' ? 'Services' : 'Products';
          const root = cats.data.data.find((c) => c.name === rootName && !c.parent);
          items = root ? root.children : [];
          if (!newPath.length && root) {
            newPath = [{ _id: root._id, name: root.name, type: 'root' }];
          }
          break;
        }
        case STEP.BRAND: {
          const brands = await tenantBrandService.getAll();
          items = brands.data.data;
          break;
        }
        case STEP.DEVICE: {
          const devRes = await tenantDeviceService.getAll({ brandId: newSelections.brand._id });
          items = devRes.data.data;
          break;
        }
        case STEP.TEMPLATE_LIST: {
          const tempList = await tenantProductService.getAllTemplates({
            categoryId: newSelections.category._id,
            type: 'service',
          });
          items = tempList.data.data;
          break;
        }
        case STEP.VARIANT_SELECT: {
          const variantsFromTemplate = await tenantProductService.getAllVariantsForTemplate(newSelections.template._id);
          items = variantsFromTemplate.data.data;
          break;
        }
        case STEP.TEMPLATE_SELECT:
          const templates = await tenantProductService.getAllTemplates({
            categoryId: newSelections.category._id,
            brandId: newSelections.brand?._id,
            deviceId: newSelections.device._id,
            type: newSelections.productType,
          });
          items = templates.data.data;
          break;
        case STEP.VARIANT_LIST:
          const allVariants = await tenantProductService.getAllVariantsForTemplate(newSelections.template._id);
          items = allVariants.data.data;
          break;
      }
      setDisplayItems(items);
    } catch {
      toast.error('Failed to load step data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item) => {
    const extendedPath = [...path, { ...item, type: step.toLowerCase() }];
    switch (step) {
      case STEP.PRODUCT_TYPE:
        navigateToStep(STEP.CATEGORY, { productType: item._id }, [{ ...item, type: 'productType' }]);
        break;
      case STEP.CATEGORY:
        navigateToStep(
          startMode === 'REPAIRS' ? STEP.TEMPLATE_LIST : STEP.BRAND,
          { ...selections, category: item },
          extendedPath,
        );
        break;
      case STEP.BRAND:
        navigateToStep(STEP.DEVICE, { ...selections, brand: item }, extendedPath);
        break;
      case STEP.DEVICE:
        const next = startMode === 'REPAIRS' ? STEP.VARIANT_SELECT : STEP.TEMPLATE_SELECT;
        navigateToStep(next, { ...selections, device: item }, extendedPath);
        break;
      case STEP.TEMPLATE_SELECT:
        navigateToStep(STEP.VARIANT_LIST, { ...selections, template: item }, extendedPath);
        break;
      case STEP.TEMPLATE_LIST:
        navigateToStep(STEP.VARIANT_SELECT, { ...selections, template: item }, extendedPath);
        break;
      case STEP.VARIANT_SELECT:
        setProblemSelections((prev) =>
          prev.some((p) => p._id === item._id) ? prev.filter((p) => p._id !== item._id) : [...prev, item],
        );
        break;
      case STEP.VARIANT_LIST:
        onAddItem(item);
        break;
    }
  };

  const handleAddToJob = () => {
    const jobItems = problemSelections.map((problem) => ({
      lineType: 'repair_service',
      productVariantId: problem._id,
      description: problem.variantName,
      quantity: 1,
      unitPrice: problem.sellingPrice,
      finalPrice: problem.sellingPrice,
      cartId: Date.now() + Math.random(),
    }));
    onItemsSelected(jobItems);
    navigateToStep(STEP.CATEGORY);
  };

  const handleBreadcrumbNavigate = (index) => {
    if (index === path.length - 1) return;
    if (index < 0) return navigateToStep(startMode === 'ACCESSORIES' ? STEP.PRODUCT_TYPE : STEP.CATEGORY);
    const newPath = path.slice(0, index + 1);
    const newSelections = newPath.reduce((acc, item) => {
      if (item.type !== 'root') acc[item.type] = item;
      return acc;
    }, {});
    const lastType = newPath.at(-1).type;
    const nextStep = STEP_MAP[lastType] || STEP.CATEGORY;
    navigateToStep(nextStep, newSelections, newPath);
  };

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className='flex justify-center items-center h-full'>
          <LoaderCircle className='h-6 w-6 animate-spin' />
        </div>
      );
    }
    const typeMap = {
      [STEP.DEVICE]: 'device',
      [STEP.VARIANT_SELECT]: 'problem',
      [STEP.VARIANT_LIST]: 'product',
    };
    return (
      <TileSelectionGrid
        items={displayItems}
        onSelect={handleSelect}
        itemType={typeMap[step] || 'category'}
        selectedIds={problemSelections.map((p) => p._id)}
      />
    );
  };

  return (
    <div className='h-full flex flex-col gap-4'>
      <BreadcrumbNavigator path={path} onNavigate={handleBreadcrumbNavigate} />
      <div className='flex-grow overflow-y-auto pr-2'>{renderStep()}</div>
      {step === STEP.VARIANT_SELECT && (
        <div className='flex-shrink-0 pt-4 border-t border-slate-700'>
          <Button className='w-full h-12 text-base' onClick={handleAddToJob} disabled={!problemSelections.length}>
            <CheckCircle className='h-5 w-5 mr-2' />
            Add {problemSelections.length} Service(s) to Job
          </Button>
        </div>
      )}
    </div>
  );
};

export default HierarchyWizard;
