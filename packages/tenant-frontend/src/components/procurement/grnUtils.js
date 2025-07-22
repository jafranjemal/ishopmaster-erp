/**
 * Generates a unique serial number.
 * @param {number} index - The index of the item in the list.
 * @returns {string} The generated serial number.
 */
export const generateSerialNumber = (index) => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SN-${datePart}-${randomPart}-${index + 1}`;
};

/**
 * Validates a serial number format.
 * @param {string} serial - The serial number to validate.
 * @returns {boolean} True if the serial is not empty.
 */
export const isValidSerial = (serial) => {
  // Simple check for non-empty. Can be expanded with regex.
  return serial && serial.trim() !== '';
};

/**
 * Creates the initial state object from purchase order items.
 * @param {Array} itemsToReceive - The filtered list of PO items.
 * @returns {Object} The initial state for the form.
 */
export const getInitialState = (itemsToReceive) => {
  const state = {};
  itemsToReceive.forEach((poItem) => {
    const variant = poItem.productVariantId;
    state[variant._id] = {
      poItemId: poItem._id,
      productVariantId: variant._id,
      type: variant.templateId.type,
      description: poItem.description,
      maxQty: poItem.quantityOrdered - poItem.quantityReceived,
      defaultSellingPrice: variant.sellingPrice,
      quantity: 0,
      overridePrice: '', // For non-serialized items
      serials: [], // For serialized items: { number: string, sellingPrice: string }[]
    };
  });
  return state;
};

/**
 * Checks if the entire form is valid and ready for submission.
 * @param {Object} receivedItems - The current state of all items.
 * @returns {boolean} True if the form is valid.
 */
export const isFormFullyValid = (receivedItems) => {
  return Object.values(receivedItems).every((item) => {
    if (item.quantity <= 0) return true; // Ignore rows not being received
    if (item.type !== 'serialized') return true; // Non-serialized are always valid if quantity > 0

    // For serialized items, check if all serial numbers are filled in
    return item.serials.every((s) => isValidSerial(s.number));
  });
};

/**
 * Transforms the internal state into the required submission payload.
 * @param {Object} receivedItems - The current state of all items.
 * @returns {Object} The payload for the onReceive callback.
 */
export const createSubmissionPayload = (receivedItems) => {
  const itemsToSubmit = Object.values(receivedItems)
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const baseData = {
        productVariantId: item.productVariantId,
        quantityReceived: item.quantity,
      };

      if (item.type === 'serialized') {
        return {
          ...baseData,
          type: 'serialized',
          serials: item.serials.map((s) => ({
            number: s.number,
            sellingPrice: parseFloat(s.sellingPrice) || item.defaultSellingPrice,
          })),
        };
      } else {
        return {
          ...baseData,
          type: 'non-serialized',
          sellingPrice: parseFloat(item.overridePrice) || item.defaultSellingPrice,
        };
      }
    });

  return { receivedItems: itemsToSubmit };
};
