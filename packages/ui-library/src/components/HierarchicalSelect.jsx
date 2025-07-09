import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "ui-library"; // Assuming these base components exist

/**
 * A reusable component to display hierarchical data in a select dropdown.
 * @param {object} props
 * @param {Array} props.options - The array of hierarchical option objects. Each object should have _id, name, and an optional children array.
 * @param {string} props.placeholder - The placeholder text for the select trigger.
 * @param {function(string): void} props.onValueChange - Callback with the selected value.
 * @param {string} props.value - The currently selected value.
 * @param {boolean} [props.required=false] - If the select is a required field.
 */
export const HierarchicalSelect = ({
  options = [],
  placeholder,
  onValueChange,
  value,
  required = false,
}) => {
  // Recursive function to generate the JSX for options
  const generateCategoryOptions = (categories, level = 0) => {
    let categoryOptions = [];
    for (const category of categories) {
      // Add the main item
      categoryOptions.push(
        <SelectItem key={category._id} value={category._id}>
          {/* Add indentation based on the level */}
          <span style={{ paddingLeft: `${level * 1.5}rem` }}>
            {level > 0 ? "↳ " : ""}
            {category.name}
          </span>
        </SelectItem>
      );
      // If the category has children, recursively call the function for them
      if (category.children && category.children.length > 0) {
        categoryOptions = categoryOptions.concat(
          generateCategoryOptions(category.children, level + 1)
        );
      }
    }
    return categoryOptions;
  };

  return (
    <Select onValueChange={onValueChange} value={value} required={required}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{generateCategoryOptions(options)}</SelectContent>
    </Select>
  );
};
