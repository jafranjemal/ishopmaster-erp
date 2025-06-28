import React from "react";
import { Trash2 } from "lucide-react";

const ContentLayersPanel = ({ content, selectedId, onSelect, onDelete }) => {
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

export default ContentLayersPanel;
