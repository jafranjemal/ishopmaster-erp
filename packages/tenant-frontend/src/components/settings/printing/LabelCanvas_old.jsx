import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import LabelCanvasKonva from "label-renderer/src/components/LabelCanvasKonva";
import ContentLayersPanel from "./ContentLayersPanel"; // Your existing panel

const MM_TO_PX = 3.7795275591;

const dummyItem = {
  variantName: "Sample Product Name",
  sku: "SKU123456789",
  sellingPrice: 199.99,
  company: "JJSOFT GLOBAL",
};

const LabelCanvas = ({
  template,
  content,
  width,
  height,
  selectedElementId,
  onSelectElement,
  onContentChange,
  onDropTool,
  onDeleteElement,
  onClearAll,
  templateMeta,
}) => {
  const containerRef = useRef(null);

  // Drop target for adding new elements
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TOOL",
    drop: (item, monitor) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      // Calculate drop position relative to container, in mm
      const xPx = clientOffset
        ? clientOffset.x - containerRect.left
        : 10 * MM_TO_PX;
      const yPx = clientOffset
        ? clientOffset.y - containerRect.top
        : 10 * MM_TO_PX;
      const xMm = xPx / MM_TO_PX;
      const yMm = yPx / MM_TO_PX;

      // New element defaults
      const newElement = {
        id: Date.now().toString(),
        type: item.type,
        dataField: item.dataField,
        x: Math.round(xMm),
        y: Math.round(yMm),
        fontSize: 12,
        fontWeight: "normal",
        barcodeHeight: 15,
        barcodeWidth: 1,
      };

      // Add new element
      onDropTool?.(newElement);

      // Update content array
      onContentChange([...content, newElement]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const containerStyle = {
    width: width ? width * MM_TO_PX : 300,
    height: height ? height * MM_TO_PX : 180,
    border: isOver ? "2px solid #4f46e5" : "1px solid #334155",
    position: "relative",
    backgroundColor: "#fff",
    overflow: "hidden",
    borderRadius: 6,
  };

  // Merge latest content into template for preview
  const previewTemplate = { ...template, content };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header & Controls */}
      <div className="flex justify-between items-center">
        <span className="text-white font-semibold text-sm">
          Preview: {width}mm × {height}mm
        </span>
        <div className="flex items-center gap-2">
          <button
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
            onClick={() => onClearAll?.()}
          >
            Clear All
          </button>
          <button
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm"
            onClick={() => {
              if (selectedElementId) onDeleteElement?.(selectedElementId);
            }}
            disabled={!selectedElementId}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* Drop target + Preview */}
      <div
        ref={(node) => {
          drop(node);
          containerRef.current = node;
        }}
        style={containerStyle}
        className="shadow"
      >
        <LabelCanvasKonva template={previewTemplate} itemData={dummyItem} />
      </div>

      {/* Layers panel for content management */}
      <ContentLayersPanel
        content={content}
        selectedId={selectedElementId}
        onSelect={onSelectElement}
        onDelete={onDeleteElement}
      />
    </div>
  );
};

export default LabelCanvas;
