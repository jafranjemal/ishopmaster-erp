import React from "react";

/**
 * Renders a preview of a continuous roll of labels.
 * It uses CSS Flexbox to create a vertically scrolling list.
 * @param {object} props
 * @param {object} props.template - The full label template object with all dimensions.
 * @param {string} props.singleLabelHtml - The raw HTML string for a single rendered label.
 */
const RollPreview = ({ template, singleLabelHtml }) => {
  const { labelWidth, labelHeight, verticalGap } = template;

  // We'll just render a few labels to simulate the roll
  const previewCount = 5;
  const labels = Array.from({ length: previewCount }, (_, i) => i);

  const rollStyle = {
    width: `${labelWidth}mm`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: `${verticalGap}mm`,
    padding: "10mm 0",
  };

  const labelStyle = {
    width: `${labelWidth}mm`,
    height: `${labelHeight}mm`,
    outline: "1px dashed #cccccc",
    overflow: "hidden",
    flexShrink: 0,
  };

  return (
    <div className="bg-slate-900/50 p-8 rounded-lg flex flex-col items-center">
      <h4 className="text-lg font-semibold mb-4 text-white">Roll Preview</h4>
      <div className="w-full max-h-[500px] overflow-y-auto p-4 flex justify-center bg-slate-700 rounded-md">
        <div style={rollStyle}>
          {labels.map((i) => (
            <div
              key={i}
              style={labelStyle}
              dangerouslySetInnerHTML={{ __html: singleLabelHtml }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RollPreview;
