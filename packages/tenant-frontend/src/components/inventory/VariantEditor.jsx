import React, { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import { toast } from "react-hot-toast";
import { tenantProductService } from "../../services/api";

const VariantEditor = ({ variants }) => {
  const [editedVariants, setEditedVariants] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedVariants({});
  }, [variants]);

  const handleChange = (variantId, field, value) => {
    setEditedVariants((prev) => ({
      ...prev,
      [variantId]: {
        ...variants.find((v) => v._id === variantId), // Start with original data
        ...prev[variantId], // Apply previous edits for this variant
        [field]: value, // Apply the new change
      },
    }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    const variantsToUpdate = Object.values(editedVariants).map((v) => ({
      _id: v._id,
      sku: v.sku,
      sellingPrice: v.sellingPrice,
      costPrice: v.costPrice,
    }));

    // This is a placeholder until we build the bulk update API
    await toast.promise(
      tenantProductService.bulkUpdateVariants(variantsToUpdate),
      {
        loading: "Saving changes...",
        success: "Variants updated successfully!",
        error: "Could not save changes.",
      }
    );

    setIsSaving(false);
    setEditedVariants({}); // Clear changes after saving
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Cost Price</TableHead>
            <TableHead>Selling Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant._id}>
              <TableCell className="font-medium text-slate-300">
                {variant.variantName &&
                  variant.variantName.length > 0 &&
                  variant.variantName.split(" - ").map((name, index) => {
                    if (index === 0) {
                      return (
                        <span
                          key={index}
                          className="mr-2 text-slate-100 font-semibold"
                        >
                          {name}
                        </span>
                      );
                    }
                    return (
                      <Badge
                        key={index}
                        className="mr-1 mb-1 bg-slate-700 text-slate-100 border-slate-500"
                      >
                        {name}
                      </Badge>
                    );
                  })}
              </TableCell>

              <TableCell>
                <Input
                  defaultValue={variant.sku}
                  onChange={(e) =>
                    handleChange(variant._id, "sku", e.target.value)
                  }
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  defaultValue={variant.costPrice}
                  onChange={(e) =>
                    handleChange(variant._id, "costPrice", e.target.value)
                  }
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  defaultValue={variant.sellingPrice}
                  onChange={(e) =>
                    handleChange(variant._id, "sellingPrice", e.target.value)
                  }
                  className="h-8"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="pt-4 text-right">
        <Button
          onClick={handleSaveClick}
          disabled={isSaving || Object.keys(editedVariants).length === 0}
        >
          {isSaving ? "Saving Changes..." : "Save All Variant Changes"}
        </Button>
      </div>
    </div>
  );
};

export default VariantEditor;
