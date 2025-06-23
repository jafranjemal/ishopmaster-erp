// import React, { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { Input, Label, Button } from "ui-library";

// const ProductTemplateForm = ({
//   templateToEdit,
//   pageData,
//   onSave,
//   onCancel,
//   isSaving,
// }) => {
//   const { t } = useTranslation();

//   console.log("pageData:", pageData);

//   const getInitialFormData = () => ({
//     baseName: "",
//     sku: "",
//     productType: "serialized",
//     brandId: "",
//     categoryId: "",
//     attributeSetId: "",
//     costPrice: 0,
//     sellingPrice: 0,
//     assetAccountId: "",
//     revenueAccountId: "",
//     cogsAccountId: "",
//   });

//   const [formData, setFormData] = useState(getInitialFormData());

//   useEffect(() => {
//     if (templateToEdit) {
//       setFormData({
//         baseName: templateToEdit.baseName || "",
//         sku: templateToEdit.sku || "",
//         productType: templateToEdit.productType || "serialized",
//         brandId: templateToEdit.brandId?._id || "",
//         categoryId: templateToEdit.categoryId?._id || "",
//         attributeSetId: templateToEdit.attributeSetId?._id || "",
//         costPrice: templateToEdit.costPrice || 0,
//         sellingPrice: templateToEdit.sellingPrice || 0,

//         assetAccountId: templateToEdit.assetAccountId || "",
//         revenueAccountId: templateToEdit.revenueAccountId || "",
//         cogsAccountId: templateToEdit.cogsAccountId || "",
//       });
//     } else {
//       setFormData(getInitialFormData());
//     }
//   }, [templateToEdit]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* ➡️ Step 5c: Add the new accounting dropdowns JSX after the price fields */}
//       <div className="border-t border-slate-700 pt-6">
//         <h4 className="text-md font-semibold mb-4 text-slate-200">
//           {t("product_template_form.accounting_title", "Accounting Links")}
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <Label htmlFor="assetAccountId">
//               {t(
//                 "product_template_form.asset_account_label",
//                 "Inventory Asset Account"
//               )}
//             </Label>
//             <select
//               id="assetAccountId"
//               name="assetAccountId"
//               value={formData.assetAccountId}
//               onChange={handleChange}
//               required
//               className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               <option value="">
//                 {t(
//                   "product_template_form.select_account",
//                   "Select an account..."
//                 )}
//               </option>
//               {pageData.accounts
//                 .filter((a) => a.type === "Asset")
//                 .map((acc) => (
//                   <option key={acc._id} value={acc._id}>
//                     {acc.name}
//                   </option>
//                 ))}
//             </select>
//           </div>
//           <div>
//             <Label htmlFor="revenueAccountId">
//               {t(
//                 "product_template_form.revenue_account_label",
//                 "Sales Revenue Account"
//               )}
//             </Label>
//             <select
//               id="revenueAccountId"
//               name="revenueAccountId"
//               value={formData.revenueAccountId}
//               onChange={handleChange}
//               required
//               className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               <option value="">
//                 {t(
//                   "product_template_form.select_account",
//                   "Select an account..."
//                 )}
//               </option>
//               {pageData.accounts
//                 .filter((a) => a.type === "Revenue")
//                 .map((acc) => (
//                   <option key={acc._id} value={acc._id}>
//                     {acc.name}
//                   </option>
//                 ))}
//             </select>
//           </div>
//           <div>
//             <Label htmlFor="cogsAccountId">
//               {t("product_template_form.cogs_account_label", "COGS Account")}
//             </Label>
//             <select
//               id="cogsAccountId"
//               name="cogsAccountId"
//               value={formData.cogsAccountId}
//               onChange={handleChange}
//               required
//               className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               <option value="">
//                 {t(
//                   "product_template_form.select_account",
//                   "Select an account..."
//                 )}
//               </option>
//               {pageData.accounts
//                 .filter((a) => a.type === "Expense")
//                 .map((acc) => (
//                   <option key={acc._id} value={acc._id}>
//                     {acc.name}
//                   </option>
//                 ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <Label htmlFor="baseName">
//             {t("product_template_form.name_label", "Template Name")}
//           </Label>
//           <Input
//             id="baseName"
//             name="baseName"
//             value={formData.baseName}
//             onChange={handleChange}
//             required
//             placeholder="e.g., iPhone 15 Pro Case"
//           />
//         </div>
//         <div>
//           <Label htmlFor="sku">
//             {t("product_template_form.sku_label", "Base SKU")}
//           </Label>
//           <Input
//             id="sku"
//             name="sku"
//             value={formData.sku}
//             onChange={handleChange}
//             placeholder="e.g., IPH15-CASE"
//           />
//         </div>
//       </div>

