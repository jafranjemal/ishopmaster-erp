import React, { useEffect, useState } from "react";
import { Stage, Layer, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { generateCodeSvg, getFieldData } from "..";

// --- Use the SAME conversion constants everywhere ---
const MM_TO_PX = 96 / 25.4; // Approx 3.7795
const PT_TO_PX = 96 / 72; // Approx 1.3333

const mmToPx = (mm) => mm * MM_TO_PX;
const ptToPx = (pt) => pt * PT_TO_PX;

const BarcodeImage = ({ element, itemData }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [image] = useImage(imageUrl);

  useEffect(() => {
    const generate = async () => {
      const url = await generateCodeSvg(element, itemData);
      setImageUrl(url);
    };
    generate();
  }, [element, itemData]);

  return (
    image && (
      <KonvaImage
        image={image}
        x={mmToPx(element.x || 0)}
        y={mmToPx(element.y || 0)}
        width={mmToPx(element.width || 30)}
        height={mmToPx(element.height || 15)}
        // Konva Images are stretched by default, which matches our renderer
      />
    )
  );
};

const LabelCanvasKonvaOled = ({ template, itemData }) => {
  const { labelWidth, labelHeight, content = [] } = template;

  const mmToPx = (mm) => mm * 3.78;

  return (
    <Stage
      width={mmToPx(labelWidth)}
      height={mmToPx(labelHeight)}
      style={{ backgroundColor: "white", border: "1px solid #ccc" }}
    >
      <Layer>
        {content.map((element, idx) => {
          const x = mmToPx(element.x || 0);
          const y = mmToPx(element.y || 0);

          if (element.type === "text") {
            const text = getFieldData(element.dataField, itemData);
            return (
              <Text
                key={idx}
                text={text}
                x={x}
                y={y}
                fontSize={parseFloat(element.fontSize || 8)}
                fontStyle={element.fontWeight || "normal"}
                fill="black"
              />
            );
          }

          if (element.type === "barcode" || element.type === "qrcode") {
            return (
              <BarcodeImage key={idx} element={element} itemData={itemData} />
            );
          }

          return null;
        })}
      </Layer>
    </Stage>
  );
};

const LabelCanvasKonva = ({ template, itemData }) => {
  const { labelWidth, labelHeight, content } = template;

  return (
    <Stage
      width={mmToPx(labelWidth)}
      height={mmToPx(labelHeight)}
      style={{
        scale: 0.85,
        backgroundColor: "white",
        border: "1px solid #000",
      }}
    >
      <Layer>
        {(content || []).map((element, idx) => {
          if (element.type === "text") {
            const text =
              getFieldData(element.dataField, itemData) ||
              `[${element.dataField}]`;
            const isPrice = element.dataField === "sellingPrice";
            return (
              <Text
                key={idx}
                text={text}
                x={mmToPx(element.x || 0)}
                y={mmToPx(element.y || 0)}
                width={mmToPx(element.width)}
                height={mmToPx(element.height)}
                align={isPrice ? "right" : element.align || "left"}
                //verticalAlign="middle" // This vertically centers the text in its box
                fontSize={ptToPx(element.fontSize || 8)}
                fontFamily={element.fontFamily || "Arial"}
                fontStyle={element.fontWeight || "normal"}
                //align={element.align || "left"}
                //verticalAlign="middle"
                fill="black"
                // Ensure text doesn't spill out of its bounding box
                wrap="none"
                ellipsis={true}
              />
            );
          }

          if (element.type === "barcode" || element.type === "qrcode") {
            return (
              <BarcodeImage key={idx} element={element} itemData={itemData} />
            );
          }

          return null;
        })}
      </Layer>
    </Stage>
  );
};
export default LabelCanvasKonva;
