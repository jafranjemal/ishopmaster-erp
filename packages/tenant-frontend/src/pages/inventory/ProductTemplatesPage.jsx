// import React, { useState, useEffect, useCallback } from "react";
// import { useTranslation } from "react-i18next";
// import { toast } from "react-hot-toast";
// import { Button, Modal } from "ui-library";
// import { PlusCircle, Loader2 } from "lucide-react";

// // Assuming api.js exports these services
// import {
//   tenantInventoryService,
//   tenantBrandService,
//   tenantCategoryService,
//   tenantAttributeSetService,
//   tenantAccountingService,
// } from "../../services/api";

// import ProductTemplateList from "../../components/inventory/ProductTemplateList";
// import ProductTemplateForm from "../../components/inventory/ProductTemplateForm";

// const ProductTemplatesPage = () => {
//   const { t } = useTranslation();

//   const [templates, setTemplates] = useState([]);
//   const [pageData, setPageData] = useState({
//     brands: [],
//     categories: [],
//     attributeSets: [],
//     accounts: [],
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingTemplate, setEditingTemplate] = useState(null);

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const [
//         templatesRes,
//         brandsRes,
//         categoriesRes,
//         attributeSetsRes,
//         accountsRes,
//       ] = await Promise.all([
//         tenantInventoryService.getAllTemplates(),
//         tenantBrandService.getAll(),
//         tenantCategoryService.getAll(),
//         tenantAttributeSetService.getAll(),
//         tenantAccountingService.getChart(),
//       ]);

//       setTemplates(templatesRes.data.data);
//       setPageData({
//         brands: brandsRes.data.data,
//         categories: categoriesRes.data.data,
//         attributeSets: attributeSetsRes.data.data,
//         accounts: accountsRes.data.data,
//       });
//     } catch (error) {
//       toast.error(
//         t("errors.failed_to_load_product_data", "Failed to load product data.")
//       );
//       console.error("Error fetching page data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [t]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleModalClose = () => {
//     setIsModalOpen(false);
//     setEditingTemplate(null);
//   };

//   const handleSave = async (formData) => {
//     setIsSaving(true);
//     const promise = editingTemplate
//       ? tenantInventoryService.updateTemplate(editingTemplate._id, formData)
//       : tenantInventoryService.createTemplate(formData);

//     try {
//       await toast.promise(promise, {
//         loading: t("common.buttons.saving"),
//         success: editingTemplate
//           ? t(
//               "product_templates_page.update_success",
//               "Template updated successfully!"
//             )
//           : t(
//               "product_templates_page.create_success",
//               "Template created successfully!"
//             ),
//         error: editingTemplate
//           ? t("errors.failed_to_update_template", "Failed to update template.")
//           : t("errors.failed_to_create_template", "Failed to create template."),
//       });
//       fetchData();
//       handleModalClose();
//     } catch (error) {
//       console.error("Save operation failed:", error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async (templateId) => {
//     // In a real app, a confirmation modal should be used here.
//     if (
//       window.confirm(
//         t(
//           "product_templates_page.delete_confirm",
//           "Are you sure you want to delete this template? This cannot be undone."
//         )
//       )
//     ) {
//       const promise = tenantInventoryService.deleteTemplate(templateId);
//       await toast.promise(promise, {
//         loading: t("common.buttons.deleting"),
//         success: t(
//           "product_templates_page.delete_success",
//           "Template deleted."
//         ),
//         error: (err) =>
//           err.response?.data?.error ||
//           t("errors.failed_to_delete_template", "Failed to delete template."),
//       });
//       fetchData();
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">
//           {t("product_templates_page.title", "Products")}
//         </h1>
//         <Button
//           onClick={() => {
//             setEditingTemplate(null);
//             setIsModalOpen(true);
//           }}
//         >
//           <PlusCircle className="mr-2 h-4 w-4" />
//           {t("product_templates_page.create_button", "Create Product")}
//         </Button>
//       </div>

//       <div className="bg-slate-800 rounded-lg">
//         {isLoading ? (
//           <div className="flex justify-center items-center h-64">
//             <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
//           </div>
//         ) : (
//           <ProductTemplateList
//             templates={templates}
//             onEdit={(template) => {
//               setEditingTemplate(template);
//               setIsModalOpen(true);
//             }}
//             onDelete={handleDelete}
//           />
//         )}
//       </div>

//       <Modal
//         isOpen={isModalOpen}
//         onClose={handleModalClose}
//         title={
//           editingTemplate
//             ? t(
//                 "product_templates_page.edit_modal_title",
//                 "Edit Product Template"
//               )
//             : t(
//                 "product_templates_page.create_modal_title",
//                 "Create New Product Template"
//               )
//         }
//       >
//         <ProductTemplateForm
//           templateToEdit={editingTemplate}
//           pageData={pageData}
//           onSave={handleSave}
//           onCancel={handleModalClose}
//           isSaving={isSaving}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default ProductTemplatesPage;

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Loader2, PlusCircle } from "lucide-react";
import {
  tenantProductService,
  tenantBrandService,
  tenantCategoryService,
  tenantAttributeService,
  //tenantAccountingService,
  tenantInventoryService,
  tenantAccountingService,
} from "../../services/api";
import {
  Button,
  Modal,
  Card,
  CardContent,
  Pagination,
  FilterBar,
  Badge,
} from "ui-library";
import ProductTemplateList from "../../components/inventory/ProductTemplateList";
import ProductTemplateForm from "../../components/inventory/ProductTemplateForm";
import { useLocation, useNavigate } from "react-router-dom";
import { t } from "i18next";

