import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Modal,
  CardDescription,
} from 'ui-library';
import CompatibilitySelector from './CompatibilitySelector';
import FileUploader from 'ui-library/components/FileUploader';
import { Loader2, Trash2, X, PlusCircle, ShieldCheck, Percent } from 'lucide-react';
import ProductVariantSearch from '../procurement/ProductVariantSearch';
import { toast } from 'react-hot-toast';
import { tenantBrandService, tenantCategoryService, tenantDeviceService } from '../../services/api';
import CategoryQuickForm from './products/CategoryQuickForm';
import BrandQuickForm from './products/BrandQuickForm';

const generateCategoryOptions = (categories, level = 0) => {
  let options = [];
  for (const category of categories) {
    if (!category || !category._id || !category.name) continue; // Skip invalid categories
    options.push(
      <SelectItem key={category._id} value={category._id}>
        {'\u00A0'.repeat(level * 4)} {level > 0 ? '↳ ' : ''}
        {category.name}
      </SelectItem>,
    );
    if (category.children && category.children.length > 0) {
      options = options.concat(generateCategoryOptions(category.children, level + 1));
    }
  }
  return options;
};

/**
 * Recursively find the category tree starting from the given category name.
 * @param {Array} categories - The full nested category tree
 * @param {string} targetName - e.g., "Services"
 * @returns {object|null} - The matched subtree or null
 */
function extractCategorySubtreeByName(categories, targetName) {
  for (const category of categories) {
    if (category.name === targetName) return category;

    if (category.children?.length > 0) {
      const result = extractCategorySubtreeByName(category.children, targetName);
      if (result) return result;
    }
  }
  return null;
}

const PRODUCT_TYPES = ['non-serialized', 'serialized', 'service', 'bundle'];