//       <div>
//         <Label htmlFor="productType">
//           {t("product_template_form.type_label", "Product Type")}
//         </Label>
//         <select
//           id="productType"
//           name="productType"
//           value={formData.productType}
//           onChange={handleChange}
//           className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           <option value="serialized">
//             {t("product_template_form.type_serialized", "Serialized")}
//           </option>
//           <option value="non_serialized">
//             {t("product_template_form.type_non_serialized", "Non-Serialized")}
//           </option>
//           <option value="service">
//             {t("product_template_form.type_service", "Service")}
//           </option>
//         </select>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <div>
//           <Label htmlFor="brandId">
//             {t("product_template_form.brand_label", "Brand")}
//           </Label>
//           <select
//             id="brandId"
//             name="brandId"
//             value={formData.brandId}
//             onChange={handleChange}
//             className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="">
//               {t("product_template_form.select_brand", "Select a brand...")}
//             </option>
//             {pageData.brands.map((brand) => (
//               <option key={brand._id} value={brand._id}>
//                 {brand.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <Label htmlFor="categoryId">
//             {t("product_template_form.category_label", "Category")}
//           </Label>
//           <select
//             id="categoryId"
//             name="categoryId"
//             value={formData.categoryId}
//             onChange={handleChange}
//             className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="">
//               {t(
//                 "product_template_form.select_category",
//                 "Select a category..."
//               )}
//             </option>
//             {pageData.categories.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <Label htmlFor="attributeSetId">
//             {t("product_template_form.attribute_set_label", "Attribute Set")}
//           </Label>
//           <select
//             id="attributeSetId"
//             name="attributeSetId"
//             value={formData.attributeSetId}
//             onChange={handleChange}
//             className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="">
//               {t(
//                 "product_template_form.select_attribute_set",
//                 "Select an attribute set..."
//               )}
//             </option>
//             {pageData.attributeSets.map((as) => (
//               <option key={as._id} value={as._id}>
//                 {as.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="pt-6 flex justify-end space-x-4">
//         <Button type="button" variant="outline" onClick={onCancel}>
//           {t("common.buttons.cancel")}
//         </Button>
//         <Button type="submit" disabled={isSaving}>
//           {isSaving ? t("common.buttons.saving") : t("common.buttons.save")}
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default ProductTemplateForm;

import React, { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent } from "ui-library";
import CompatibilitySelector from "./CompatibilitySelector";
import ImageUploader from "./ImageUploader";
import { t } from "i18next";

