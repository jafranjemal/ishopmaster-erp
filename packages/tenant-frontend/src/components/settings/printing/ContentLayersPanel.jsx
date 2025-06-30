// import React from "react";
// import { Trash2 } from "lucide-react";

const ContentLayersPanel2 = ({ content, selectedId, onSelect, onDelete }) => {
  return (
    <div className="bg-slate-800 text-white p-4 rounded-md space-y-2">
      <h3 className="font-semibold text-lg mb-2">Layers</h3>
      {content.length === 0 ? (
        <p className="text-slate-400">No elements yet.</p>
      ) : (
        content.map((el) => (
          <div
            key={el.id}
            onClick={() => onSelect(el.id)}
            className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${
              selectedId === el.id ? "bg-slate-700" : "hover:bg-slate-700"
            }`}
          >
            <div className="text-sm capitalize">
              {el.type}: <span className="text-slate-400">{el.dataField}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(el.id);
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

// export default ContentLayersPanel;

import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Trash2, GripVertical } from "lucide-react";
import { cn, Button } from "ui-library";

const LayerItem = ({
  layer,
  index,
  onSelect,
  onReorder,
  selectedId,
  onDelete,
}) => {
  const ref = useRef(null);
  const isSelected = selectedId === layer.id;

  const [, drop] = useDrop({
    accept: "LAYER",
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "LAYER",
    item: { id: layer.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      onClick={() => onSelect(layer.id)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={cn(
        "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
        isSelected
          ? "bg-indigo-600/30 ring-1 ring-indigo-500"
          : "hover:bg-slate-700/50"
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div ref={drag} className="cursor-grab p-1">
          <GripVertical className="h-4 w-4 text-slate-500" />
        </div>
        {/* <span className="text-sm truncate" title={layer.text || layer.type}>
          {layer.text || layer.type}
        </span> */}
        <span title={layer.text || layer.type} className="text-sm capitalize">
          {layer.type}:{" "}
          <span className="text-slate-400">{layer.dataField}</span>
        </span>
      </div>
      <button
        className="h-6 w-6 text-red-400 hover:text-red-300"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(layer.id);
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const ContentLayersPanel = ({
  content = [],
  selectedId,
  onSelect,
  onDelete,
  onReorder,
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-2 space-y-1">
      <h3 className="font-semibold text-slate-300 px-2 py-1">Layers</h3>
      <div className="space-y-1">
        {content.length === 0 && (
          <p className="text-xs text-center text-slate-500 p-4">
            The canvas is empty. Add elements from the toolbox.
          </p>
        )}
        {content.map((element, index) => (
          <LayerItem
            key={element.id}
            index={index}
            layer={element}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            onReorder={onReorder}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentLayersPanel;
