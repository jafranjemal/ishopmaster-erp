import React, { useState } from "react";
import { Label, Button, Modal, Badge, Input } from "ui-library";
import { X, Search } from "lucide-react";

const CompatibilitySelector = ({
  allTemplates = [],
  selectedIds = [],
  onChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedTemplates = allTemplates.filter((t) =>
    selectedIds.includes(t._id)
  );
  const availableTemplates = allTemplates.filter(
    (t) =>
      !selectedIds.includes(t._id) &&
      t.baseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (templateId) => {
    const newIds = selectedIds.includes(templateId)
      ? selectedIds.filter((id) => id !== templateId)
      : [...selectedIds, templateId];
    onChange(newIds);
  };

  return (
    <div>
      <Label>Product Compatibility</Label>
      <div className="mt-2 flex flex-wrap gap-2 p-2 min-h-[40px] border border-slate-700 rounded-lg">
        {selectedTemplates.length > 0 ? (
          selectedTemplates.map((t) => (
            <Badge
              key={t._id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {t.baseName}
              <button
                type="button"
                onClick={() => handleToggle(t._id)}
                className="rounded-full hover:bg-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-slate-400">No compatibilities added.</p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => setIsModalOpen(true)}
      >
        Add / Edit Compatibilities
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Compatible Products"
      >
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {availableTemplates.map((template) => (
            <label
              key={template._id}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                onChange={() => handleToggle(template._id)}
                className="h-4 w-4"
              />
              <span>{template.baseName}</span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CompatibilitySelector;
