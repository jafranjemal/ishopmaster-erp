import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
} from "ui-library";

/**
 * A component that allows users to select attribute values to generate or synchronize product variants.
 * It intelligently pre-selects options based on already existing active variants.
 * @param {Object} props
 * @param {Array} props.attributes - The list of attributes with their values, e.g., [{ key: 'color', name: 'Color', values: ['Red', 'Blue'] }]
 * @param {Array} props.existingVariants - A list of variants that already exist for the template.
 * @param {Function} props.onGenerate - The callback to execute when the 'Update' button is clicked.
 * @param {boolean} props.isGenerating - Flag to disable the button while processing.
 */
const VariantOptionSelector = ({
  attributes = [],
  existingVariants = [],
  onGenerate,
  isGenerating,
}) => {
  const { t } = useTranslation();

  /**
   * Calculates the initial state of selected options based on variants that are already active.
   * This version correctly maps the attribute NAME from the variant to the attribute KEY from the template attributes.
   */
  const getInitialState = () => {
    const initialState = {};
    const activeVariants = existingVariants.filter((v) => v.isActive);
    console.log("Active Variants:", activeVariants);
    console.log("Attributes:", attributes);
    // Loop through the official attributes list (the source of truth for keys)
    for (const attribute of attributes) {
      //const attrKey = attribute.key; // e.g., "color"
      const attrName = attribute.name; // e.g., "Color"

      const valuesForThisAttr = new Set();

      // For each official attribute, check all existing variants
      for (const variant of activeVariants) {
        // Check if the variant has a value for this attribute's NAME
        if (variant.attributes && variant.attributes[attrName]) {
          console.log(
            "Processing attribute:",
            attrName,
            "with key:",
            variant.attributes[attrName]
          );
          valuesForThisAttr.add(variant.attributes[attrName]);
        }
      }

      if (valuesForThisAttr.size > 0) {
        initialState[attrName] = Array.from(valuesForThisAttr);
      }
    }
    return initialState;
  };

  const [selectedOptions, setSelectedOptions] = useState(getInitialState);

  // This effect re-initializes the state if the component is shown again
  // (e.g., modal is closed and reopened) with different data.
  useEffect(() => {
    setSelectedOptions(getInitialState());
  }, [existingVariants, attributes]);

  /**
   * Handles toggling a checkbox and updating the selection state.
   */
  const handleCheckboxChange = (attributeKey, value) => {
    setSelectedOptions((prev) => {
      const currentValues = prev[attributeKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      if (newValues.length === 0) {
        const { [attributeKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [attributeKey]: newValues };
    });
  };

  /**
   * Calls the parent handler with the final selection.
   */
  const handleSubmit = () => {
    onGenerate(selectedOptions);
  };

  return (
    <div className="p-1">
      <CardHeader className="px-0 pt-0">
        <CardTitle>{t("variant_selector.manage_title")}</CardTitle>
        <p className="text-sm text-slate-400">
          {t("variant_selector.manage_subtitle")}
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-0">
        {attributes.map((attr) => (
          <div
            key={attr.key || attr._id}
            className="p-4 border border-slate-700 rounded-lg"
          >
            <h3 className="font-semibold text-slate-100 mb-3">{attr.name}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {attr.values.map((value) => (
                <label
                  key={value}
                  className={`flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer
    ${
      selectedOptions[attr.name]?.includes(value)
        ? "bg-indigo-600/30 hover:bg-indigo-600/50"
        : "hover:bg-slate-700/50"
    }
  `}
                >
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(attr.name, value)}
                    checked={
                      selectedOptions[attr.name]?.includes(value) || false
                    }
                    className="h-5 w-5 rounded border-slate-500 bg-slate-700 text-lime-400 focus:ring-lime-500"
                  />
                  <span className="text-sm font-medium text-slate-100">
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end px-0 pb-0 pt-6">
        <Button onClick={handleSubmit} disabled={isGenerating}>
          {isGenerating
            ? t("common.buttons.saving")
            : t("variant_selector.update_button")}
        </Button>
      </CardFooter>
    </div>
  );
};

export default VariantOptionSelector;
