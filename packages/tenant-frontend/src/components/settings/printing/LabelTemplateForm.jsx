import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui-library";

const PAPER_TYPES = ["sheet", "roll"];
const PAPER_SIZES = ["A4", "A5", "custom"];

const LabelTemplateForm = ({ onSave, onCancel, isSaving }) => {
  const initialFormData = {
    name: "",
    paperType: "sheet",
    paperSize: "A4",
    labelWidth: 40,
    labelHeight: 25,
    horizontalGap: 5,
    verticalGap: 5,
    marginTop: 10,
    marginLeft: 10,
    columns: 4,
    rows: 11,
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: Number(e.target.value),
    }));
  const handleSelectChange = (fieldName, value) =>
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  const handleTextChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleTextChange}
          required
          placeholder="e.g., A4 Product Price Tags"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Paper Type</Label>
          <Select
            onValueChange={(val) => handleSelectChange("paperType", val)}
            value={formData.paperType}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAPER_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Paper Size</Label>
          <Select
            onValueChange={(val) => handleSelectChange("paperSize", val)}
            value={formData.paperSize}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAPER_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-4 space-y-4">
        <h4 className="text-sm font-medium text-slate-300">
          Label Dimensions (in mm)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="labelWidth">Label Width</Label>
            <Input
              id="labelWidth"
              name="labelWidth"
              type="number"
              value={formData.labelWidth}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="labelHeight">Label Height</Label>
            <Input
              id="labelHeight"
              name="labelHeight"
              type="number"
              value={formData.labelHeight}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="horizontalGap">Horizontal Gap</Label>
            <Input
              id="horizontalGap"
              name="horizontalGap"
              type="number"
              value={formData.horizontalGap}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="verticalGap">Vertical Gap</Label>
            <Input
              id="verticalGap"
              name="verticalGap"
              type="number"
              value={formData.verticalGap}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-700 pt-4 space-y-4">
        <h4 className="text-sm font-medium text-slate-300">Sheet Layout</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="columns">Columns per Sheet</Label>
            <Input
              id="columns"
              name="columns"
              type="number"
              value={formData.columns}
              onChange={handleChange}
              disabled={formData.paperType === "roll"}
            />
          </div>
          <div>
            <Label htmlFor="rows">Rows per Sheet</Label>
            <Input
              id="rows"
              name="rows"
              type="number"
              value={formData.rows}
              onChange={handleChange}
              disabled={formData.paperType === "roll"}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Creating..." : "Create & Go to Designer"}
        </Button>
      </div>
    </form>
  );
};
export default LabelTemplateForm;
