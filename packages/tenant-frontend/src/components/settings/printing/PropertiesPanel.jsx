import React from "react";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui-library";

const PropertiesPanel = ({ selectedElement, onUpdate }) => {
  if (!selectedElement) {
    return (
      <p className="text-sm text-slate-400">
        Select an element on the canvas to edit its properties.
      </p>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    onUpdate(name, type === "number" ? Number(value) : value);
  };

  const handleSelectChange = (fieldName, value) => {
    onUpdate(fieldName, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase text-slate-400">
          Selected Element
        </Label>
        <p className="font-semibold">
          {selectedElement.text || selectedElement.type}
        </p>
      </div>

      <div className="space-y-4 border-t border-slate-700 pt-4">
        <h4 className="font-semibold text-slate-200">Position & Size</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prop-x">X (mm)</Label>
            <Input
              id="prop-x"
              name="x"
              type="number"
              value={selectedElement.x}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="prop-y">Y (mm)</Label>
            <Input
              id="prop-y"
              name="y"
              type="number"
              value={selectedElement.y}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

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
                  <SelectValue />
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

      {selectedElement.type === "barcode" && (
        <div className="space-y-4 border-t border-slate-700 pt-4">
          <h4 className="font-semibold text-slate-200">Barcode Properties</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prop-barcodeHeight">Height (mm)</Label>
              <Input
                id="prop-barcodeHeight"
                name="barcodeHeight"
                type="number"
                value={selectedElement.barcodeHeight}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="prop-barcodeWidth">Bar Width</Label>
              <Input
                id="prop-barcodeWidth"
                name="barcodeWidth"
                type="number"
                step="0.1"
                value={selectedElement.barcodeWidth}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
