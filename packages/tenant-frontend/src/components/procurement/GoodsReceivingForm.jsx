// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Input,
//   Label,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "ui-library";
// import { Check, CheckCircle, X } from "lucide-react";
// import useAuth from "../../context/useAuth";

// const GoodsReceivingForm = ({ purchaseOrder, onReceive, isSaving }) => {
//   const [receivedItems, setReceivedItems] = useState({});
//   const { tenantProfile, formatDate, formatCurrency } = useAuth();

//   // --- REFACTOR STEP 1: Initialize state with default selling price ---
//   // When the component loads, pre-populate the state with default values.
//   useEffect(() => {
//     const initialState = {};
//     purchaseOrder.items.forEach((item) => {
//       // Pre-fill the selling price with the variant's default selling price
//       const defaultSellingPrice = item.productVariantId?.sellingPrice || 0;
//       initialState[item._id] = {
//         productVariantId: item.productVariantId._id,
//         quantityReceived: 0,
//         sellingPrice: defaultSellingPrice, // For non-serialized
//         serials: [], // For serialized
//       };
//     });
//     setReceivedItems(initialState);
//   }, [purchaseOrder]);

//   const handleQuantityChange = (poItemId, variantType, value) => {
//     const qty = parseInt(value, 10) || 0;
//     const poItem = purchaseOrder.items.find((item) => item._id === poItemId);
//     const maxQty = poItem.quantityOrdered - poItem.quantityReceived;
//     const validatedQty = Math.max(0, Math.min(qty, maxQty));

//     // --- REFACTOR STEP 2: Update state structure for serials ---
//     setReceivedItems((prev) => ({
//       ...prev,
//       [poItemId]: {
//         ...prev[poItemId],
//         quantityReceived: validatedQty,
//         // For serialized items, create an array of objects
//         serials:
//           variantType === "serialized"
//             ? Array(validatedQty).fill({
//                 serialNumber: "",
//                 overrideSellingPrice: "",
//               })
//             : [],
//       },
//     }));
//   };

//   // --- NEW STEP 3: Add a handler for price changes ---
//   const handlePriceChange = (poItemId, value, serialIndex = null) => {
//     const price = parseFloat(value) || 0;
//     setReceivedItems((prev) => {
//       const currentItem = { ...prev[poItemId] };

//       if (serialIndex !== null) {
//         // It's a serialized item's override price
//         const newSerials = [...currentItem.serials];
//         newSerials[serialIndex] = {
//           ...newSerials[serialIndex],
//           overrideSellingPrice: price,
//         };
//         currentItem.serials = newSerials;
//       } else {
//         // It's a non-serialized item's batch price
//         currentItem.sellingPrice = price;
//       }

//       return {
//         ...prev,
//         [poItemId]: currentItem,
//       };
//     });
//   };

//   // --- REFACTOR STEP 4: Update serial change handler ---
//   const handleSerialChange = (poItemId, serialIndex, value) => {
//     setReceivedItems((prev) => {
//       const newSerials = [...prev[poItemId].serials];
//       // Update only the serialNumber property of the serial object
//       newSerials[serialIndex] = {
//         ...newSerials[serialIndex],
//         serialNumber: value.toUpperCase(),
//       };
//       return {
//         ...prev,
//         [poItemId]: { ...prev[poItemId], serials: newSerials },
//       };
//     });
//   };

//   const isFormValid = () => {
//     return Object.values(receivedItems).every(
//       (item) =>
//         !item.serials ||
//         (item.serials.length === item.quantityReceived &&
//           item.serials.every(
//             (s) => s.serialNumber && s.serialNumber.trim() !== ""
//           ))
//     );
//   };

