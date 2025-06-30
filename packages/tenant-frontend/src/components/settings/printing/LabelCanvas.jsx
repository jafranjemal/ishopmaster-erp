import React, { useRef, useEffect, useState } from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import { useDrop } from "react-dnd";
import { generateCodeSvg } from "label-renderer"; // Assuming this is your bwip-js helper

// --- Constants for Unit Conversion ---
// Assumes a standard 96 DPI screen resolution for calculations.
const MM_TO_PX = 96 / 25.4; // Approximately 3.7795
const PT_TO_PX = 96 / 72; // Approximately 1.3333

// --- Helper Functions for Conversion ---
const mmToPx = (mm) => mm * MM_TO_PX;
const pxToMm = (px) => px / MM_TO_PX;
const ptToPx = (pt) => pt * PT_TO_PX;
const pxToPt = (px) => px / PT_TO_PX;

/**
 * A single, consistent function to generate barcode or QR code images for Konva.
 * It now uses your industry-standard 'generateCodeSvg' for both types.
 * @param {object} element - The element configuration.
 * @param {object} itemData - The data to encode.
 * @returns {Promise<Image>} A DOM Image object ready for the Konva canvas.
 */
const generateKonvaImage = (element, itemData) => {
  return new Promise((resolve, reject) => {
    // Generate the SVG using the same renderer as the final print
    generateCodeSvg(element, itemData)
      .then((dataUrl) => {
        if (!dataUrl) {
          // Handle cases where data is missing or generation fails
          reject(new Error(`SVG generation failed for element: ${element.id}`));
          return;
        }
        const img = new window.Image();
        img.src = dataUrl;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
      })
      .catch((err) => reject(err));
  });
};

/**
 * A single element on the Konva canvas.
 * Handles rendering, selection, transformation, and unit conversions.
 */
const CanvasElement = ({ element, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [konvaImage, setKonvaImage] = useState(null);
  const [error, setError] = useState(false);

  // When selected, attach the transformer
  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Load image for barcodes or QR codes
  useEffect(() => {
    let isMounted = true;
    if (element.type === "barcode" || element.type === "qrcode") {
      setError(false);
      generateKonvaImage(element, { sku: "SKU12345", variantName: "Sample" })
        .then((img) => {
          if (isMounted) setKonvaImage(img);
        })
        .catch((err) => {
          console.error("Konva image loading error:", err);
          if (isMounted) setError(true);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [
    element,
    element.type,
    element.dataField,
    element.barcodeHeight,
    element.barcodeWidth,
  ]); // Re-run if barcode props change

  const commonProps = {
    id: element.id,
    // Convert mm to px for rendering
    x: mmToPx(element.x || 0),
    y: mmToPx(element.y || 0),
    rotation: element.rotation || 0,
    draggable: true,
    onClick: (e) => {
      e.cancelBubble = true;
      onSelect();
    },
    onTap: (e) => {
      e.cancelBubble = true;
      onSelect();
    },
    // Convert px back to mm on drag end before saving
    onDragEnd: (e) => {
      onChange({
        ...element,
        x: pxToMm(e.target.x()),
        y: pxToMm(e.target.y()),
      });
    },
    onTransformEnd: () => {
      const node = shapeRef.current;
      if (!node) return;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      // Convert px back to mm/pt on transform end
      onChange({
        ...element,
        x: pxToMm(node.x()),
        y: pxToMm(node.y()),
        rotation: node.rotation(),
        // For text, we adjust fontSize. For images, we adjust width/height.
        ...(element.type === "text"
          ? { fontSize: pxToPt(node.height() * scaleY) }
          : {
              width: pxToMm(node.width() * scaleX),
              height: pxToMm(node.height() * scaleY),
            }),
      });
    },
  };

  if (error) {
    return (
      <Text
        {...commonProps}
        text="⚠️ Error"
        fontSize={12}
        fill="red"
        fontFamily="Arial"
      />
    );
  }

  if (element.type === "text") {
    const isPrice = element.dataField === "sellingPrice";
    return (
      <>
        <Text
          ref={shapeRef}
          {...commonProps}
          text={element.text || `[${element.dataField}]`}
          align={isPrice ? "right" : element.align || "left"}
          // Convert pt to px for rendering
          fontSize={ptToPx(element.fontSize || 12)}
          // Set industry-standard font family
          fontFamily="'OCR-B', 'Courier New', monospace"
          fontWeight={element.fontWeight || "normal"}
          fill="black"
        />
        {isSelected && (
          <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox} />
        )}
      </>
    );
  }

  if ((element.type === "barcode" || element.type === "qrcode") && konvaImage) {
    return (
      <>
        <KonvaImage
          ref={shapeRef}
          {...commonProps}
          image={konvaImage}
          // Convert mm to px for rendering
          width={mmToPx(element.width || 30)}
          height={mmToPx(element.height || 15)}
        />
        {isSelected && (
          <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox} />
        )}
      </>
    );
  }

  return null; // Render nothing if image is loading or type is unknown
};

/**
 * The main Canvas component.
 * Manages the stage and layers, converting label dimensions to pixels.
 */
const LabelCanvas = ({
  width, // in mm
  height, // in mm
  content,
  onContentChange,
  selectedElementId,
  onSelectElement,
}) => {
  const stageRef = useRef();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TOOL",
    drop: (item, monitor) => {
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const newElement = {
        id: `el_${Date.now()}`,
        ...item,
        // Convert drop position from px to mm for storing in state
        x: pxToMm(pointer.x),
        y: pxToMm(pointer.y),
        // Sensible defaults in physical units
        ...(item.type === "text" && { fontSize: 10 }), // 10pt
        ...(item.type === "barcode" && { width: 40, height: 15 }), // 40mm x 15mm
        ...(item.type === "qrcode" && { width: 25, height: 25 }), // 25mm x 25mm
      };

      onContentChange([...content, newElement]);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  const updateElement = (updatedElement) => {
    onContentChange(
      content.map((el) => (el.id === updatedElement.id ? updatedElement : el))
    );
  };

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      onSelectElement(null);
    }
  };

  // Convert label dimensions from mm to px for the stage
  const stageWidthPx = mmToPx(width);
  const stageHeightPx = mmToPx(height);

  return (
    <div className="w-full flex-col">
      <span className="text-white font-semibold text-sm">
        Preview: {width}mm × {height}mm
      </span>
      <div
        ref={drop}
        className="bg-white shadow-lg mt-2"
        style={{
          width: stageWidthPx,
          height: stageHeightPx,
          border: isOver ? "2px solid #4f46e5" : "1px solid #94a3b8",
        }}
      >
        <Stage
          width={stageWidthPx}
          height={stageHeightPx}
          ref={stageRef}
          onMouseDown={handleDeselect}
        >
          <Layer>
            {content.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                isSelected={el.id === selectedElementId}
                onSelect={() => onSelectElement(el.id)}
                onChange={updateElement}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default LabelCanvas;
