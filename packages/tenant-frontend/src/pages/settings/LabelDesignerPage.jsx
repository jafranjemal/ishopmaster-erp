import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  tenantLabelTemplateService,
  tenantPrintService,
} from "../../services/api";
import { Button, Input } from "ui-library";
import { Save, ArrowLeft, Eye } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LabelCanvas from "../../components/settings/printing/LabelCanvas";
import Toolbox from "../../components/settings/printing/Toolbox";
import PropertiesPanel from "../../components/settings/printing/PropertiesPanel";
import LayoutMetadataEditor from "../../components/settings/printing/LayoutMetadataEditor";
import RollPreview from "../../components/settings/printing/RollPreview";
import A4Preview from "../../components/settings/printing/A4Preview";

const LabelDesignerPage = () => {
  const location = useLocation();
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const isNew = location.pathname === "/settings/printing/new";

  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // --- 2. ADD NEW HANDLER FOR GENERATING THE PREVIEW ---
  const handleGeneratePreview = async () => {
    if (!template) return;
    setIsPreviewLoading(true);
    try {
      // Create a single dummy item for the preview
      const dummyItem = {
        variantName: "Sample Product Name",
        sku: "SKU12345",
        sellingPrice: 19999.99,
        companyName: "JJSOFT GLOBAL",
      };

      const response = await tenantPrintService.generateLabels(
        templateId,
        [dummyItem],
        {
          isPreview: true,
        }
      );

      console.log("genearte response ", response);
      // We just need the HTML for a single label
      const singleLabelMatch = response.data.match(
        /(<div class="label"[\s\S]*?<\/div>)/ // Match the full label div
      );
      if (singleLabelMatch && singleLabelMatch[1]) {
        setPreviewHtml(singleLabelMatch[1]);
      }
    } catch (error) {
      toast.error("Failed to generate preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  };
  useEffect(() => {
    const fetchOrInitTemplate = async () => {
      setIsLoading(true);
      if (isNew) {
        setTemplate({
          name: "Untitled Label Template",
          paperType: "sheet",
          paperSize: "A4",
          labelWidth: 50,
          labelHeight: 25,
          horizontalGap: 5,
          verticalGap: 5,
          marginTop: 10,
          marginLeft: 10,
          columns: 4,
          rows: 11,
          content: [],
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await tenantLabelTemplateService.getById(templateId);
        setTemplate(response.data.data);
      } catch (error) {
        toast.error("Failed to load label template.");
        navigate("/settings/printing");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrInitTemplate();
  }, [isNew, templateId, navigate]);

  const handleSaveTemplate = async () => {
    if (!template) return;
    setIsSaving(true);

    const apiCall = isNew
      ? tenantLabelTemplateService.create(template)
      : tenantLabelTemplateService.update(templateId, template);

    try {
      const response = await toast.promise(apiCall, {
        loading: "Saving template...",
        success: "Template saved successfully!",
        error: (err) =>
          err?.response?.data?.error || "Failed to save template.",
      });

      if (isNew && response.data?.success) {
        navigate(`/settings/printing/${response.data.data._id}`, {
          replace: true,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateTemplateField = (field, value) => {
    setTemplate((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateContent = (newContent) => {
    setTemplate((prev) => (prev ? { ...prev, content: newContent } : null));
  };

  const selectedElement = template?.content.find(
    (el) => el.id === selectedElementId
  );

  const handleDeleteElement = (elementId) => {
    if (!elementId) return;
    updateContent(template.content.filter((el) => el.id !== elementId));
    setSelectedElementId(null);
  };

  const handleClearAllElements = () => {
    if (window.confirm("Are you sure you want to remove all elements?")) {
      updateContent([]);
      setSelectedElementId(null);
    }
  };

  const updateElementProperty = (property, value) => {
    if (!selectedElementId || !template) return;
    const updatedContent = template.content.map((el) =>
      el.id === selectedElementId ? { ...el, [property]: value } : el
    );
    updateContent(updatedContent);
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading Label Designer...</div>;

  if (!template)
    return (
      <div className="p-8 text-center text-red-400">
        Could not load template data.
      </div>
    );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full max-h-screen bg-slate-900 text-white">
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <Link
              to="/settings/printing"
              className="p-2 rounded-md hover:bg-slate-700"
            >
              <ArrowLeft />
            </Link>
            <Input
              value={template.name}
              onChange={(e) => updateTemplateField("name", e.target.value)}
              className="bg-transparent text-xl font-bold"
            />
          </div>

          <div>
            <Button
              variant="outline"
              onClick={handleGeneratePreview}
              disabled={isPreviewLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewLoading ? "Generating..." : "Generate Preview"}
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </header>

        <div className="flex-grow grid grid-cols-12 gap-4 p-4 overflow-hidden">
          <div className="col-span-3 bg-slate-800 rounded-lg p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-lg">Properties Panel</h3>
            <PropertiesPanel
              selectedElement={selectedElement}
              onUpdate={updateElementProperty}
            />
          </div>

          <div className="col-span-6 bg-black rounded-lg flex items-center justify-center p-4 overflow-auto">
            <LabelCanvas
              width={template.labelWidth}
              height={template.labelHeight}
              content={template.content}
              onContentChange={updateContent}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onDeleteElement={handleDeleteElement}
              onClearAll={handleClearAllElements}
              templateMeta={template} // Pass full metadata for preview/layout accuracy
            />
          </div>

          <div className="col-span-3 bg-slate-800 rounded-lg p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-lg">Toolbox</h3>
            <Toolbox />
          </div>
        </div>

        {JSON.stringify(previewHtml)}
        {/* --- 3. RENDER THE PREVIEW SECTION --- */}
        <div className="flex-shrink-0 p-4 border-t border-slate-700">
          <LayoutMetadataEditor
            template={template}
            onUpdateField={updateTemplateField}
          />

          {previewHtml && template.paperType === "sheet" && (
            <div className="mt-8">
              <A4Preview template={template} singleLabelHtml={previewHtml} />
            </div>
          )}
          {previewHtml && template.paperType === "roll" && (
            <div className="mt-8">
              <RollPreview template={template} singleLabelHtml={previewHtml} />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default LabelDesignerPage;