//   // --- REFACTOR STEP 5: Update submission logic ---
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!isFormValid()) {
//       alert("Please fill in all required serial numbers.");
//       return;
//     }
//     const itemsToSubmit = Object.values(receivedItems).filter(
//       (item) => item.quantityReceived > 0
//     );
//     onReceive({ receivedItems: itemsToSubmit });
//   };

//   const hasNonSerialized = purchaseOrder.items.some(
//     (item) => item.productVariantId.templateId?.type === "non-serialized"
//   );

//   return (
//     <Card className="mt-8">
//       <CardHeader>
//         <CardTitle>Receive Items into Stock</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Ordered</TableHead>
//                 <TableHead>Received</TableHead>
//                 <TableHead>To Receive</TableHead>
//                 {hasNonSerialized && (
//                   <TableHead>Selling Price (for this batch)</TableHead>
//                 )}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {purchaseOrder.items.map((item) => {
//                 const remainingQty =
//                   item.quantityOrdered - item.quantityReceived;
//                 if (remainingQty <= 0) return null;

//                 const variantType = item.productVariantId.templateId?.type;
//                 const currentEntry = receivedItems[item._id];

//                 return (
//                   <React.Fragment key={item._id}>
//                     <TableRow>
//                       <TableCell className="font-medium text-slate-100">
//                         {item.description}
//                       </TableCell>
//                       <TableCell className="text-center">
//                         {item.quantityOrdered}
//                       </TableCell>
//                       <TableCell className="text-center">
//                         {item.quantityReceived}
//                       </TableCell>

//                       <TableCell>
//                         <Input
//                           type="number"
//                           max={remainingQty}
//                           min="0"
//                           className="h-8 w-24"
//                           value={currentEntry?.quantityReceived || ""}
//                           onChange={(e) =>
//                             handleQuantityChange(
//                               item._id,
//                               variantType,
//                               e.target.value
//                             )
//                           }
//                         />
//                       </TableCell>

//                       {/* Batch price input for non-serialized */}
//                       <TableCell>
//                         {variantType === "non-serialized" && (
//                           <div className="relative group">
//                             <Input
//                               type="number"
//                               placeholder="Batch Price"
//                               className="h-8 w-32 pl-6"
//                               value={currentEntry?.sellingPrice || ""}
//                               onChange={(e) =>
//                                 handlePriceChange(item._id, e.target.value)
//                               }
//                             />
//                             <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
//                               {tenantProfile?.settings?.localization
//                                 ?.baseCurrency || "USD"}
//                             </span>
//                             <div className="absolute -top-6 left-0 hidden group-hover:block bg-slate-800 text-xs text-slate-200 rounded px-2 py-1">
//                               Set selling price for this batch
//                             </div>
//                           </div>
//                         )}
//                       </TableCell>
//                     </TableRow>

//                     {/* Serialized inputs */}
//                     {variantType === "serialized" &&
//                       currentEntry?.quantityReceived > 0 && (
//                         <TableRow className="bg-slate-900/50">
//                           <TableCell colSpan={5} className="p-4">
//                             <Label className="font-semibold mb-2 block">
//                               Serial Numbers & Prices:
//                             </Label>
//                             <div className="grid grid-rows-1 md:grid-rows-2 gap-x-4 gap-y-2">
//                               {[...Array(currentEntry.quantityReceived)].map(
//                                 (_, i) => (
//                                   <div
//                                     key={i}
//                                     className="flex items-center gap-2"
//                                   >
//                                     <div className="relative group">
//                                       <Input
//                                         placeholder={`Serial #${i + 1}`}
//                                         className="h-8 w-32"
//                                         value={
//                                           currentEntry.serials[i]
//                                             ?.serialNumber || ""
//                                         }
//                                         onChange={(e) =>
//                                           handleSerialChange(
//                                             item._id,
//                                             i,
//                                             e.target.value
//                                           )
//                                         }
//                                         required
//                                       />
//                                       {currentEntry.serials[i]?.serialNumber ? (
//                                         <Check className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 h-4 w-4" />
//                                       ) : (
//                                         <X className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 h-4 w-4" />
//                                       )}
//                                       <div className="absolute -top-6 left-0 hidden group-hover:block bg-slate-800 text-xs text-slate-200 rounded px-2 py-1">
//                                         Enter serial number
//                                       </div>
//                                     </div>

//                                     <div className="relative group">
//                                       <Input
//                                         type="number"
//                                         placeholder="Override Price"
//                                         className="h-8 w-32 pl-6 text-right"
//                                         value={
//                                           currentEntry.serials[i]
//                                             ?.overrideSellingPrice || ""
//                                         }
//                                         onChange={(e) =>
//                                           handlePriceChange(
//                                             item._id,
//                                             e.target.value,
//                                             i
//                                           )
//                                         }
//                                       />
//                                       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
//                                         {tenantProfile?.settings?.localization
//                                           ?.baseCurrency || "USD"}
//                                       </span>
//                                       <div className="absolute -top-6 left-0 hidden group-hover:block bg-slate-800 text-xs text-slate-200 rounded px-2 py-1">
//                                         Optional price override
//                                       </div>
//                                     </div>
//                                   </div>
//                                 )
//                               )}
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                   </React.Fragment>
//                 );
//               })}

//               {/* Bonus: total row */}
//               {/* <TableRow className="bg-slate-900/30">
//                 <TableCell colSpan={4} className="font-semibold text-right">
//                   Total (Live)
//                 </TableCell>
//                 <TableCell className="font-semibold">
//                   {formatCurrency(
//                     purchaseOrder.items.reduce((sum, item) => {
//                       const entry = receivedItems[item._id];
//                       const qty = entry?.quantityReceived || 0;
//                       const price =
//                         (item.productVariantId.templateId?.type ===
//                         "non-serialized"
//                           ? entry?.sellingPrice
//                           : 0) || 0;

//                       const serialsTotal = (entry?.serials || []).reduce(
//                         (acc, s) =>
//                           acc + (parseFloat(s.overrideSellingPrice) || 0),
//                         0
//                       );

//                       return sum + qty * price + serialsTotal;
//                     }, 0)
//                   )}
//                 </TableCell>
//               </TableRow> */}
//             </TableBody>
//           </Table>
//           <div className="pt-4 flex justify-end">
//             <Button type="submit" disabled={isSaving || !isFormValid()}>
//               <CheckCircle className="mr-2 h-4 w-4" />
//               {isSaving ? "Processing..." : "Confirm Receipt & Add to Stock"}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default GoodsReceivingForm;

import React, { useState, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "ui-library";
import { CheckCircle } from "lucide-react";

const GoodsReceivingForm = ({ purchaseOrder, onReceive, isSaving }) => {
  const [receivedItems, setReceivedItems] = useState({});

  const itemsToReceive = useMemo(
    () =>
      purchaseOrder.items.filter(
        (item) => item.quantityOrdered > item.quantityReceived
      ),
    [purchaseOrder.items]
  );

  const handleQuantityChange = (poItemId, variant, value) => {
    const qty = parseInt(value, 10) || 0;
    const poItem = itemsToReceive.find((item) => item._id === poItemId);
    const maxQty = poItem.quantityOrdered - poItem.quantityReceived;
    const validatedQty = Math.max(0, Math.min(qty, maxQty));

    setReceivedItems((prev) => ({
      ...prev,
      [poItemId]: {
        productVariantId: poItem.productVariantId._id,
        quantityReceived: validatedQty,
        serials:
          variant.templateId.type === "serialized"
            ? Array(validatedQty).fill("")
            : [],
        // Add fields for optional price overrides
        sellingPrice: variant.defaultSellingPrice,
        overrideSellingPrice: "",
      },
    }));
  };

  const handleSerialChange = (poItemId, serialIndex, value) => {
    setReceivedItems((prev) => {
      const newSerials = [...prev[poItemId].serials];
      newSerials[serialIndex] = value.toUpperCase().trim();
      return {
        ...prev,
        [poItemId]: { ...prev[poItemId], serials: newSerials },
      };
    });
  };

  const handlePriceChange = (poItemId, field, value) => {
    setReceivedItems((prev) => ({
      ...prev,
      [poItemId]: { ...prev[poItemId], [field]: value },
    }));
  };

  const isFormValid = () => {
    return Object.values(receivedItems).every(
      (item) =>
        !item.serials ||
        (item.serials.length === item.quantityReceived &&
          item.serials.every((s) => s.trim() !== ""))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill in all required serial numbers.");
      return;
    }
    const itemsToSubmit = Object.values(receivedItems).filter(
      (item) => item.quantityReceived > 0
    );
    onReceive({ receivedItems: itemsToSubmit });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Receive Items into Stock </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>To Receive</TableHead>
                <TableHead>Selling Price (Optional)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsToReceive.map((item) => {
                const currentEntry = receivedItems[item._id];
                const variant = item.productVariantId;
                return (
                  <React.Fragment key={item._id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          max={item.quantityOrdered - item.quantityReceived}
                          min="0"
                          className="h-8 w-20"
                          value={currentEntry?.quantityReceived || ""}
                          onChange={(e) =>
                            handleQuantityChange(
                              item._id,
                              variant,
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {variant.templateId.type !== "serialized" && (
                          <Input
                            type="number"
                            placeholder={`Default: ${variant.defaultSellingPrice}`}
                            onChange={(e) =>
                              handlePriceChange(
                                item._id,
                                "sellingPrice",
                                e.target.value
                              )
                            }
                            className="h-8 w-32"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    {variant.templateId.type === "serialized" &&
                      currentEntry?.quantityReceived > 0 && (
                        <TableRow className="bg-slate-900/50">
                          <TableCell colSpan={3} className="p-4">
                            <div className="space-y-2">
                              <Label className="font-semibold mb-2 block">
                                Enter Serial Numbers & Optional Override Prices:
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {[...Array(currentEntry.quantityReceived)].map(
                                  (_, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      <Input
                                        placeholder={`Serial #${i + 1}`}
                                        value={currentEntry.serials[i] || ""}
                                        onChange={(e) =>
                                          handleSerialChange(
                                            item._id,
                                            i,
                                            e.target.value
                                          )
                                        }
                                        required
                                        className="h-8 flex-grow"
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Override Price"
                                        onChange={(e) =>
                                          handlePriceChange(
                                            item._id,
                                            "overrideSellingPrice",
                                            e.target.value
                                          )
                                        }
                                        className="h-8 w-32"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSaving || !isFormValid()}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {isSaving ? "Processing..." : "Confirm Receipt & Add to Stock"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoodsReceivingForm;
