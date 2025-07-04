import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

import VariantOptionSelector from "../../components/inventory/VariantOptionSelector";
import VariantEditor from "../../components/inventory/VariantEditor";
import { tenantProductService } from "../../services/api";

import {
  Button,
  Card,
  CardContent,
  Modal,
  AlertModal,
  CardHeader,
  CardTitle,
  Badge,
} from "ui-library";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";
import PrintModal from "../../components/inventory/printing/PrintModal";
import PrintConfigModal from "../../components/inventory/printing/PrintConfigModal";

const ProductTemplateDetailPage = () => {
  const { t } = useTranslation();
  const { id: templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [itemsToPrint, setItemsToPrint] = useState([]);
  const [configModalState, setConfigModalState] = useState({
    isOpen: false,
    variant: null,
  });

  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchTemplateAndVariants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [templateRes, variantsRes] = await Promise.all([
        tenantProductService.getTemplateById(templateId),
        tenantProductService.getAllVariantsForTemplate(templateId),
      ]);
      console.log("Template data:", variantsRes.data.data);
      setTemplate(templateRes.data.data);
      setVariants(variantsRes.data.data);
    } catch (err) {
      console.error("Failed to load template or variants:", err);
      toast.error(t("errors.failed_to_load_template"));
      setError(t("errors.could_not_load_data"));
    } finally {
      setIsLoading(false);
    }
  }, [templateId, t]);

  useEffect(() => {
    fetchTemplateAndVariants();
  }, [fetchTemplateAndVariants]);

  const handleManageVariantsClick = () => {
    if (
      !template ||
      !template.attributeSetId ||
      template.attributeSetId.attributes.length === 0
    ) {
      setAlertState({
        isOpen: true,
        title: t("product_detail_page.no_attributes_title"),
        message: t("product_detail_page.no_attributes_message"),
      });
      return;
    }
    setIsAddVariantModalOpen(true);
  };

  const handleSyncVariants = async (selectedOptions) => {
    setIsGenerating(true);
    const promise = tenantProductService.syncVariants(
      templateId,
      selectedOptions
    );

    toast.promise(promise, {
      loading: t("messages.syncing_variants"),
      success: (response) => {
        setVariants(response.data.data);
        setIsAddVariantModalOpen(false);
        return t("messages.variants_synced_success");
      },
      error: (err) =>
        err.response?.data?.error || t("errors.failed_to_sync_variants"),
    });

    try {
      await promise;
    } catch (err) {
      console.error("Variant sync failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveVariants = async (editedVariants) => {
    setIsSaving(true);
    const promise = tenantProductService.bulkUpdateVariants(editedVariants);

    toast.promise(promise, {
      loading: t("messages.saving_variants"),
      success: t("messages.variants_saved_success"),
      error: (err) =>
        err.response?.data?.error || t("errors.failed_to_save_variants"),
    });

    try {
      const response = await promise;
      setVariants(response.data.data);
    } catch (err) {
      console.error("Variant saving failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. IMPLEMENT `onPrint` HANDLER ---
  const handlePrintSingleVariant = (variant) => {
    setConfigModalState({ isOpen: true, variant: variant });
  };
  // --- END OF `onPrint` HANDLER ---

  const handleAddToPrintQueue = (configuredItem) => {
    setItemsToPrint([configuredItem]); // Set the queue with the single, configured item
    setIsPrintModalOpen(true); // Now, open the FINAL print modal
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!template) return <div>{t("messages.template_not_found")}</div>;

  const activeVariants = variants.filter((v) => v.isActive);

  const getInitialState = () => {
    const initialState = {};
    const attributes = template.attributeSetId.attributes;

    // Loop through the official attributes list (the source of truth for keys)
    for (const attribute of attributes) {
      //const attrKey = attribute.key; // e.g., "color"
      const attrName = attribute.name; // e.g., "Color"

      const valuesForThisAttr = new Set();

      // For each official attribute, check all existing variants
      for (const variant of activeVariants) {
        // Check if the variant has a value for this attribute's NAME
        if (variant.attributes && variant.attributes[attrName]) {
          console.log(
            "Processing attribute:",
            attrName,
            "with key:",
            variant.attributes[attrName]
          );
          valuesForThisAttr.add(variant.attributes[attrName]);
        }
      }

      if (valuesForThisAttr.size > 0) {
        initialState[attrName] = Array.from(valuesForThisAttr);
      }
    }
    return initialState;
  };

  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/inventory/products")}
          className="mb-4 text-slate-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("product_detail_page.back_button")}
        </Button>
        <h1 className="text-3xl font-bold">{template.baseName}</h1>
        <p className="text-slate-400">{t("product_detail_page.subtitle")}</p>
      </div>

      {variants.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4 text-slate-400">
              {t("product_detail_page.no_variants_message")}
            </p>
            <Button onClick={handleManageVariantsClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("product_detail_page.generate_initial_variants_button")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {t("product_detail_page.manage_variants_title")}
                  <Badge variant="outline">
                    {t("product_detail_page.variant_count", {
                      count: variants.length,
                    })}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {t("product_detail_page.active_variant_count", {
                    count: activeVariants.length,
                  })}{" "}
                  out of {template?.attributeSetId?.attributes?.length} total.{" "}
                </p>
                {template.attributeSetId &&
                  template.attributeSetId.attributes.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-slate-400">
                        {t("product_detail_page.varies_by", "Varies by:")}
                      </span>
                      {template.attributeSetId.attributes.map(
                        (attr) =>
                          attr.values &&
                          attr.values.length > 0 &&
                          getInitialState()[attr.name]?.length > 0 && (
                            <Badge key={attr._id} variant="outline">
                              {attr.name}
                            </Badge>
                          )
                      )}
                    </div>
                  )}
              </div>
              <Button onClick={handleManageVariantsClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("product_detail_page.add_variant_button")}
              </Button>
            </div>
          </CardHeader>
          <VariantEditor
            variants={variants}
            onSave={handleSaveVariants}
            isSaving={isSaving}
            onPrint={handlePrintSingleVariant}
          />
        </div>
      )}

      {/* The Configuration Modal */}
      <PrintConfigModal
        isOpen={configModalState.isOpen}
        onClose={() => setConfigModalState({ isOpen: false, variant: null })}
        variant={configModalState.variant}
        onConfirm={handleAddToPrintQueue}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        itemsToPrint={itemsToPrint}
      />

      <Modal
        isOpen={isAddVariantModalOpen}
        onClose={() => setIsAddVariantModalOpen(false)}
        title={t("product_detail_page.manage_variant_options_title")}
      >
        {template && template.attributeSetId && (
          <VariantOptionSelector
            attributes={template.attributeSetId.attributes}
            existingVariants={variants}
            onGenerate={handleSyncVariants}
            isGenerating={isGenerating}
          />
        )}
      </Modal>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ isOpen: false, title: "", message: "" })}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
};

export default ProductTemplateDetailPage;
