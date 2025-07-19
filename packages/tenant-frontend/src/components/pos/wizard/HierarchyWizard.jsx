import { AlertCircle, ArrowLeft, ChevronRight, Layers, PackagePlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from 'ui-library';
import { tenantCategoryService, tenantDeviceService, tenantProductService } from '../../../services/api';
import BreadcrumbNavigator from './BreadcrumbNavigator';
import TileSelectionGrid from './TileSelectionGrid';

const WIZARD_STATE = {
  INIT: 'initializing',
  CATEGORY: 'category',
  BRAND: 'brand',
  DEVICE: 'device',
  PRODUCT_SELECT: 'product_select',
  ERROR: 'error',
};

const MAX_CATEGORY_DEPTH = 8;

const HierarchyWizard = ({ startMode, rootCategory, onItemsSelected, onAddItem }) => {
  const [state, setState] = useState(WIZARD_STATE.INIT);
  const [path, setPath] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [selections, setSelections] = useState({});
  const [productSelections, setProductSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [error, setError] = useState(null);

  // Initialize with root category
  useEffect(() => {
    if (rootCategory) {
      resetWizard();
    }
  }, [rootCategory]);

  const resetWizard = useCallback(() => {
    setState(WIZARD_STATE.CATEGORY);
    setPath([{ type: 'root', item: rootCategory }]);
    setSelections({});
    setProductSelections([]);
    setCurrentDepth(0);
    setError(null);
    fetchChildren(rootCategory._id);
  }, [rootCategory]);

  const fetchChildren = useCallback(
    async (parentId) => {
      setLoading(true);
      try {
        const response = await tenantCategoryService.getChildren(parentId);

        setDisplayItems(
          response.data.map((cat) => ({
            ...cat,
            hasChildren: cat.childrenCount > 0,
          })),
        );
      } catch (err) {
        setError(err);
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    },
    [rootCategory],
  );

  const checkCategoryLinkages = useCallback(async (categoryId) => {
    try {
      const [brandsRes, devicesRes] = await Promise.all([
        tenantCategoryService.getLinkedBrands(categoryId),
        tenantCategoryService.getLinkedDevices(categoryId),
      ]);

      return {
        hasBrands: brandsRes.data.length > 0,
        hasDevices: devicesRes.data.length > 0,
      };
    } catch (err) {
      console.error('Linkage check failed:', err);
      return { hasBrands: false, hasDevices: false };
    }
  }, []);

  const handleSelect = useCallback(
    async (item) => {
      try {
        switch (state) {
          case WIZARD_STATE.CATEGORY: {
            const newPath = [...path, { type: 'category', item }];

            // First, check if this category has children
            const children = await tenantCategoryService.getChildren(item._id);

            const hasChildren = children.data.length > 0;

            if (hasChildren && currentDepth < MAX_CATEGORY_DEPTH) {
              setCurrentDepth((d) => d + 1);
              setPath(newPath);
              setSelections((prev) => ({ ...prev, category: item }));
              fetchChildren(item._id);
            }
            // Leaf category reached - no children
            else {
              const linkages = await checkCategoryLinkages(item._id);

              if (linkages.hasBrands) {
                setState(WIZARD_STATE.BRAND);
                setSelections({ category: item });
                setPath(newPath);
                fetchBrands(item._id);
              } else if (linkages.hasDevices) {
                setState(WIZARD_STATE.DEVICE);
                setSelections({ category: item });
                setPath(newPath);
                fetchDevices(item._id);
              } else {
                setState(WIZARD_STATE.PRODUCT_SELECT);
                setSelections({ category: item });
                setPath(newPath);
                fetchProducts(item._id);
              }
            }
            break;
          }

          case WIZARD_STATE.BRAND: {
            const linkages = await checkCategoryLinkages(selections.category._id);
            const newPath = [...path, { type: 'brand', item }];

            if (linkages.hasDevices) {
              setState(WIZARD_STATE.DEVICE);
              setSelections((prev) => ({ ...prev, brand: item }));
              setPath(newPath);
              fetchDevices(selections.category._id, item._id);
            } else {
              setState(WIZARD_STATE.PRODUCT_SELECT);
              setSelections((prev) => ({ ...prev, brand: item }));
              setPath(newPath);
              fetchProducts(selections.category._id, item._id);
            }
            break;
          }

          case WIZARD_STATE.DEVICE: {
            const newPath = [...path, { type: 'device', item }];
            setState(WIZARD_STATE.PRODUCT_SELECT);
            setSelections((prev) => ({ ...prev, device: item }));
            setPath(newPath);
            fetchProducts(selections.category._id, selections.brand?._id, item._id);
            break;
          }

          case WIZARD_STATE.PRODUCT_SELECT: {
            try {
              const fullVariant = await tenantProductService.getAllVariants({ variantIds: item._id, limit: 10 });
              const selectedProduct = fullVariant.data.data;
              console.log('selectedProduct ', selectedProduct);
              setProductSelections((prev) =>
                prev.some((p) => p._id === selectedProduct._id)
                  ? prev.filter((p) => p._id !== selectedProduct._id)
                  : [...prev, selectedProduct],
              );
            } catch (error) {
              console.error('Failed to fetch variant:', error);
              toast.error('Failed to load product details');
              setProductSelections((prev) =>
                prev.some((p) => p._id === item._id) ? prev.filter((p) => p._id !== item._id) : [...prev, item],
              );
            }

            break;
          }
        }
      } catch (err) {
        setError(err);
        toast.error('Selection failed');
      }
    },
    [state, path, selections, currentDepth],
  );

  const fetchBrands = useCallback(async (categoryId) => {
    setLoading(true);
    try {
      const response = await tenantCategoryService.getLinkedBrands(categoryId);

      setDisplayItems(response.data);
    } catch (error) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDevices = useCallback(async (categoryId, brandId) => {
    setLoading(true);
    try {
      const response = await tenantDeviceService.getAll({
        categoryId,
        ...(brandId && { brandId }),
      });
      setDisplayItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(
    async (categoryId, brandId, deviceId) => {
      setLoading(true);
      try {
        const response = await tenantProductService.getAllVariants({
          categoryId,
          ...(brandId && { brandId }),
          ...(deviceId && { deviceId }),
          type: startMode === 'REPAIRS' ? 'service' : 'product',
        });
        setDisplayItems(response.data.data);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    },
    [startMode],
  );

  const handleAddToJob = useCallback(() => {
    const jobItems = productSelections.map((item) => {
      console.log('item adding to jobsheet', item);
      const lineType = startMode === 'REPAIRS' ? 'repair_service' : 'sale_item';

      const newItem = {
        productVariantId: item._id || item.productVariantId,
        description: item.variantName,
        taxCategoryId: item.templateId?.taxCategoryId || null,
        quantity: item.quantity || 1,
        unitPrice: item.sellingPrice || item.unitPrice,
        finalPrice: item.sellingPrice || item.finalPrice,
        cartId: Date.now() + Math.random(),
        isSerialized: item.templateId?.type === 'serialized',
        serialNumber: item.serialNumber, // From modal
        batchNumber: item?.batchInfo?.batchNumber || null,

        batchInfo: item.batchInfo, // From modal
        lineType: item.templateId?.type === 'bundle' ? 'bundle' : lineType,
        bundleItems: item.templateId?.bundleItems || [],
        warrantyInfo: item.templateId?.defaultWarrantyPolicyId || null,
      };

      return item;
    });

    console.log('jobItems ', jobItems);
    if (onItemsSelected) onItemsSelected(jobItems[0]);
    resetWizard();
  }, [productSelections, startMode, onItemsSelected, resetWizard]);

  const handleBreadcrumbNavigate = useCallback(
    (index) => {
      if (index < 0) {
        resetWizard();
        return;
      }

      const newPath = path.slice(0, index + 1);
      const lastItem = newPath[newPath.length - 1];

      if (!lastItem) {
        resetWizard();
        return;
      }

      // Handle root navigation
      if (lastItem.type === 'root') {
        fetchChildren(rootCategory._id);
        setState(WIZARD_STATE.CATEGORY);
        setPath(newPath);
        return;
      }

      // Handle other navigation
      switch (lastItem.type) {
        case 'category':
          setState(WIZARD_STATE.CATEGORY);
          fetchChildren(lastItem.item._id);
          break;
        case 'brand':
          setState(WIZARD_STATE.BRAND);
          fetchBrands(selections.category._id);
          break;
        case 'device':
          setState(WIZARD_STATE.DEVICE);
          fetchDevices(selections.category._id, selections.brand?._id);
          break;
      }

      setPath(newPath);
    },
    [path, rootCategory, selections, resetWizard],
  );

  const renderState = () => {
    if (state === WIZARD_STATE.ERROR) {
      return (
        <div className='flex flex-col items-center justify-center p-8'>
          <AlertCircle className='w-16 h-16 text-red-500 mb-4' />
          <h3 className='text-xl font-semibold mb-2'>Navigation Error</h3>
          <p className='text-gray-600 text-center mb-6'>{error?.message || 'Failed to load data'}</p>
          <Button onClick={resetWizard} variant='destructive'>
            <ArrowLeft className='mr-2' size={16} />
            Restart Selection
          </Button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className='grid grid-cols-3 gap-4 p-4'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='bg-gray-200 rounded-lg h-32 animate-pulse' />
          ))}
        </div>
      );
    }

    if (displayItems.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center p-8 text-center'>
          <div className='w-12 h-12 mb-4 bg-gray-200 rounded-full' />
          <h3 className='text-lg font-semibold'>No items available</h3>
          <p className='text-gray-500 mt-2'>
            {state === WIZARD_STATE.CATEGORY
              ? "This category doesn't have any sub-categories"
              : state === WIZARD_STATE.BRAND
                ? 'No brands linked to this category'
                : state === WIZARD_STATE.DEVICE
                  ? 'No devices found for this brand'
                  : 'No products available for selection'}
          </p>
        </div>
      );
    }

    const itemType =
      state === WIZARD_STATE.CATEGORY
        ? 'category'
        : state === WIZARD_STATE.BRAND
          ? 'brand'
          : state === WIZARD_STATE.DEVICE
            ? 'device'
            : 'product';

    return (
      <TileSelectionGrid
        items={displayItems}
        onSelect={handleSelect}
        itemType={itemType}
        selectedIds={productSelections.map((p) => p._id)}
        showPrices={state === WIZARD_STATE.PRODUCT_SELECT}
      />
    );
  };

  return (
    <div className='h-full flex flex-col bg-slate-900'>
      <div className='border-b border-slate-700 p-4 flex items-center justify-between'>
        <BreadcrumbNavigator path={path} onNavigate={handleBreadcrumbNavigate} />

        {state === WIZARD_STATE.PRODUCT_SELECT && productSelections.length > 0 && (
          <div className='bg-blue-900/30 text-blue-200 px-3 py-1 rounded-full text-sm font-medium border border-blue-700/50'>
            {productSelections.length} selected
          </div>
        )}
      </div>

      {state !== WIZARD_STATE.CATEGORY && path.length > 1 && (
        <div className='px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center text-sm text-slate-300'>
          <Layers className='h-4 w-4 mr-2 text-slate-400' />
          <span className='font-medium text-slate-100'>{path.find((p) => p.type === 'category')?.item.name}</span>
          {selections.brand && (
            <>
              <ChevronRight className='h-4 w-4 mx-1 text-slate-500' />
              <span className='text-slate-300'>{selections.brand.name}</span>
            </>
          )}
          {selections.device && (
            <>
              <ChevronRight className='h-4 w-4 mx-1 text-slate-500' />
              <span className='text-slate-300'>{selections.device.name}</span>
            </>
          )}
        </div>
      )}

      <div className='flex-grow overflow-y-auto p-4 bg-slate-900'>{renderState()}</div>

      {state === WIZARD_STATE.PRODUCT_SELECT && productSelections.length > 0 && (
        <div className='border-t border-slate-700 p-4 bg-slate-800/50'>
          <Button
            className='w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors'
            onClick={handleAddToJob}
          >
            <PackagePlus className='h-5 w-5 mr-2 text-emerald-100' />
            Add {productSelections.length} {startMode === 'REPAIRS' ? 'Service' : 'Product'}
            {productSelections.length !== 1 ? 's' : ''} to Job
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className='h-full flex flex-col'>
      <div className='border-b border-gray-200 p-4 flex items-center justify-between'>
        <BreadcrumbNavigator path={path} onNavigate={handleBreadcrumbNavigate} />

        {state === WIZARD_STATE.PRODUCT_SELECT && productSelections.length > 0 && (
          <div className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium'>
            {productSelections.length} selected
          </div>
        )}
      </div>

      {state !== WIZARD_STATE.CATEGORY && path.length > 1 && (
        <div className='px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center text-sm text-gray-600'>
          <Layers className='h-4 w-4 mr-2 text-gray-500' />
          <span className='font-medium text-gray-800'>{path.find((p) => p.type === 'category')?.item.name}</span>
          {selections.brand && (
            <>
              <ChevronRight className='h-4 w-4 mx-1 text-gray-400' />
              <span>{selections.brand.name}</span>
            </>
          )}
          {selections.device && (
            <>
              <ChevronRight className='h-4 w-4 mx-1 text-gray-400' />
              <span>{selections.device.name}</span>
            </>
          )}
        </div>
      )}

      <div className='flex-grow overflow-y-auto p-4'>{renderState()}</div>

      {state === WIZARD_STATE.PRODUCT_SELECT && productSelections.length > 0 && (
        <div className='border-t border-gray-200 p-4'>
          <Button
            className='w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700'
            onClick={handleAddToJob}
          >
            <PackagePlus className='h-5 w-5 mr-2' />
            Add {productSelections.length} {startMode === 'REPAIRS' ? 'Service' : 'Product'}
            {productSelections.length !== 1 ? 's' : ''} to Job
          </Button>
        </div>
      )}
    </div>
  );
};

export default HierarchyWizard;