// Helper to manage query parameters
const useQuery = () => new URLSearchParams(useLocation().search);
const getQueryObject = (search) =>
  Object.fromEntries(new URLSearchParams(search));

const ProductTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  // const [brands, setBrands] = useState([]);
  // const [categories, setCategories] = useState([]);
  //const [attributeSets, setAttributeSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  //const [accounts, setAccounts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const navigate = useNavigate();
  const query = useQuery();

  // --- STATE MANAGEMENT REFACTOR ---

  const [pagination, setPagination] = useState({});
  const [pageData, setPageData] = useState({
    brands: [],
    categories: [],
    attributeSets: [],
    accounts: [],
  });

  const location = useLocation();
  // Initialize filters from URL query params
  const initialFilter = {
    page: 1,
    limit: 25,
    search: "",
    brandId: "",
    categoryId: "",
    ...getQueryObject(location.search),
  };

  // Single state object to hold all query filters
  const [filters, setFilters] = useState(initialFilter);

  // Sync filters -> URL
  useEffect(() => {
    const queryParams = new URLSearchParams(filters);
    const url = queryParams.toString()
      ? `?${queryParams.toString()}`
      : window.location.pathname;
    navigate(url, { replace: true });
  }, [filters, navigate]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Construct query parameters from the filters state
      const queryParams = new URLSearchParams(filters).toString();
      console.log("Fetching templates with query:", queryParams);
      // Fetch templates with the current filters
      const templatesRes = await tenantInventoryService.getAllTemplates(
        filters
      );

      setTemplates(templatesRes.data.data);
      setPagination(templatesRes.data.pagination);
      if (pageData.brands.length === 0) {
        const [brandsRes, categoriesRes, attributeSetsRes, accountRes] =
          await Promise.all([
            tenantBrandService.getAll(),
            tenantCategoryService.getAll(),
            tenantAttributeService.getAllAttributeSets(),
            tenantAccountingService.getAllAccounts(),
          ]);

        setPageData({
          brands: brandsRes.data.data,
          categories: categoriesRes.data.data,
          attributeSets: attributeSetsRes.data.data,
          accounts: accountRes.data.data,
        });
      }

      //   setTemplates(templatesRes.data.data);
      //   setBrands(brandsRes.data.data);
      //   setCategories(categoriesRes.data.data);
      //   setAttributeSets(attributeSetsRes.data.data);
      //   setAccounts(accountsRes.data.data); // Set accounts state
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load inventory data.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageData.brands.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingTemplate
      ? tenantProductService.updateTemplate(editingTemplate._id, formData)
      : tenantProductService.createTemplate(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving template...",
        success: `Template "${formData.baseName}" saved!`,
        error: (err) => err.response?.data?.error || "Failed to save.",
      });
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.log("Save operation failed:", error);
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  // Delete logic would be added here, similar to other pages

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(
        tenantProductService.deleteTemplate(deleteConfirm._id),
        {
          loading: `Deleting ${deleteConfirm.name}...`,
          success: "Brand deleted successfully.",
          error: (err) =>
            err.response?.data?.error || "Failed to delete brand.",
        }
      );
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.log(error);
      /* error handled by toast */
    }
  };

  // --- HANDLER FUNCTIONS ---
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const filterConfig = [
    { name: "brandId", label: "Brand", options: pageData.brands },
    { name: "categoryId", label: "Category", options: pageData.categories },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* --- NEW, ENHANCED HEADER STRUCTURE --- */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {t("product_templates_page.title", "Product Templates")}
            </h1>
            {/* Display the total count in a styled Badge for better UI */}
            {pagination.total > 0 && (
              <Badge variant="outline">{pagination.total}</Badge>
            )}
          </div>
          <p className="mt-1 text-slate-400">
            {t(
              "product_templates_page.subtitle",
              "Manage your product blueprints and their variations."
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTemplate(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("product_templates_page.create_button", "New Template")}
        </Button>
      </div>
      <FilterBar
        filterConfig={filterConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        onFilterClear={() => {
          // Optional: do something on clear
          console.log("Filters cleared!");
        }}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
            </div>
          ) : (
            <ProductTemplateList
              templates={templates}
              onEdit={(t) => {
                setEditingTemplate(t);
                setIsModalOpen(true);
              }}
              onDelete={setDeleteConfirm}
            />
          )}
          <Pagination {...pagination} onPageChange={handlePageChange} />
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingTemplate
            ? "Edit Product Template"
            : "Create New Product Template"
        }
      >
        <ProductTemplateForm
          templateToEdit={editingTemplate}
          brands={pageData.brands}
          categories={pageData.categories}
          attributeSets={pageData.attributeSets}
          accounts={pageData.accounts} // <-- 4. Pass accounts data to the form
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete Template "{deleteConfirm?.name}"?</p>
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

export default ProductTemplatesPage;
