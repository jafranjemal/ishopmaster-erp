import { ArrowLeft, Eye, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Modal } from 'ui-library';
import { tenantLabelTemplateService, tenantPrintService } from '../../services/api';

import LabelCanvas from '../../components/settings/printing/LabelCanvas_old';

import A4Preview from '../../components/settings/printing/A4Preview';
import LayoutMetadataEditor from '../../components/settings/printing/LayoutMetadataEditor';
import PropertiesPanel from '../../components/settings/printing/PropertiesPanel';
import RollPreview from '../../components/settings/printing/RollPreview';
import Toolbox from '../../components/settings/printing/Toolbox';
import useLabelTemplate from '../../hooks/useLabelTemplate';

const LabelDesignerPage = () => {
  const location = useLocation();
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const isNew = location.pathname === '/settings/printing/new';

  const [template, updateTemplateProperty, setRawTemplate] = useLabelTemplate(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [tempPreview, setTempTemplate] = useState(null);

  const handleGeneratePreview = async () => {
    if (!template) return;
    setIsPreviewLoading(true);
    try {
      const response = await tenantPrintService.generateLabelPreview(template);
      setPreviewHtml(response.data);
    } catch (error) {
      toast.error('Failed to generate preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrInitTemplate = async () => {
      setIsLoading(true);
      try {
        if (isNew) {
          // For a new template, initialize with default data using the raw setter.
          setRawTemplate({
            name: 'Untitled Label Template',
            paperType: 'sheet',
            paperSize: 'A4',
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
        } else {
          // For an existing template, fetch from API and load it using the raw setter.
          const response = await tenantLabelTemplateService.getById(templateId);
          setRawTemplate(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load label template.');
        navigate('/settings/printing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrInitTemplate();
  }, [isNew, templateId, navigate, setRawTemplate]);

  const handleSaveTemplate = async () => {
    if (!template) return;
    setIsSaving(true);
    const apiCall = isNew
      ? tenantLabelTemplateService.create(template)
      : tenantLabelTemplateService.update(templateId, template);

    try {
      const response = await toast.promise(apiCall, {
        loading: 'Saving template...',
        success: 'Template saved successfully!',
        error: (err) => err?.response?.data?.error || 'Failed to save template.',
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
  const handleUpdate = (field, value, elementId = null) => {
    updateTemplateProperty(field, value, elementId);
  };

  const updateTemplateField = (elementId, field, value) => {
    updateTemplateProperty(elementId, field, value);
  };

  const updateContent = (newContent) => {
    setRawTemplate((prev) => (prev ? { ...prev, content: newContent } : null));
  };

  const handleDeleteElement = (elementId) => {
    if (!elementId || !template) return;
    const newContent = template.content.filter((el) => el.id !== elementId);
    handleUpdate('content', newContent); // Update the whole content array
    setSelectedElementId(null);
  };

  const handleClearAllElements = () => {
    if (window.confirm('Are you sure you want to remove all elements?')) {
      handleUpdate('content', []);
      setSelectedElementId(null);
    }
  };

  const updateElementProperty = (property, value) => {
    if (!selectedElementId || !template) return;
    const updatedContent = template.content.map((el) =>
      el.id === selectedElementId ? { ...el, [property]: value } : el,
    );
    updateContent(updatedContent);
  };

  const selectedElement = template?.content.find((el) => el.id === selectedElementId);

  if (isLoading) return <div className='p-8 text-center'>Loading Label Designer...</div>;
  if (!template) return <div className='p-8 text-center text-red-400'>Could not load template data.</div>;

  return (
    <>
      <div className='flex flex-col h-full max-h-screen bg-slate-900 text-white'>
        <header className='flex-shrink-0 flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700'>
          <div className='flex items-center gap-4'>
            <Link to='/settings/printing' className='p-2 rounded-md hover:bg-slate-700'>
              <ArrowLeft />
            </Link>
            <Input
              value={template.name}
              onChange={(e) => updateTemplateField('name', e.target.value)}
              className='bg-transparent text-xl font-bold'
            />
          </div>

          <div>
            <Button variant='outline' onClick={handleGeneratePreview} disabled={isPreviewLoading}>
              <Eye className='h-4 w-4 mr-2' />
              {isPreviewLoading ? 'Generating...' : 'Generate Preview'}
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              <Save className='h-4 w-4 mr-2' />
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </header>

        <div className='flex-grow grid grid-cols-12 gap-4 p-4 overflow-hidden'>
          <div className='col-span-3 bg-slate-800 rounded-lg p-4 overflow-y-auto'>
            <h3 className='font-semibold mb-4 text-lg'>Properties Panel</h3>
            <PropertiesPanel
              selectedElement={selectedElement}
              onUpdate={(field, value) => handleUpdate(field, value, selectedElementId)}
              labelWidth={template.labelWidth}
              labelHeight={template.labelHeight}
            />
          </div>

          <div className='col-span-6 bg-black rounded-lg flex items-center justify-center p-4 overflow-auto'>
            <LabelCanvas
              template={template}
              width={template.labelWidth}
              height={template.labelHeight}
              content={template.content}
              onContentChange={(newContent) => handleUpdate('content', newContent)}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onDeleteElement={handleDeleteElement}
              onClearAll={handleClearAllElements}
              templateMeta={template} // Pass full metadata for preview/layout accuracy
            />
          </div>

          <div className='col-span-3 bg-slate-800 rounded-lg p-4 overflow-y-auto'>
            <h3 className='font-semibold mb-4 text-lg'>Toolbox</h3>
            <Toolbox />

            {tempPreview && <div dangerouslySetInnerHTML={{ __html: tempPreview }} />}
          </div>
        </div>

        {/* --- 3. RENDER THE PREVIEW SECTION --- */}
        <div className='flex-shrink-0 p-4 border-t border-slate-700'>
          <LayoutMetadataEditor template={template} onUpdateField={(field, value) => handleUpdate(field, value)} />

          <Modal
            isOpen={!!previewHtml}
            onClose={() => setPreviewHtml(null)}
            title='Print Preview'
            description='This is a scaled representation of the final printed output.'
            className='max-w-4xl' // Use a wider modal for previews
          >
            <div className='max-h-[70vh] overflow-y-auto bg-slate-600 p-8 rounded-md'>
              {template.paperType === 'sheet' && <A4Preview template={template} singleLabelHtml={previewHtml} />}
              {template.paperType === 'roll' && <RollPreview template={template} singleLabelHtml={previewHtml} />}
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default LabelDesignerPage;
