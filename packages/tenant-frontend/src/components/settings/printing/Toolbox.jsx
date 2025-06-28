import React from "react";
import { useDrag } from "react-dnd";
import { Barcode, QrCode, Type, DollarSign } from "lucide-react";

const DraggableTool = ({ type, dataField, label, icon: Icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TOOL",
    item: { type, dataField, label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="flex items-center p-3 bg-slate-700 rounded-md cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Icon className="h-5 w-5 mr-3 text-slate-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
};

const Toolbox = () => {
  const tools = [
    {
      type: "text",
      dataField: "variantName",
      label: "Product Name",
      icon: Type,
    },
    { type: "text", dataField: "sku", label: "SKU", icon: Type },
    {
      type: "text",
      dataField: "sellingPrice",
      label: "Price",
      icon: DollarSign,
    },
    {
      type: "barcode",
      dataField: "sku",
      label: "Barcode (from SKU)",
      icon: Barcode,
    },
    {
      type: "qrcode",
      dataField: "sku",
      label: "QR Code (from SKU)",
      icon: QrCode,
    },
  ];

  return (
    <div className="space-y-3">
      {tools.map((tool) => (
        <DraggableTool key={tool.label} {...tool} />
      ))}
    </div>
  );
};
export default Toolbox;
