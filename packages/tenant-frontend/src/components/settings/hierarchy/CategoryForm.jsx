import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

// Helper function to get all descendant IDs of a category to prevent circular dependencies.
const getDescendantIds = (categoryId, allCategories) => {
  const descendants = new Set();
  const children = allCategories.filter((c) => String(c.parent) === String(categoryId));
  for (const child of children) {
    descendants.add(child._id);
    const grandchildren = getDescendantIds(child._id, allCategories);
    grandchildren.forEach((id) => descendants.add(id));
  }
  return descendants;
};

// Recursive helper to generate the indented <SelectItem> options.
const generateCategoryOptions = (allCategories, parentId = null, disabledIds = new Set(), level = 0) => {
  const children = allCategories.filter((category) => String(category.parent || null) === String(parentId || null));
  let options = [];
  for (const child of children) {
    const isNodeDisabled = disabledIds.has(child._id);
    console.log("child ", child);
    options.push(
      <SelectItem key={child._id} value={child._id} disabled={isNodeDisabled}>
        {"\u00A0".repeat(level * 4)} {child.name}
      </SelectItem>
    );
    options = options.concat(generateCategoryOptions(allCategories, child._id, disabledIds, level + 1));
  }
  return options;
};

const CategoryForm = ({ itemToEdit, parentId, allCategories, onSave, onCancel, isSaving }) => {
  // The form's internal state now includes the `parent` field.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: null,
  });

  // This useEffect hook is the "brain" of the component.
  useEffect(() => {
    if (itemToEdit) {
      // EDIT MODE: Populate the entire form from the existing item's data.
      setFormData({
        name: itemToEdit.name || "",
        description: itemToEdit.description || "",
        parent: itemToEdit.parent || null,
      });
    } else {
      // CREATE MODE: This is the logic that solves your problem.
      // It takes the `parentId` passed from the HierarchyManagementPage
      // and sets it as the default parent for the new category.
      if (parentId) {
        setFormData({
          name: "",
          description: "",
          parent: `${parentId}`, // Ensure it's a string
        });
      } else {
        setFormData({
          name: "",
          description: "",
          parent: parentId ? String(parentId) : "root", // Ensure it's a string
        });
      }
    }
  }, [itemToEdit, parentId]); // This hook re-runs whenever the modal is opened with a new context.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentChange = (value) => {
    // Allows the user to manually change the parent if needed.
    if (allCategories && parentId && value !== "") setFormData((prev) => ({ ...prev, parent: value === "root" ? null : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // The `formData` now contains the correct parent ID when saved.
    onSave(formData);
  };

  // This logic prevents making a category a child of itself.
  const disabledIds = useMemo(() => {
    if (!itemToEdit?._id) return new Set();
    const descendantIds = getDescendantIds(itemToEdit._id, allCategories);
    descendantIds.add(itemToEdit._id);
    return descendantIds;
  }, [itemToEdit, allCategories]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formData.parent !== "" && (
        <div>
          <Label htmlFor="parent">Parent Category</Label>
          <Select
            // The value is now correctly bound to the form's state,
            // which was set by the `useEffect` hook. This ensures the correct
            // parent is displayed when the form opens.
            id="parent"
            name="parent"
            value={formData.parent || "root"}
            onValueChange={handleParentChange}
            disabled={isSaving}
          >
            <SelectTrigger id="parent">
              <SelectValue placeholder="Select a parent category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">-- (Root Level Category) --</SelectItem>
              {generateCategoryOptions(allCategories, null, disabledIds)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={isSaving} />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input as="textarea" id="description" name="description" value={formData.description} onChange={handleChange} disabled={isSaving} />
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Category"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
