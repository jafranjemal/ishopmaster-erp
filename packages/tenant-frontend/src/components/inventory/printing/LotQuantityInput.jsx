import React, { useState, useEffect } from "react";
import { Input } from "ui-library";
import { tenantStockService } from "../../../services/api";
import useAuth from "../../../context/useAuth";

/**
 * A "smart" input component that fetches the max available stock for a product lot
 * and validates user input against it.
 * @param {object} props
 * @param {string} props.ProductVariantsId - The ID of the product variant.
 * @param {string} props.branchId - The ID of the branch where stock is located.
 * @param {number} props.value - The current quantity value from the parent state.
 * @param {Function} props.onChange - Callback function to update the parent state.
 */
const LotQuantityInput = ({ ProductVariantsId, branchId, value, onChange }) => {
  const [maxQuantity, setMaxQuantity] = useState(Infinity);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const fetchAvailableQuantity = async () => {
      await tenantStockService
        .getLotQuantity(ProductVariantsId, user.branchId)
        .then(async (response) => {
          console.log(response.data);
          setMaxQuantity(response.data.data.availableQuantity);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch max quantity", error);
          setMaxQuantity(0); // Default to 0 on error
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    if (ProductVariantsId && user.branchId) {
      setIsLoading(true);
      fetchAvailableQuantity();
    }
  }, [ProductVariantsId, user.branchId]);

  const handleQuantityChange = (e) => {
    let newQuantity = parseInt(e.target.value, 10);

    // Prevent invalid or empty input from becoming NaN
    if (isNaN(newQuantity)) {
      newQuantity = "";
    } else {
      // Enforce the maximum quantity
      if (newQuantity > maxQuantity) {
        newQuantity = maxQuantity;
      }
      // Enforce the minimum quantity
      if (newQuantity < 1 && e.target.value !== "") {
        newQuantity = 1;
      }
    }

    onChange(newQuantity);
  };

  return (
    <div>
      <Input
        type="number"
        value={value}
        onChange={handleQuantityChange}
        min="1"
        max={maxQuantity}
        disabled={isLoading}
        className="w-24 h-8 text-right"
        placeholder={isLoading ? "..." : "Qty"}
      />
      {!isLoading && <p className="text-xs text-slate-500 text-right mt-1">Max: {maxQuantity}</p>}
    </div>
  );
};

export default LotQuantityInput;