const PRODUCT_TYPES = ["non-serialized", "serialized", "service", "bundle"];

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
}) => {
  const initialFormData = {
    baseName: "",
    skuPrefix: "",
    type: "non-serialized",
    brandId: "",
    categoryId: "",
    attributeSetId: "",
    costPrice: 0,
    sellingPrice: 0,
    assetAccountId: "",
    revenueAccountId: "",
    cogsAccountId: "",
    compatibility: [],
    images: [],
  };
  const [formData, setFormData] = useState(initialFormData);
  const isEditMode = Boolean(templateToEdit);

  useEffect(() => {
    if (isEditMode && templateToEdit) {
      setFormData({
        baseName: templateToEdit.baseName || "",
        skuPrefix: templateToEdit.skuPrefix || "",
        type: templateToEdit.type || "non-serialized",
        brandId: templateToEdit.brandId?._id || "",
        categoryId: templateToEdit.categoryId?._id || "",
        attributeSetId: templateToEdit.attributeSetId?._id || "",
        costPrice: templateToEdit.costPrice || 0,
        sellingPrice: templateToEdit.sellingPrice || 0,
        assetAccountId: templateToEdit.assetAccountId || "",
        revenueAccountId: templateToEdit.revenueAccountId || "",
        cogsAccountId: templateToEdit.cogsAccountId || "",
        compatibility: templateToEdit.compatibility || [],
        images: templateToEdit.images || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [templateToEdit, isEditMode]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleArrayChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4"
    >
      {/* Core Details */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold">Core Details</h4>
          <div>
            <Label>Template Name</Label>
            <Input
              name="baseName"
              value={formData.baseName}
              onChange={handleChange}
              required
              placeholder="e.g., iPhone 15 Pro Case"
            />
          </div>
          <div>
            <Label>SKU Prefix (Optional)</Label>
            <Input
              name="skuPrefix"
              value={formData.skuPrefix}
              onChange={handleChange}
              placeholder="e.g., IPH15-CASE"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categorization */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold">Categorization & Type</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Brand</Label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">
                  {t("product_template_form.select_brand", "Select a brand...")}
                </option>

                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Category</Label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>
                {" "}
                {t("product_template_form.type_label", "Product Type")}
              </Label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="capitalize w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Attribute Set</Label>
              <select
                name="attributeSetId"
                value={formData.attributeSetId}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (No Variants)</option>
                {attributeSets.map((as) => (
                  <option key={as._id} value={as._id}>
                    {as.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financials */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold">Financial Defaults</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Default Cost Price</Label>
              <Input
                name="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label>Default Selling Price</Label>
              <Input
                name="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6">
            <h4 className="text-md font-semibold mb-4 text-slate-200">
              {t("product_template_form.accounting_title", "Accounting Links")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="assetAccountId">
                  {t(
                    "product_template_form.asset_account_label",
                    "Inventory Asset Account"
                  )}
                </Label>
                <select
                  id="assetAccountId"
                  name="assetAccountId"
                  value={formData.assetAccountId}
                  onChange={handleChange}
                  required
                  className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">
                    {t(
                      "product_template_form.select_account",
                      "Select an account..."
                    )}
                  </option>
                  {accounts
                    .filter((a) => a.type === "Asset")
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <Label htmlFor="revenueAccountId">
                  {t(
                    "product_template_form.revenue_account_label",
                    "Sales Revenue Account"
                  )}
                </Label>
                <select
                  id="revenueAccountId"
                  name="revenueAccountId"
                  value={formData.revenueAccountId}
                  onChange={handleChange}
                  required
                  className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">
                    {t(
                      "product_template_form.select_account",
                      "Select an account..."
                    )}
                  </option>
                  {accounts
                    .filter((a) => a.type === "Revenue")
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label htmlFor="cogsAccountId">
                  {t(
                    "product_template_form.cogs_account_label",
                    "COGS Account"
                  )}
                </Label>
                <select
                  id="cogsAccountId"
                  name="cogsAccountId"
                  value={formData.cogsAccountId}
                  onChange={handleChange}
                  required
                  className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">
                    {t(
                      "product_template_form.select_account",
                      "Select an account..."
                    )}
                  </option>
                  {accounts
                    .filter((a) => a.type === "Expense")
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <Label>Inventory Asset Account</Label>
            <select
              name="assetAccountId"
              value={formData.assetAccountId}
              onChange={handleChange}
              className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Account</option>
              {accounts
                .filter((a) => a.type === "Asset")
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Image Uploader */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold">Marketing Images</h4>
          <ImageUploader
            images={formData.images}
            onChange={(newImages) => handleArrayChange("images", newImages)}
          />
        </CardContent>
      </Card>

      {/* Compatibility */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold">Compatibility</h4>
          <CompatibilitySelector
            allTemplates={allTemplates}
            selectedIds={formData.compatibility}
            onChange={(newIds) => handleArrayChange("compatibility", newIds)}
          />
        </CardContent>
      </Card>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save & Define Variants"}
        </Button>
      </div>
    </form>
  );
};
export default ProductTemplateForm;
