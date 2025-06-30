import { useState } from "react";

/**
 * A custom React Hook to manage the state of a label template object.
 * Provides a flexible updater function that can modify root-level properties
 * or properties of nested content elements.
 *
 * @param {object | null} initialState - The initial template object.
 * @returns {[object | null, Function, Function]} A tuple containing:
 * - template: The current state of the template.
 * - updateTemplateProperty: The function to update properties.
 * - setTemplate: The raw state setter from useState.
 */
const useLabelTemplate = (initialState) => {
  const [template, setTemplate] = useState(initialState);

  /**
   * Updates a property on the template.
   * If an `elementId` is provided, it updates a specific element in the `content` array.
   * Otherwise, it updates a root-level property of the template.
   *
   * @param {string} field - The name of the property to update (e.g., 'labelWidth', 'x').
   * @param {*} value - The new value for the property.
   * @param {string | null} [elementId=null] - The ID of the content element to update.
   */
  const updateTemplateProperty = (field, value, elementId = null) => {
    setTemplate((prevTemplate) => {
      if (!prevTemplate) return null;

      // --- Scenario 1: Update a property on a nested content element ---
      if (elementId) {
        const newContent = prevTemplate.content.map((element) => {
          // Find the matching element and return a new object with the updated field
          if (element.id === elementId) {
            return { ...element, [field]: value };
          }
          return element;
        });

        // Return the full template object with the modified content array
        return { ...prevTemplate, content: newContent };
      }

      // --- Scenario 2: Update a top-level property on the template itself ---
      else {
        // Return a new template object with the updated root-level field
        return { ...prevTemplate, [field]: value };
      }
    });
  };

  return [template, updateTemplateProperty, setTemplate];
};

export default useLabelTemplate;
