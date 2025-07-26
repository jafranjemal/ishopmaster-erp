import { ArrowLeft, LayoutGrid, LoaderCircle, Printer, Save, Settings } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Layer, Rect, Stage, Transformer } from 'react-konva';
import { Link, useParams } from 'react-router-dom';
import { Button, Tabs, TabsList, TabsTrigger } from 'ui-library';
import { v4 as uuidv4 } from 'uuid';

import BackgroundImageUpload from '../../components/settings/documents/BackgroundImageUpload';
import DocumentsPropertiesPanel from '../../components/settings/documents/DocumentsPropertiesPanel';
import ElementRenderer from '../../components/settings/documents/ElementRenderer';
import Toolbox from '../../components/settings/documents/Toolbox';
import { tenantDocumentTemplateService } from '../../services/api';

// Paper dimensions in pixels (A4 at 96 DPI)
const PAPER_SIZES = {
  A4: { width: 794, height: 1123 }, // 210mm x 297mm
  Letter: { width: 816, height: 1056 }, // 215.9mm x 279.4mm
  Legal: { width: 816, height: 1344 }, // 215.9mm x 355.6mm
};

const DocumentBuilderPage = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundConfig, setBackgroundConfig] = useState({
    image: null,
    opacity: 0.5,
    visible: true,
    includeInPrint: false,
  });
  const [groupedElements, setGroupedElements] = useState([]);
  const [showPrintArea, setShowPrintArea] = useState(true);
  const [printWithBackground, setPrintWithBackground] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [pageSettings, setPageSettings] = useState({
    size: 'A4',
    orientation: 'portrait',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  });

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate paper dimensions
  const paperSize = PAPER_SIZES[pageSettings.size];
  const stageWidth = pageSettings.orientation === 'portrait' ? paperSize.width : paperSize.height;
  const stageHeight = pageSettings.orientation === 'portrait' ? paperSize.height : paperSize.width;

  // Load template data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantDocumentTemplateService.getById(id);
      const fetchedTemplate = res.data.data;
      setTemplate(fetchedTemplate);
      setElements(fetchedTemplate.elements || []);

      if (fetchedTemplate.paperSize) {
        setPageSettings((prev) => ({
          ...prev,
          size: fetchedTemplate.paperSize,
          orientation: fetchedTemplate.orientation || 'portrait',
        }));
      }

      // if (fetchedTemplate.backgroundImageUrl) {
      //   const img = new window.Image();
      //   img.src = fetchedTemplate.backgroundImageUrl;
      //   img.onload = () => setBackgroundImage(img);
      // }

      if (fetchedTemplate.backgroundImageUrl) {
        const img = new Image(); // Fixed Image construction
        img.src = fetchedTemplate.backgroundImageUrl;
        img.onload = () => setBackgroundImage(img);
      }
    } catch (error) {
      toast.error('Failed to load document template.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedId && typeof selectedId === 'string') {
        const node = stageRef.current.findOne(`#${selectedId}`);
        if (node) {
          transformerRef.current.nodes([node]);
        }
      } else if (Array.isArray(selectedId) && selectedId.length > 0) {
        const nodes = selectedId.map((id) => stageRef.current.findOne(`#${id}`)).filter(Boolean);
        transformerRef.current.nodes(nodes);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleSelect = (e) => {
    if (e.currentTarget === e.target.getStage()) {
      setSelectedId(null);
      return;
    }

    const id = e.target.attrs.id;
    if (e.evt.shiftKey && selectedId) {
      if (Array.isArray(selectedId)) {
        setSelectedId(selectedId.includes(id) ? selectedId.filter((i) => i !== id) : [...selectedId, id]);
      } else {
        setSelectedId([selectedId, id]);
      }
    } else {
      setSelectedId(id);
    }
  };

  const handleUpdateElement = (id, updates) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const handleDeleteElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id || (Array.isArray(selectedId) && selectedId.includes(id))) {
      setSelectedId(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const componentData = JSON.parse(e.dataTransfer.getData('application/reactflow'));

      const newElement = {
        id: uuidv4(),
        type: componentData.id,
        position: { x, y },
        dimensions: { width: 150, height: 50 },
        style: {
          fontSize: 12,
          fontFamily: 'Helvetica',
          fillColor: '#000000',
          strokeColor: '#000000',
          textAlign: 'left',
          verticalAlign: 'top',
          borderWidth: 1,
        },
        content: {
          staticText: componentData.id === 'text' ? 'New Text' : '',
          template: componentData.template || '',
        },
      };

      setElements((prev) => [...prev, newElement]);
      setSelectedId(newElement.id);
    } catch (error) {
      console.error('Invalid drop data:', error);
    }
  };

  const autoResizePrintArea = () => {
    if (elements.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = 0,
      maxY = 0;

    elements.forEach((el) => {
      minX = Math.min(minX, el.position.x);
      minY = Math.min(minY, el.position.y);
      maxX = Math.max(maxX, el.position.x + el.dimensions.width);
      maxY = Math.max(maxY, el.position.y + el.dimensions.height);
    });

    const padding = 20;
    setPageSettings((prev) => ({
      ...prev,
      marginTop: Math.max(10, minY - padding),
      marginLeft: Math.max(10, minX - padding),
      marginRight: Math.max(10, stageWidth - maxX - padding),
      marginBottom: Math.max(10, stageHeight - maxY - padding),
    }));
  };

  const groupSelectedElements = () => {
    if (!selectedId || typeof selectedId === 'string') return;

    const selectedElements = elements.filter((el) => selectedId.includes(el.id));
    if (selectedElements.length < 2) return;

    const groupId = uuidv4();
    setGroupedElements((prev) => [
      ...prev,
      {
        id: groupId,
        elementIds: selectedElements.map((el) => el.id),
        position: calculateGroupPosition(selectedElements),
        dimensions: calculateGroupDimensions(selectedElements),
      },
    ]);
  };

  const calculateGroupPosition = (elements) => {
    const minX = Math.min(...elements.map((el) => el.position.x));
    const minY = Math.min(...elements.map((el) => el.position.y));
    return { x: minX, y: minY };
  };

  const calculateGroupDimensions = (elements) => {
    const minX = Math.min(...elements.map((el) => el.position.x));
    const minY = Math.min(...elements.map((el) => el.position.y));
    const maxX = Math.max(...elements.map((el) => el.position.x + el.dimensions.width));
    const maxY = Math.max(...elements.map((el) => el.position.y + el.dimensions.height));
    return { width: maxX - minX, height: maxY - minY };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedTemplate = {
        ...template,
        elements,
        paperSize: pageSettings.size,
        orientation: pageSettings.orientation,
        paperDimensions: {
          width: stageWidth,
          height: stageHeight,
        },
        backgroundImageUrl: backgroundConfig.image,
        printBackgroundImage: printWithBackground,
      };
      await tenantDocumentTemplateService.update(id, updatedTemplate);
      toast.success('Template saved successfully!');
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const addFinancialSection = () => {
    const sectionId = uuidv4();
    const newElements = [
      {
        id: `${sectionId}-1`,
        type: 'text',
        position: { x: stageWidth - 250, y: stageHeight - 200 },
        dimensions: { width: 200, height: 20 },
        content: { template: '{{invoice.subTotal}}' },
        style: { fontSize: 12, textAlign: 'right' },
      },
      {
        id: `${sectionId}-2`,
        type: 'text',
        position: { x: stageWidth - 250, y: stageHeight - 180 },
        dimensions: { width: 200, height: 20 },
        content: { template: '{{invoice.totalTax}}' },
        style: { fontSize: 12, textAlign: 'right' },
      },
      {
        id: `${sectionId}-3`,
        type: 'text',
        position: { x: stageWidth - 250, y: stageHeight - 160 },
        dimensions: { width: 200, height: 20 },
        content: { template: '{{invoice.totalAmount}}' },
        style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
      },
    ];

    setElements((prev) => [...prev, ...newElements]);
  };

  const addSection = (sectionType) => {
    let newElements = [];
    const sectionId = uuidv4();

    switch (sectionType) {
      case 'header':
        newElements = [
          {
            id: `${sectionId}-1`,
            type: 'text',
            position: { x: stageWidth / 2 - 100, y: 20 },
            dimensions: { width: 200, height: 40 },
            content: { staticText: 'COMPANY NAME', dataKey: 'tenant.companyName' },
            style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
          },
          {
            id: `${sectionId}-2`,
            type: 'line',
            position: { x: 50, y: 70 },
            dimensions: { width: stageWidth - 100, height: 1 },
            style: { strokeColor: '#000000', borderWidth: 2 },
          },
        ];
        break;

      case 'footer':
        newElements = [
          {
            id: `${sectionId}-1`,
            type: 'line',
            position: { x: 50, y: stageHeight - 50 },
            dimensions: { width: stageWidth - 100, height: 1 },
            style: { strokeColor: '#000000', borderWidth: 1 },
          },
          {
            id: `${sectionId}-2`,
            type: 'text',
            position: { x: stageWidth / 2 - 150, y: stageHeight - 40 },
            dimensions: { width: 300, height: 20 },
            content: { staticText: 'Page {{pageNumber}} of {{totalPages}}' },
            style: { fontSize: 10, textAlign: 'center' },
          },
        ];
        break;

      default:
        break;
    }

    setElements((prev) => [...prev, ...newElements]);
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoaderCircle className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen bg-slate-900 text-white'>
      <header className='flex-shrink-0 bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700'>
        <Link to='/settings/document-templates' className='flex items-center text-sm text-indigo-400 hover:underline'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Templates
        </Link>
        <h1 className='text-lg font-bold'>{template?.name}</h1>
        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={() => addSection('header')}>
            Add Header
          </Button>
          <Button variant='outline' onClick={addFinancialSection}>
            Add Financial Summary
          </Button>
          <Button variant='outline' onClick={autoResizePrintArea}>
            Auto-Resize Print Area
          </Button>
          <Button variant='outline' onClick={groupSelectedElements} disabled={!selectedId || selectedId.length < 2}>
            Group Selected
          </Button>
          <div className='flex items-center gap-2 ml-4'>
            <label className='text-sm'>Print Background:</label>
            <input
              type='checkbox'
              checked={printWithBackground}
              onChange={(e) => setPrintWithBackground(e.target.checked)}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className='h-4 w-4 mr-2' />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </header>

      <div className='flex-grow flex flex-col overflow-hidden'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-shrink-0'>
          <TabsList className='w-full bg-slate-800 rounded-none px-4'>
            <TabsTrigger value='design' className='flex items-center gap-2'>
              <LayoutGrid className='h-4 w-4' /> Design
            </TabsTrigger>
            <TabsTrigger value='settings' className='flex items-center gap-2'>
              <Settings className='h-4 w-4' /> Page Settings
            </TabsTrigger>
            <TabsTrigger value='preview' className='flex items-center gap-2'>
              <Printer className='h-4 w-4' /> Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='flex-grow grid grid-cols-12 gap-4 p-4 overflow-hidden'>
          <div className='col-span-2'>
            width={stageWidth} height={stageHeight}
            {stageWidth - pageSettings.marginLeft - pageSettings.marginRight}
            <Toolbox
              documentType={template?.documentType}
              onAddElement={(element) => {
                setElements((prev) => [...prev, element]);
                setSelectedId(element.id);
              }}
            />
          </div>

          <div
            className='col-span-7 bg-white relative overflow-auto flex justify-center items-start'
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {showPrintArea && (
              <div className='absolute top-4 left-4 z-10 bg-blue-600 p-2 rounded'>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='text-xs'>Top Margin</label>
                    <input
                      type='number'
                      className='w-16'
                      value={pageSettings.marginTop}
                      onChange={(e) => setPageSettings((prev) => ({ ...prev, marginTop: +e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className='text-xs'>Left Margin</label>
                    <input
                      type='number'
                      className='w-16'
                      value={pageSettings.marginLeft}
                      onChange={(e) => setPageSettings((prev) => ({ ...prev, marginLeft: +e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className='text-xs'>Bottom Margin</label>
                    <input
                      type='number'
                      className='w-16'
                      value={pageSettings.marginBottom}
                      onChange={(e) => setPageSettings((prev) => ({ ...prev, marginBottom: +e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className='text-xs'>Right Margin</label>
                    <input
                      type='number'
                      className='w-16'
                      value={pageSettings.marginRight}
                      onChange={(e) => setPageSettings((prev) => ({ ...prev, marginRight: +e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
            {console.log(elements)}
            <Stage width={stageWidth} height={stageHeight} ref={stageRef} onClick={handleSelect}>
              <Layer>
                {/* Print area boundaries */}

                <Rect
                  x={pageSettings.marginLeft}
                  y={pageSettings.marginTop}
                  width={stageWidth - pageSettings.marginLeft - pageSettings.marginRight}
                  height={stageHeight - pageSettings.marginTop - pageSettings.marginBottom}
                  stroke='red'
                  strokeWidth={1}
                  dash={[4, 4]}
                />

                {/* Background image */}
                {printWithBackground && backgroundImage && (
                  <Image
                    image={backgroundImage}
                    width={stageWidth}
                    height={stageHeight}
                    opacity={backgroundConfig.opacity}
                  />
                )}

                {/* Document elements */}
                {elements.map((element) => {
                  const group = groupedElements.find((g) => g.elementIds.includes(element.id));
                  return (
                    <ElementRenderer
                      key={element.id}
                      element={element}
                      isSelected={selectedId?.includes(element.id)}
                      isPartOfGroup={!!group}
                      onSelect={handleSelect}
                      onChange={(updates) => handleUpdateElement(element.id, updates)}
                      onDelete={() => handleDeleteElement(element.id)}
                    />
                  );
                })}

                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 30 || newBox.height < 20) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>
          </div>

          <div className='col-span-3 flex flex-col gap-4 overflow-hidden'>
            {activeTab === 'settings' ? (
              <div className='space-y-4'>
                <div className='bg-slate-800 p-4 rounded-lg'>
                  <h3 className='font-bold mb-4'>Page Settings</h3>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm mb-1'>Paper Size</label>
                      <select
                        className='w-full bg-slate-700 border border-slate-600 rounded p-2'
                        value={pageSettings.size}
                        onChange={(e) => setPageSettings((prev) => ({ ...prev, size: e.target.value }))}
                      >
                        <option value='A4'>A4 (210x297mm)</option>
                        <option value='Letter'>Letter (8.5x11in)</option>
                        <option value='Legal'>Legal (8.5x14in)</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm mb-1'>Orientation</label>
                      <select
                        className='w-full bg-slate-700 border border-slate-600 rounded p-2'
                        value={pageSettings.orientation}
                        onChange={(e) => setPageSettings((prev) => ({ ...prev, orientation: e.target.value }))}
                      >
                        <option value='portrait'>Portrait</option>
                        <option value='landscape'>Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>

                <BackgroundImageUpload
                  onUpload={(img) => {
                    setBackgroundImage(img);
                    setBackgroundConfig((prev) => ({
                      ...prev,
                      image: img.src,
                    }));
                  }}
                  printWithBackground={printWithBackground}
                  setPrintWithBackground={setPrintWithBackground}
                  backgroundConfig={backgroundConfig}
                  setBackgroundConfig={setBackgroundConfig}
                />
              </div>
            ) : null}

            <DocumentsPropertiesPanel
              element={elements.find(
                (e) => e.id === selectedId || (Array.isArray(selectedId) && selectedId.includes(e.id)),
              )}
              onUpdate={(updates) => {
                if (Array.isArray(selectedId)) {
                  selectedId.forEach((id) => handleUpdateElement(id, updates));
                } else if (selectedId) {
                  handleUpdateElement(selectedId, updates);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentBuilderPage;
