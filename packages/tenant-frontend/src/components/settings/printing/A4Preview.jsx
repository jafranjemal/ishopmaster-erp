import React from "react";

/**
 * Renders a scaled-down preview of a full A4 sheet of labels.
 */
const A4Preview = ({ template, singleLabelHtml }) => {
  const {
    paperSize,
    labelWidth,
    labelHeight,
    horizontalGap,
    verticalGap,
    marginTop,
    marginLeft,
    columns,
    rows,
  } = template;

  // Create an array representing all the label slots on the sheet
  const labelCount = columns * rows;
  const labels = Array.from({ length: labelCount }, (_, i) => i);

  // A4 dimensions in mm for scaling the preview container
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;

  const sheetStyle = {
    width: `${A4_WIDTH_MM}mm`,
    height: `${A4_HEIGHT_MM}mm`,
    padding: `${marginTop}mm ${marginLeft}mm`,
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, ${labelWidth}mm)`,
    gridTemplateRows: `repeat(${rows}, ${labelHeight}mm)`,
    gap: `${verticalGap}mm ${horizontalGap}mm`,
    alignContent: "start",
    backgroundColor: "white",
  };

  const labelStyle = {
    // The background is set by the CSS in the generated HTML
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg">
      <h4 className="text-lg font-semibold mb-4">A4 Sheet Preview</h4>
      <div
        className="mx-auto shadow-lg"
        style={{
          width: `${A4_WIDTH_MM}mm`,
          height: `${A4_HEIGHT_MM}mm`,
          // We scale the entire container down to fit on the screen
          transform: "scale(0.8)",
          transformOrigin: "top center",
        }}
      >
        <div style={sheetStyle}>
          {labels.map((i) => (
            <div
              key={i}
              style={labelStyle}
              // This is where we inject the generated HTML for a single label
              dangerouslySetInnerHTML={{ __html: singleLabelHtml }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default A4Preview;
