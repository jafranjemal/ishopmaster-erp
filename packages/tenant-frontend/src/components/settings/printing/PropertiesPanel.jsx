import React from "react";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from "ui-library"; // Assuming 'ui-library' is your component library
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Move,
  StretchHorizontal,
  StretchVertical,
} from "lucide-react";

// Helper function to convert pixels to millimeters
const pxToMm = (px) => px / 3.7795275591;

// Helper function to measure text width using a canvas
const measureTextWidth = (
  text,
  fontSize = 12,
  fontWeight = "normal",
  fontFamily = "Arial"
) => {
  if (typeof document === "undefined") {
    return pxToMm((fontSize / 2) * text.length);
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontWeight} ${fontSize}pt ${fontFamily}`;
  const metrics = ctx.measureText(text);
  return pxToMm(metrics.width);
};

// Helper function to measure text height
const measureTextHeight = (fontSize = 12) => {
  const pxHeight = fontSize * 1.2;
  return pxToMm(pxHeight);
};

const PropertiesPanel = ({
  selectedElement,
  onUpdate,
  labelWidth,
  labelHeight,
}) => {
  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-400">
          Select an element to see its properties.
        </p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    onUpdate(name, type === "number" ? Number(value) : value);
  };

  const handleSelectChange = (fieldName, value) => {
    onUpdate(fieldName, value);
  };

  const getElementDimensions = (element) => {
    if (element.type === "text") {
      const width = measureTextWidth(
        element.text || "",
        element.fontSize,
        element.fontWeight
      );
      const height = measureTextHeight(element.fontSize);
      return { width, height };
    }
    // For barcodes and other non-text elements, the dimensions are explicitly set.
    return {
      width: element.width || 30, // Default width for barcodes/qrcodes
      height: element.height || 15, // Use a generic height property
    };
  };

  const measured = getElementDimensions(selectedElement);

  const handleAlign = (axis, position) => {
    const { width, height } = measured;
    if (axis === "x") {
      let newX;
      if (position === "start") newX = 0;
      if (position === "center") newX = labelWidth / 2 - width / 2;
      if (position === "end") newX = labelWidth - width;
      onUpdate("x", newX);
    }
    if (axis === "y") {
      let newY;
      if (position === "start") newY = 0;
      if (position === "center") newY = labelHeight / 2 - height / 2;
      if (position === "end") newY = labelHeight - height;
      onUpdate("y", newY);
    }
  };

  const handleCenterOnLabel = () => {
    handleAlign("x", "center");
    handleAlign("y", "center");
  };

  return (
    <div className="space-y-6">
      {/* --- Selected Element Info --- */}
      <div>
        <Label className="text-xs uppercase text-slate-400">
          Selected Element
        </Label>
        <p
          className="font-semibold truncate"
          title={selectedElement.text || selectedElement.type}
        >
          {selectedElement.text || selectedElement.type}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Label: {labelWidth}mm × {labelHeight}mm
        </p>
        <p className="text-xs text-emerald-400 mt-1">
          Actual Size: {measured.width.toFixed(2)}mm ×{" "}
          {measured.height.toFixed(2)}mm
        </p>
      </div>

      {/* --- Position & Size Controls --- */}
      <div className="space-y-4 border-t border-slate-700 pt-4">
        <h4 className="font-semibold text-slate-200">Position</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prop-x">X (mm)</Label>
            <Input
              id="prop-x"
              name="x"
              type="number"
              value={selectedElement.x || 0}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="prop-y">Y (mm)</Label>
            <Input
              id="prop-y"
              name="y"
              type="number"
              value={selectedElement.y || 0}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <Button variant="outline" onClick={() => handleAlign("x", "start")}>
            <ArrowLeft size={16} /> Left
          </Button>
          <Button variant="outline" onClick={() => handleAlign("x", "center")}>
            <AlignCenterHorizontal size={16} /> Center X
          </Button>
          <Button variant="outline" onClick={() => handleAlign("x", "end")}>
            <ArrowRight size={16} /> Right
          </Button>
          <Button variant="outline" onClick={() => handleAlign("y", "start")}>
            <ArrowUp size={16} /> Top
          </Button>
          <Button variant="outline" onClick={() => handleAlign("y", "center")}>
            <AlignCenterVertical size={16} /> Center Y
          </Button>
          <Button variant="outline" onClick={() => handleAlign("y", "end")}>
            <ArrowDown size={16} /> Bottom
          </Button>
        </div>
        <div className="mt-2">
          <Button
            className="w-full"
            variant="secondary"
            onClick={handleCenterOnLabel}
          >
            <Move size={16} className="mr-2" />
            Center on Label
          </Button>
        </div>
      </div>

      {/* --- Text Specific Properties --- */}
      {selectedElement.type === "text" && (
        <div className="space-y-4 border-t border-slate-700 pt-4">
          <h4 className="font-semibold text-slate-200">Text Properties</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prop-fontSize">Font Size (pt)</Label>
              <Input
                id="prop-fontSize"
                name="fontSize"
                type="number"
                value={selectedElement.fontSize}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Font Weight</Label>
              <Select
                onValueChange={(val) => handleSelectChange("fontWeight", val)}
                value={selectedElement.fontWeight}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Font Weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* --- Barcode Specific Properties --- */}

      <div className="space-y-4 border-t border-slate-700 pt-4">
        <h4 className="font-semibold text-slate-200">Barcode Properties</h4>
        {/* This section now controls the final dimensions and the barcode's internal scale */}
        <div className="grid grid-cols-2 gap-4">
          {/* *** THE FIX IS HERE: Input for the FINAL width *** */}
          <div>
            <Label htmlFor="prop-width">Width (mm)</Label>
            <Input
              id="prop-width"
              name="width"
              type="number"
              value={selectedElement.width}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="prop-height">Height (mm)</Label>
            <Input
              id="prop-height"
              name="height"
              type="number"
              value={selectedElement.height}
              onChange={handleInputChange}
            />
          </div>
          <div>
            {/* This now correctly controls the module width (density) of the barcode */}
            <Label htmlFor="prop-barcodeWidth">Bar Density (Scale)</Label>
            <Input
              id="prop-barcodeWidth"
              name="barDensity"
              type="number"
              step="0.1"
              value={selectedElement.barDensity}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
