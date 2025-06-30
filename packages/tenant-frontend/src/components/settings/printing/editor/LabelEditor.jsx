import React, { useState } from "react";
import PropertiesPanel from "./../PropertiesPanel"; // your updated panel component

const LabelEditor = () => {
  const [template, setTemplate] = useState({
    labelWidth: 100, // example mm
    labelHeight: 50, // example mm
    content: [
      {
        id: "el1",
        type: "text",
        x: 10,
        y: 10,
        width: 40,
        height: 10,
        fontSize: 12,
        fontWeight: "normal",
        text: "Sample Text",
      },
      // ... other elements
    ],
  });

  const [selectedElementId, setSelectedElementId] = useState("el1");

  // Update top-level template fields (e.g., labelWidth, labelHeight)
  const updateTemplateField = (field, value) => {
    setTemplate((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // Update a specific element's property inside template.content by id
  const updateElementField = (elementId, field, value) => {
    setTemplate((prev) => {
      if (!prev) return null;
      const newContent = prev.content.map((el) =>
        el.id === elementId ? { ...el, [field]: value } : el
      );
      return { ...prev, content: newContent };
    });
  };

  // Convenience handler passed to PropertiesPanel
  const handleUpdate = (field, value) => {
    if (!selectedElementId) return;
    updateElementField(selectedElementId, field, value);
  };

  // Find the selected element object for the panel
  const selectedElement = template.content.find(
    (el) => el.id === selectedElementId
  );

  return (
    <div className="flex gap-6">
      {/* Your canvas component here (not shown) */}

      {/* Properties panel */}
      <div className="w-96 p-4 bg-gray-900 text-white rounded shadow-lg">
        <PropertiesPanel
          selectedElement={selectedElement}
          onUpdate={handleUpdate}
          labelWidth={template.labelWidth}
          labelHeight={template.labelHeight}
        />
      </div>
    </div>
  );
};

export default LabelEditor;
