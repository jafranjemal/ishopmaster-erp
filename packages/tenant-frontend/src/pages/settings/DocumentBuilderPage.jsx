import { ArrowLeft, LoaderCircle, Printer, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Button } from 'ui-library';
import { v4 as uuidv4 } from 'uuid';
import BandedCanvas from '../../components/settings/documents/BandedCanvas';
import PropertiesPanel from '../../components/settings/documents/PropertiesPanel';
import Toolbox from '../../components/settings/documents/Toolbox';
import PrintModal from '../../components/shared/PrintModal';
import { tenantDocumentTemplateService } from '../../services/api';

const DocumentBuilderPage = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantDocumentTemplateService.getById(id);
      // Ensure bands exist
      const templateData = res.data.data;
      const bands = [
        'reportHeaderElements',
        'pageHeaderElements',
        'detailElements',
        'pageFooterElements',
        'reportFooterElements',
      ];

      bands.forEach((band) => {
        if (!templateData[band]) templateData[band] = [];
      });

      setTemplate(templateData);
    } catch (error) {
      toast.error('Failed to load document template');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateElement = (bandName, elementId, newAttrs) => {
    setTemplate((prev) => ({
      ...prev,
      [bandName]: prev[bandName].map((el) => (el.id === elementId ? { ...el, ...newAttrs } : el)),
    }));
  };

  const handleAddElement = (bandName, componentData, position) => {
    const newElement = {
      id: uuidv4(),
      type: componentData.type,
      position: { x: position.x, y: position.y },
      dimensions: componentData.defaultSize || { width: 100, height: 30 },
      style: {
        fontSize: 12,
        fontFamily: 'Helvetica',
        color: '#000000',
        textAlign: 'left',
        backgroundColor: 'transparent',
      },
      content: {
        staticText: componentData.name,
        dataKey: componentData.dataKey || null,
      },
      ...(componentData.type === 'table' && {
        tableContent: {
          columns: [
            { header: 'Item', dataKey: 'name', width: 40 },
            { header: 'Qty', dataKey: 'quantity', width: 20 },
            { header: 'Price', dataKey: 'price', width: 40 },
          ],
        },
      }),
    };

    setTemplate((prev) => ({
      ...prev,
      [bandName]: [...prev[bandName], newElement],
    }));
  };

  const handleDeleteElement = useCallback(() => {
    if (!selectedId) return;

    setTemplate((prev) => {
      const newTemplate = { ...prev };
      let found = false;
      for (const bandName in newTemplate) {
        if (Array.isArray(newTemplate[bandName])) {
          const originalLength = newTemplate[bandName].length;
          newTemplate[bandName] = newTemplate[bandName].filter((el) => el.id !== selectedId);
          if (newTemplate[bandName].length < originalLength) {
            found = true;
            break;
          }
        }
      }
      return newTemplate;
    });
    setSelectedId(null); // Deselect after deleting
  }, [selectedId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await tenantDocumentTemplateService.update(id, template);
      toast.success('Template saved successfully!');
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  if (isLoading)
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoaderCircle className='h-12 w-12 animate-spin text-indigo-600' />
      </div>
    );

  if (!template)
    return (
      <div className='p-8 text-center'>
        <p className='text-red-500 mb-4'>Template data could not be loaded</p>
        <Button as={Link} to='/settings/document-templates'>
          Back to Templates
        </Button>
      </div>
    );

  const selectedElement = Object.entries(template)
    .filter(([key]) => key.endsWith('Elements'))
    .flatMap(([, elements]) => elements)
    .find((el) => el.id === selectedId);

  return (
    <>
      <div className='flex flex-col h-screen '>
        <header className='bg-indigo-700 text-white p-4 shadow-lg'>
          <div className='max-w-7xl mx-auto flex justify-between items-center'>
            <Link to='/settings/document-templates' className='flex items-center hover:underline'>
              <ArrowLeft className='h-5 w-5 mr-2' />
              Back to Templates
            </Link>

            <div className='text-center'>
              <h1 className='text-xl font-bold'>{template.name}</h1>
              <p className='text-indigo-200 text-sm'>{template.documentType} Template</p>
            </div>

            <div className='flex gap-3'>
              <Button variant='secondary' onClick={handlePrint} className='bg-white text-indigo-700 hover:bg-indigo-50'>
                <Printer className='h-4 w-4 mr-2' /> Print/Download
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className='bg-green-600 hover:bg-green-700'>
                {isSaving ? <LoaderCircle className='h-4 w-4 mr-2 animate-spin' /> : <Save className='h-4 w-4 mr-2' />}
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </header>

        <div className='flex-grow grid grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full'>
          <div className='col-span-2'>
            <Toolbox documentType={template.documentType} />
          </div>

          <div className='col-span-7 bg-white rounded-xl shadow-lg p-4 border border-gray-200'>
            <BandedCanvas
              template={template}
              onAddElement={handleAddElement}
              onSelect={setSelectedId}
              onChange={handleUpdateElement}
              onDelete={handleDeleteElement}
              selectedId={selectedId}
            />
          </div>

          <div className='col-span-3'>
            <PropertiesPanel
              element={selectedElement}
              onUpdate={(updatedEl) => {
                const band = Object.entries(template).find(
                  ([key, elements]) => Array.isArray(elements) && elements.some((e) => e.id === updatedEl.id),
                )?.[0];

                if (band) handleUpdateElement(band, updatedEl.id, updatedEl);
              }}
              onDelete={handleDeleteElement}
            />
          </div>
        </div>

        {showPrintModal && <PrintModal template={template} onClose={() => setShowPrintModal(false)} />}
      </div>
    </>
  );
};

export default DocumentBuilderPage;
