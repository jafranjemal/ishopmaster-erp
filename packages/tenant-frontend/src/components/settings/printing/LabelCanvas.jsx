import React, { useRef, useEffect, useState } from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import { useDrop } from "react-dnd";
import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";
import { Menu, Item, useContextMenu } from "react-contexify";
import ContentLayersPanel from "./ContentLayersPanel";

const ELEMENT_MENU_ID = "element-menu";
const CANVAS_MENU_ID = "canvas-menu";
const MM_TO_PX = 3.7795;

const generateBarcodeImage = (text, options = {}) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text || "NO-DATA", {
    format: "CODE128",
    displayValue: false,
    height: options.barcodeHeight || 40,
    width: options.barcodeWidth || 1.5,
    margin: 0,
  });
  const img = new window.Image();
  img.src = canvas.toDataURL("image/png");
  return img;
};

const QrCodeGenerator = ({ content }) => (
  <div style={{ display: "none" }}>
    {content
      .filter((el) => el.type === "qrcode")
      .map((el) => (
        <QRCodeCanvas
          id={`qr-canvas-${el.id}`}
          value={el.dataField || "no-data"}
          size={256}
          level="H"
          key={el.id}
        />
      ))}
  </div>
);

const getQRCodeDataURL = (elementId) => {
  const canvas = document.getElementById(`qr-canvas-${elementId}`);
  return canvas ? canvas.toDataURL("image/png") : null;
};

const CanvasElement = ({ element, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [konvaImage, setKonvaImage] = useState(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    let img = null;
    if (element.type === "barcode") {
      img = generateBarcodeImage(element.dataField, {
        barcodeHeight: element.barcodeHeight,
        barcodeWidth: element.barcodeWidth,
      });
    } else if (element.type === "qrcode") {
      const canvas = document.getElementById(`qr-canvas-${element.id}`);
      if (canvas) {
        img = new window.Image();
        img.src = canvas.toDataURL("image/png");
      }
    }
    if (img) {
      img.onload = () => setKonvaImage(img);
    } else {
      setKonvaImage(null);
    }
  }, [
    element.dataField,
    element.type,
    element.id,
    element.barcodeHeight,
    element.barcodeWidth,
  ]);

  const { show } = useContextMenu({ id: ELEMENT_MENU_ID });
  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    onSelect();
    show({ event: e.evt });
  };

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
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
    onDragEnd: (e) =>
      onChange({ ...element, x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        ...element,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });
    },
    onContextMenu: handleContextMenu,
  };

  let renderedElement;
  if (element.type === "text") {
    renderedElement = (
      <Text
        ref={shapeRef}
        {...commonProps}
        text={element.text || element.dataField}
        fontSize={element.fontSize || 12}
        fill={element.fill || "black"}
        fontWeight={element.fontWeight}
      />
    );
  } else if (
    (element.type === "barcode" || element.type === "qrcode") &&
    konvaImage
  ) {
    renderedElement = (
      <KonvaImage
        ref={shapeRef}
        {...commonProps}
        image={konvaImage}
        width={element.width || 120}
        height={element.height || 40}
      />
    );
  } else return null;

  return (
    <>
      {renderedElement}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => newBox}
          rotationSnaps={[0, 90, 180, 270]}
        />
      )}
    </>
  );
};

const LabelCanvas = ({
  width,
  height,
  content,
  onContentChange,
  selectedElementId,
  onSelectElement,
  onDeleteElement,
  onClearAll,
}) => {
  const stageRef = useRef();
  const { show: showCanvasMenu } = useContextMenu({ id: CANVAS_MENU_ID });

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
        x: pointer.x,
        y: pointer.y,
        text: item.label,
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
    if (e.target === e.target.getStage()) onSelectElement(null);
  };

  console.log(
    "LabelCanvas content keys:",
    content.map((el) => el)
  );

  return (
    <div className="flex gap-4">
      {/* Left: Label Designer Canvas */}
      <div
        ref={drop}
        className="bg-white shadow-lg"
        style={{
          width: width * MM_TO_PX,
          height: height * MM_TO_PX,
          border: isOver ? "2px solid #4f46e5" : "1px solid #94a3b8",
        }}
      >
        <Stage
          width={width * MM_TO_PX}
          height={height * MM_TO_PX}
          ref={stageRef}
          onMouseDown={handleDeselect}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            showCanvasMenu({ event: e.evt });
          }}
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

      {/* Right: Photoshop-style Layers Panel */}
      <div className="w-64">
        <ContentLayersPanel
          content={content}
          selectedId={selectedElementId}
          onSelect={onSelectElement}
          onDelete={(id) =>
            onContentChange(content.filter((el) => el.id !== id))
          }
        />
      </div>
    </div>
  );
  return (
    <>
      <QrCodeGenerator content={content} />
      <div
        ref={drop}
        className="bg-white shadow-lg"
        style={{
          width: width * MM_TO_PX,
          height: height * MM_TO_PX,
          border: isOver ? "2px solid #4f46e5" : "1px solid #94a3b8",
        }}
      >
        <Stage
          width={width * MM_TO_PX}
          height={height * MM_TO_PX}
          ref={stageRef}
          onMouseDown={handleDeselect}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            showCanvasMenu({ event: e.evt });
          }}
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
      <Menu id={ELEMENT_MENU_ID} theme="dark">
        <Item onClick={() => onDeleteElement(selectedElementId)}>
          Delete Element
        </Item>
      </Menu>
      <Menu id={CANVAS_MENU_ID} theme="dark">
        <Item onClick={onClearAll}>Clear All Elements</Item>
      </Menu>
    </>
  );
};

export default LabelCanvas;