const ProductTemplateForm = ({
  templateToEdit,
  brands,
  categories,
  attributeSets,
  accounts,
  allTemplates,
  onSave,
  onCancel,
  isSaving,
  getSignatureFunc,
  onDataRefresh,
  warrantyPolicies,
  taxCategories,
}) => {
  const initialFormData = React.useMemo(
    () => ({
      baseName: '',
      skuPrefix: '',
      type: 'non-serialized',
      brandId: '',
      categoryId: '',
      taxCategoryId: null,
      attributeSetId: '',
      costPrice: 0,
      sellingPrice: 0,
      alertQty: 5,
      assetAccountId: '',
      revenueAccountId: '',
      cogsAccountId: '',
      compatibility: [],
      images: [],
      description: '',
      bundleItems: [],
      deviceId: '',
      requiredParts: [],
      defaultWarrantyPolicyId: null,
    }),
    [],
  );
  const [formData, setFormData] = useState(initialFormData);
  const isEditMode = Boolean(templateToEdit?.brandId?._id);
  const [devicesForManufacturer, setDevicesForManufacturer] = useState([]);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // --- THE FIX: Determine if the product type requires brand/category ---
  const isPhysicalProduct = useMemo(() => {
    return ['serialized', 'non-serialized'].includes(formData.type);
  }, [formData.type]);

  useEffect(() => {
    if (isEditMode && templateToEdit && templateToEdit.baseName) {
      setFormData({
        baseName: templateToEdit.baseName || '',
        skuPrefix: templateToEdit.skuPrefix || '',
        type: templateToEdit.type || 'non-serialized',
        brandId: templateToEdit.brandId?._id || '',
        categoryId: templateToEdit.categoryId?._id || '',
        attributeSetId: templateToEdit.attributeSetId?._id || '',
        costPrice: templateToEdit.costPrice || 0,
        sellingPrice: templateToEdit.sellingPrice || 0,
        alertQty: templateToEdit.alertQty || 5,
        assetAccountId: templateToEdit.assetAccountId?._id || '',
        revenueAccountId: templateToEdit.revenueAccountId?._id || '',
        cogsAccountId: templateToEdit.cogsAccountId?._id || '',
        compatibility: templateToEdit.compatibility?.map((t) => t._id) || [],
        images: templateToEdit.images || [],
        description: templateToEdit.description || '',
        taxCategoryId: templateToEdit.taxCategoryId?._id || null,
        // Ensure bundleItems is an array for edit mode
        bundleItems: templateToEdit.bundleItems || [],
        deviceId: templateToEdit.deviceId?._id || '',
        requiredParts: templateToEdit.requiredParts || [],
        defaultWarrantyPolicyId: templateToEdit.defaultWarrantyPolicyId?._id || null, // <-- 3. POPULATE FOR EDIT MODE
      });
    } else {
      setFormData(initialFormData);
    }
  }, [templateToEdit, isEditMode, initialFormData]);

  useEffect(() => {}, [formData.images]);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!formData.brandId) {
        setDevicesForManufacturer([]); // Clear devices if no manufacturer is selected
        return;
      }

      setIsDevicesLoading(true);
      try {
        // Call our newly upgraded API with the brandId filter
        const response = await tenantDeviceService.getAll({ brandId: formData.brandId });
        setDevicesForManufacturer(response.data.data);
      } catch (error) {
        console.log(error);
        toast.error('Failed to load devices for this manufacturer.');
      } finally {
        setIsDevicesLoading(false);
      }
    };

    fetchDevices();
  }, [formData.brandId]); // This is the trigger

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChangeOld = (fieldName, value) => setFormData((prev) => ({ ...prev, [fieldName]: value }));
  const handleArrayChange = (fieldName, value) => setFormData((prev) => ({ ...prev, [fieldName]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };
  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [fieldName]: value };
      // If the manufacturer changes, reset the selected device.
      if (fieldName === 'brandId') {
        newState.deviceId = '';
      }
      return newState;
    });
  };

  const handleAddBundleItem = (variant) => {
    // Prevent adding a bundle inside another bundle or adding duplicates
    if (
      variant.templateId?.type === 'bundle' ||
      formData.bundleItems.some((item) => item.productVariantId === variant._id)
    ) {
      return;
    }
    const newItem = {
      productVariantId: variant._id,
      variantName: variant.variantName, // For display purposes in the form
      quantity: 1,
    };
    handleArrayChange('bundleItems', [...formData.bundleItems, newItem]);
  };

  const handleBundleItemQtyChange = (variantId, newQty) => {
    const newItems = formData.bundleItems.map((item) =>
      item.productVariantId === variantId ? { ...item, quantity: Number(newQty) } : item,
    );
    handleArrayChange('bundleItems', newItems);
  };

  const handleRemoveBundleItem = (variantId) => {
    const newItems = formData.bundleItems.filter((item) => item.productVariantId !== variantId);
    handleArrayChange('bundleItems', newItems);
  };

  const handleQuickCreate = async (type, data) => {
    const apiCall = type === 'category' ? tenantCategoryService.create(data) : tenantBrandService.create(data);
    try {
      const res = await toast.promise(apiCall, {
        loading: `Creating new ${type}...`,
        success: `${type} created!`,
        error: `Failed to create ${type}.`,
      });
      if (onDataRefresh) {
        await onDataRefresh();
      }
      if (type === 'category') setFormData((prev) => ({ ...prev, categoryId: res.data.data._id }));
      if (type === 'brand') setFormData((prev) => ({ ...prev, brandId: res.data.data._id }));

      setIsCategoryModalOpen(false);
      setIsBrandModalOpen(false);
    } catch (err) {
      /* handled by toast */
      console.log(err);
    }
  };

  const handleAddRequiredPart = (variant) => {
    // Prevent adding duplicates
    if (formData.requiredParts.some((item) => item.productVariantId === variant._id)) return;
    const newItem = {
      productVariantId: variant._id,
      variantName: variant.variantName, // For display
      quantity: 1,
    };
    handleArrayChange('requiredParts', [...formData.requiredParts, newItem]);
  };

  const handleRequiredPartQtyChange = (variantId, newQty) => {
    const newItems = formData.requiredParts.map((item) =>
      item.productVariantId === variantId ? { ...item, quantity: Number(newQty) } : item,
    );
    handleArrayChange('requiredParts', newItems);
  };

  const handleRemoveRequiredPart = (variantId) => {
    const newItems = formData.requiredParts.filter((item) => item.productVariantId !== variantId);
    handleArrayChange('requiredParts', newItems);
  };

  const assetAccounts = accounts.filter((a) => a.type === 'Asset' && a.subType !== 'Accounts Receivable');
  const revenueAccounts = accounts.filter((a) => a.type === 'Revenue');
  const cogsAccounts = accounts.filter((a) => a.type === 'Expense' && a.subType === 'COGS');

  const serviceCategoryTree = extractCategorySubtreeByName(
    categories,
    formData.type === 'service' ? 'Services' : 'Products',
  );

  if (isEditMode && !templateToEdit.brandId._id) {
    return <Loader2></Loader2>;
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4'>
      {/* Core Details */}

      <Card>
        <CardContent className='p-4 space-y-4'>
          <h4 className='font-semibold text-lg'>Core Details</h4>
          <div>
            <Label htmlFor='baseName'>Template Name</Label>
            <Input id='baseName' name='baseName' value={formData.baseName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor='skuPrefix'>SKU Prefix</Label>
            <Input id='skuPrefix' name='skuPrefix' value={formData.skuPrefix} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>

            <Input
              name='description'
              value={formData.description}
              onChange={handleChange}
              id='description'
              as='textarea'
              showCharCount
              maxLength={500}
              placeholder='Write description...'
            />
          </div>
        </CardContent>
      </Card>

      {/* Type & Price */}
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Product Type</Label>
          <Select onValueChange={(val) => handleSelectChange('type', val)} value={formData.type}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='non-serialized'>Standard</SelectItem>
              <SelectItem value='serialized'>Serialized</SelectItem>
              <SelectItem value='bundle'>Bundle</SelectItem>
              <SelectItem value='service'>Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* --- CASCADING HIERARCHY DROPDOWNS --- */}
      <div className='space-y-4 rounded-lg border border-slate-700 p-4'>
        <h4 className='font-semibold text-white'>Classification</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label>Category {isPhysicalProduct && <span className='text-red-500'>*</span>}</Label>
            <Select
              onValueChange={(val) => handleSelectChange('categoryId', val)}
              value={formData.categoryId}
              // The required attribute is now conditional
              required={isPhysicalProduct}
            >
              <SelectTrigger suffixIcon={PlusCircle} onSuffixIconClick={() => setIsCategoryModalOpen(true)}>
                <SelectValue placeholder='Select Category' />
              </SelectTrigger>
              <SelectContent>
                {/* {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))} */}

                {generateCategoryOptions([serviceCategoryTree])}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Manufacturer / Brand</Label>
            <Select onValueChange={(val) => handleSelectChange('brandId', val)} value={formData.brandId}>
              <SelectTrigger suffixIcon={PlusCircle} onSuffixIconClick={() => setIsBrandModalOpen(true)}>
                <SelectValue placeholder='Select...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem>None (No Brand)</SelectItem>

                {(brands || []).map((m) => (
                  <SelectItem key={m._id} value={m._id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <Label>Device / Model</Label>
            <Select
              onValueChange={(val) => handleSelectChange('deviceId', val)}
              value={formData.deviceId}
              // The dropdown is disabled until a manufacturer is chosen
              disabled={!formData.brandId || isDevicesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isDevicesLoading ? 'Loading devices...' : 'Select manufacturer first'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem>None (All Device)</SelectItem>
                {(devicesForManufacturer || []).map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attribute Set */}
          {formData.type === 'non-serialized' || formData.type === 'serialized' ? (
            <div>
              <Label>Attribute Set</Label>
              <Select
                onValueChange={(val) => handleSelectChange('attributeSetId', val)}
                value={formData.attributeSetId}
              >
                <SelectTrigger>
                  <SelectValue placeholder='None (No Variants)' />
                </SelectTrigger>
                <SelectContent>
                  {(attributeSets || []).map((as) => (
                    <SelectItem key={as._id} value={as._id}>
                      {as.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {formData.type === 'non-serialized' && (
            <div className='flex items-center space-x-2 p-4 border-t border-slate-700'>
              <Checkbox
                id='hasBatches'
                checked={formData.hasBatches}
                onCheckedChange={(checked) => setFormData({ ...formData, hasBatches: checked })}
              />
              <Label htmlFor='hasBatches'>
                Track this product by batches? (For different costs, suppliers, or expiry dates)
              </Label>
            </div>
          )}
        </div>
      </div>

      {formData.type === 'service' && (
        <Card>
          <CardHeader>
            <CardTitle>Required Parts (Bill of Materials)</CardTitle>
            <CardDescription>Link the spare parts that are consumed when this service is performed.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Label>Add spare parts to this service</Label>
            <ProductVariantSearch onProductSelect={handleAddRequiredPart} />
            <div className='mt-4 space-y-2'>
              {formData.requiredParts.length === 0 && (
                <p className='text-center text-sm text-slate-400'>No required parts added yet.</p>
              )}
              {formData.requiredParts.map((item) => (
                <div
                  key={item.productVariantId}
                  className='flex items-center justify-between p-2 bg-slate-800 rounded-md'
                >
                  <span className='text-sm'>{item.variantName}</span>
                  <div className='flex items-center gap-2'>
                    <Label htmlFor={`part-qty-${item.productVariantId}`} className='text-xs'>
                      Qty:
                    </Label>
                    <Input
                      id={`part-qty-${item.productVariantId}`}
                      type='number'
                      min='1'
                      value={item.quantity}
                      onChange={(e) => handleRequiredPartQtyChange(item.productVariantId, e.target.value)}
                      className='h-8 w-20'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveRequiredPart(item.productVariantId)}
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Categorization */}

      {/* --- NEW CONDITIONAL BUNDLE SECTION --- */}
      {formData.type === 'bundle' && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Components</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Label>Add component items to this bundle</Label>
            <ProductVariantSearch onProductSelect={handleAddBundleItem} />
            <div className='mt-4 space-y-2 border-t border-slate-700 pt-4'>
              {formData.bundleItems.length === 0 && (
                <p className='text-center text-sm text-slate-400'>No components added yet.</p>
              )}
              {formData.bundleItems.map((item) => (
                <div
                  key={item.productVariantId}
                  className='flex items-center justify-between p-2 bg-slate-800 rounded-md'
                >
                  <span className='text-sm font-medium'>{item.variantName}</span>
                  <div className='flex items-center gap-2'>
                    <Label htmlFor={`qty-${item.productVariantId}`} className='text-xs'>
                      Qty:
                    </Label>
                    <Input
                      id={`qty-${item.productVariantId}`}
                      type='number'
                      min='1'
                      value={item.quantity}
                      onChange={(e) => handleBundleItemQtyChange(item.productVariantId, e.target.value)}
                      className='h-8 w-20'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveBundleItem(item.productVariantId)}
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* --- END OF NEW SECTION --- */}

      {formData.type !== 'bundle' && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck className='h-5 w-5 text-indigo-500' />
              Post-Sales Configuration
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-5'>
            {/* --- Warranty Selector --- */}
            <div>
              <Label className='block mb-1'>Default Warranty Policy (Optional)</Label>
              <Select
                onValueChange={(val) => setFormData({ ...formData, defaultWarrantyPolicyId: val })}
                value={formData.defaultWarrantyPolicyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select default warranty...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {warrantyPolicies.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} ({p.durationValue} {p.durationUnit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-xs text-muted-foreground mt-1'>
                This warranty will be automatically applied when selling this item.
              </p>
            </div>

            {/* --- Tax Category Selector --- */}
            <div>
              <Label className='mb-1 flex items-center gap-1'>
                <Percent className='w-4 h-4 text-muted-foreground' />
                Tax Category
              </Label>

              <Select
                onValueChange={(val) =>
                  formData.taxCategoryId !== val && setFormData({ ...formData, taxCategoryId: val })
                }
                value={formData.taxCategoryId}
              >
                <SelectTrigger
                  suffixIcon={PlusCircle}
                  onSuffixIconClick={() => alert('Open Quick Create for Tax Category')}
                >
                  <SelectValue placeholder='Select tax category...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem>None (No Tax)</SelectItem>
                  {taxCategories.map((tc) => (
                    <SelectItem key={tc._id} value={tc._id}>
                      {tc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-xs text-muted-foreground mt-1'>
                This category determines what tax rules apply to this item.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financials */}

      <Card>
        <CardContent className='p-4 space-y-4'>
          <h4 className='font-semibold text-lg'>Financials & Stock</h4>
          <div className='grid md:grid-cols-3 gap-4'>
            <div>
              <Label>Default Cost Price</Label>
              <Input name='costPrice' type='number' step='0.01' value={formData.costPrice} onChange={handleChange} />
            </div>
            <div>
              <Label>Default Selling Price</Label>
              <Input
                name='sellingPrice'
                type='number'
                step='0.01'
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Re-Order Level (Alert Qty)</Label>
              <Input name='alertQty' type='number' value={formData.alertQty} onChange={handleChange} required />
            </div>
          </div>
          <div className=' space-y-2 pt-5 border-t border-slate-700 mt-4'>
            <h5 className='text-sm font-medium text-slate-300'>Default Accounting Links</h5>

            <div className='grid md:grid-cols-3 gap-4'>
              <div>
                <Label>Inventory Asset Account</Label>

                <Select
                  onValueChange={(val) => handleSelectChange('assetAccountId', val)}
                  value={formData.assetAccountId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Account' />
                  </SelectTrigger>
                  <SelectContent>
                    {assetAccounts.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sales Revenue Account</Label>
                <Select
                  onValueChange={(val) => handleSelectChange('revenueAccountId', val)}
                  value={formData.revenueAccountId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Account' />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueAccounts.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cost of Goods Sold (COGS) Account</Label>

                <Select
                  onValueChange={(val) => handleSelectChange('cogsAccountId', val)}
                  value={formData.cogsAccountId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Account' />
                  </SelectTrigger>
                  <SelectContent>
                    {cogsAccounts.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images & Compatibility */}

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Marketing Images</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            initialFiles={formData.images && formData.images}
            onUploadComplete={(imgs) => handleArrayChange('images', imgs)}
            getSignatureFunc={getSignatureFunc}
            multiple={true}
          />
        </CardContent>
      </Card>
      {/* Preview section */}

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <CompatibilitySelector
            allTemplates={allTemplates.filter((t) => t._id !== templateToEdit?._id)}
            selectedIds={formData.compatibility}
            onChange={(ids) => handleArrayChange('compatibility', ids)}
          />
        </CardContent>
      </Card>

      <div className='pt-4 flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Define Variants'}
        </Button>
      </div>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title='Create New Category'>
        <CategoryQuickForm
          onSave={(data) => handleQuickCreate('category', data)}
          onCancel={() => setIsCategoryModalOpen(false)}
          categories={categories}
        />
      </Modal>
      <Modal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} title='Create New Brand'>
        <BrandQuickForm
          onSave={(data) => handleQuickCreate('brand', data)}
          onCancel={() => setIsBrandModalOpen(false)}
        />
      </Modal>
    </form>
  );
};
export default ProductTemplateForm;
