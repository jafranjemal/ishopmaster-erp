import { t } from 'i18next';
import { PlusCircle, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Button,
  Card,
  CardContent,
  FilterBar,
  HierarchicalSelect,
  Label,
  Modal,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui-library';
import ProductTemplateForm from '../../components/inventory/ProductTemplateForm';
import ProductTemplateHeader from '../../components/inventory/ProductTemplateHeader';
import ProductTemplateList from '../../components/inventory/ProductTemplateList';
import {
  tenantAccountingService,
  tenantAttributeService,
  tenantBrandService,
  tenantCategoryService,
  tenantProductService,
  tenantQcTemplateService,
  tenantTaxCategoryService,
  tenantUploadService,
  tenantWarrantyPolicyService,
} from '../../services/api';

const ProductTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [prereqData, setPrereqData] = useState({
    brands: [],
    categories: [],
    attributeSets: [],
    accounts: [],
    warrantyPolicies: [],
    taxCategories: [],
    qcTemplates: [],
  });
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [detailedTemplateData, setDetailedTemplateData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    brandId: '',
    categoryId: '',
    taxCategoryId: '',
    type: '',
    isActive: '',
    searchTerm: '',
  });

  const fetchData = useCallback(
    async (overrideFilters = filters) => {
      try {
        setIsLoading(true);
        const params = {
          page: currentPage,
          limit: 15,
          ...overrideFilters, // Send filters to backend
        };

        const [
          templatesRes,
          summaryRes,
          brandsRes,
          categoriesRes,
          attributeSetsRes,
          accountsRes,
          warrantiesRes,
          taxCatRes,
          qcRes,
        ] = await Promise.all([
          tenantProductService.getAllTemplates(params),
          tenantProductService.getSummary(),
          tenantBrandService.getAll(),
          tenantCategoryService.getAll(),
          tenantAttributeService.getAllAttributeSets(),
          tenantAccountingService.getAllAccounts(),
          tenantWarrantyPolicyService.getAll(),
          tenantTaxCategoryService.getAll(),
          tenantQcTemplateService.getAll(),
        ]);

        setTemplates(templatesRes.data.data);
        setPaginationData(templatesRes.data.pagination);
        setSummary(summaryRes.data.data);
        setPrereqData({
          brands: brandsRes.data.data,
          categories: categoriesRes.data.data,
          attributeSets: attributeSetsRes.data.data,
          accounts: accountsRes.data.data,
          warrantyPolicies: warrantiesRes.data.data,
          taxCategories: taxCatRes.data.data,
          qcTemplates: qcRes.data.data,
        });
      } catch (error) {
        console.log(error);
        toast.error('Failed to load product catalog data.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, filters],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = async (template) => {
    setEditingTemplate(template); // Set basic info for modal title
    setIsModalOpen(true);
    setIsDetailLoading(true); // Show a loading state inside the modal
    try {
      // Fetch the full, detailed record for editing
      const response = await tenantProductService.getTemplateById(template._id);
      setDetailedTemplateData(response.data.data);
    } catch (error) {
      toast.error('Failed to load template details for editing.');
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };
  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingTemplate
      ? tenantProductService.updateTemplate(editingTemplate._id, formData)
      : tenantProductService.createTemplate(formData);
    try {
      await toast.promise(apiCall, {
        loading: 'Saving template...',
        success: `Template "${formData.baseName}" saved!`,
        error: (err) => err.response?.data?.error || 'Failed to save.',
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
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantProductService.deleteTemplate(deleteConfirm._id), {
        loading: `Deleting "${deleteConfirm.baseName}"...`,
        success: 'Template deleted.',
        error: (err) => err.response?.data?.error || 'Failed to delete.',
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to page 1
    fetchData();
  };

  const handleClearFilters = () => {
    const cleared = {
      search: '',
      brandId: '',
      categoryId: '',
      type: '',
      isActive: '',
    };
    setFilters(cleared);
    setCurrentPage(1);
    fetchData(cleared);
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Product Catalog</h1>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className='mr-2 h-4 w-4' /> New Product Template
        </Button>
      </div>

      {isLoading && !summary ? (
        <div className='p-8 text-center'>Loading...</div>
      ) : (
        <ProductTemplateHeader summary={summary} />
      )}

      <FilterBar
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <div>
          <Label>Brand</Label>
          <Select value={filters.brandId || ''} onValueChange={(val) => handleFilterChange('brandId', val)}>
            <SelectTrigger>
              <SelectValue placeholder='All Brands' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All</SelectItem>
              {prereqData.brands.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='categoryId'>{t('product_template_form.category_label', 'Category')}</Label>
          {/* Replace the old <Select> with our new reusable component */}
          <HierarchicalSelect
            placeholder='Select a category...'
            options={prereqData.categories || []} // Pass the hierarchical data
            value={filters.categoryId || ''}
            onValueChange={(val) => handleFilterChange('categoryId', val)}
          />
        </div>

        <div>
          <Label>Type</Label>
          <Select value={filters.type || ''} onValueChange={(val) => handleFilterChange('type', val)}>
            <SelectTrigger>
              <SelectValue placeholder='All Types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All</SelectItem>
              <SelectItem value='non-serialized'>Non-Serialized</SelectItem>
              <SelectItem value='serialized'>Serialized</SelectItem>
              <SelectItem value='service'>Service</SelectItem>
              <SelectItem value='bundle'>Bundle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={filters.isActive === '' ? '' : String(filters.isActive)}
            onValueChange={(val) => handleFilterChange('isActive', val === '' ? '' : val === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All</SelectItem>
              <SelectItem value='true'>Active</SelectItem>
              <SelectItem value='false'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p className='p-8 text-center'>Loading templates...</p>
          ) : (
            <ProductTemplateList templates={templates} onEdit={handleOpenEditModal} onDelete={setDeleteConfirm} />
          )}
          {paginationData && <Pagination paginationData={paginationData} onPageChange={setCurrentPage} />}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingTemplate ? 'Edit Product Template' : 'Create New Product Template'}
      >
        {/* <ProductTemplateForm
          templateToEdit={editingTemplate}
          {...prereqData}
          allTemplates={templates} // For compatibility selector
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        /> */}
        <ProductTemplateForm
          warrantyPolicies={prereqData.warrantyPolicies}
          onDataRefresh={fetchData}
          accounts={prereqData.accounts}
          templateToEdit={detailedTemplateData}
          {...prereqData}
          allTemplates={templates}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
          qcTemplates={prereqData.qcTemplates}
          taxCategories={prereqData.taxCategories}
          getSignatureFunc={tenantUploadService.getCloudinarySignature}
        />
      </Modal>

      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title='Confirm Deletion'>
        <div className='text-center'>
          <ShieldAlert className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-4'>
            Are you sure you want to delete template "{deleteConfirm?.baseName}
            "?
          </p>
          <p className='text-sm text-slate-400 mt-2'>
            This action is irreversible and only possible if no variants are linked to it.
          </p>
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          <Button variant='outline' onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Delete Template
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductTemplatesPage;
