import React from "react";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "ui-library";

const PAPER_TYPES = ["sheet", "roll"];
const PAPER_SIZES = ["A4", "A5", "custom"];

const LayoutMetadataEditor = ({ template, onUpdateField }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure numeric fields are stored as numbers
    const numericValue = [
      "labelWidth",
      "labelHeight",
      "horizontalGap",
      "verticalGap",
      "marginTop",
      "marginLeft",
      "columns",
      "rows",
    ].includes(name)
      ? Number(value)
      : value;
    onUpdateField(name, numericValue);
  };

  const handleSelectChange = (fieldName, value) => {
    onUpdateField(fieldName, value);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Page & Label Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
          {/* Paper Type & Size */}
          <div>
            <Label>Paper Type</Label>
            <Select
              onValueChange={(val) => handleSelectChange("paperType", val)}
              value={template.paperType}
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
              value={template.paperSize}
              disabled={template.paperType === "roll"}
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
          {/* Label Dimensions */}
          <div>
            <Label htmlFor="labelWidth">Label Width (mm)</Label>
            <Input
              id="labelWidth"
              name="labelWidth"
              type="number"
              value={template.labelWidth}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="labelHeight">Label Height (mm)</Label>
            <Input
              id="labelHeight"
              name="labelHeight"
              type="number"
              value={template.labelHeight}
              onChange={handleChange}
            />
          </div>
          {/* Columns & Rows */}
          <div>
            <Label htmlFor="columns">Columns</Label>
            <Input
              id="columns"
              name="columns"
              type="number"
              value={template.columns}
              onChange={handleChange}
              disabled={template.paperType === "roll"}
            />
          </div>
          <div>
            <Label htmlFor="rows">Rows</Label>
            <Input
              id="rows"
              name="rows"
              type="number"
              value={template.rows}
              onChange={handleChange}
              disabled={template.paperType === "roll"}
            />
          </div>
          {/* Gaps */}
          <div>
            <Label htmlFor="horizontalGap">Horizontal Gap (mm)</Label>
            <Input
              id="horizontalGap"
              name="horizontalGap"
              type="number"
              value={template.horizontalGap}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="verticalGap">Vertical Gap (mm)</Label>
            <Input
              id="verticalGap"
              name="verticalGap"
              type="number"
              value={template.verticalGap}
              onChange={handleChange}
            />
          </div>
          {/* Margins */}
          <div>
            <Label htmlFor="marginTop">Top Margin (mm)</Label>
            <Input
              id="marginTop"
              name="marginTop"
              type="number"
              value={template.marginTop}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="marginLeft">Left Margin (mm)</Label>
            <Input
              id="marginLeft"
              name="marginLeft"
              type="number"
              value={template.marginLeft}
              onChange={handleChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutMetadataEditor;
