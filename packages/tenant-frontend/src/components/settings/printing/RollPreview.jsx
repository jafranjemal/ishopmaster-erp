import React from "react";

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

  return (
    <div className="bg-slate-900 p-4 rounded-lg">
      <h4 className="text-lg font-semibold mb-4">Roll Preview</h4>
      <div className="max-h-[400px] overflow-y-auto p-4 flex justify-center">
        <div style={rollStyle}>
          {labels.map((i) => (
            <div
              key={i}
              style={{
                width: `${labelWidth}mm`,
                height: `${labelHeight}mm`,
                boxSizing: "border-box",
                backgroundColor: "#fff",
                border: "1px dashed #666",
                color: "black",
              }}
              dangerouslySetInnerHTML={{ __html: singleLabelHtml }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RollPreview;
