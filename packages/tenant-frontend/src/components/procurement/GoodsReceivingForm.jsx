// import React, { useState, useMemo } from "react";
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
// import { CheckCircle } from "lucide-react";
// import useAuth from "../../context/useAuth";
// const GoodsReceivingForm = ({ purchaseOrder, onReceive, isSaving }) => {
//   const { formatCurrency } = useAuth(); // Adjust import based on your project structure
//   const [receivedItems, setReceivedItems] = useState({});

//   const itemsToReceive = useMemo(
//     () =>
//       purchaseOrder.items.filter(
//         (item) => item.quantityOrdered > item.quantityReceived
//       ),
//     [purchaseOrder.items]
//   );

//   const handleQuantityChange = (poItemId, variant, value) => {
//     const qty = parseInt(value, 10) || 0;
//     const poItem = itemsToReceive.find((item) => item._id === poItemId);
//     const maxQty = poItem.quantityOrdered - poItem.quantityReceived;
//     const validatedQty = Math.max(0, Math.min(qty, maxQty));
//     const key = `${poItemId}-${variant._id}`;

//     setReceivedItems((prev) => ({
//       ...prev,
//       [key]: {
//         productVariantId: poItem.productVariantId._id,
//         quantityReceived: validatedQty,
//         type: variant.templateId.type,
//         serials:
//           variant.templateId.type === "serialized"
//             ? Array(validatedQty).fill("")
//             : [],
//         // Add fields for optional price overrides
//         sellingPrice: variant.defaultSellingPrice,
//         overrideSellingPrice: "",
//       },
//     }));
//   };

//   const handleSerialChange = (poItemId, serialIndex, value) => {
//     setReceivedItems((prev) => {
//       const newSerials = [...prev[poItemId].serials];
//       newSerials[serialIndex] = value.toUpperCase().trim();
//       return {
//         ...prev,
//         [poItemId]: { ...prev[poItemId], serials: newSerials },
//       };
//     });
//   };

//   const handlePriceChange = (poItemId, field, value) => {
//     setReceivedItems((prev) => ({
//       ...prev,
//       [poItemId]: { ...prev[poItemId], [field]: value },
//     }));
//   };

//   const isFormValidO = () => {
//     return Object.values(receivedItems).every(
//       (item) =>
//         item.type === "serialized" ||
//         !item.serials ||
//         (item.serials.length === item.quantityReceived &&
//           item.serials.every((s) => s.trim() !== ""))
//     );
//   };

//   const isFormValid = () => {
//     return Object.values(receivedItems).every((item, index) => {
//       console.log(`Checking item ${index}:`, item);

//       if (!item.serials || item.type !== "serialized") {
//         console.log(`✅ Item ${index}: No serials required.`);
//         return true;
//       }

//       const correctLength = item.serials.length === item.quantityReceived;
//       const allFilled = item.serials.every((s) => {
//         const isValid = s.trim() !== "";
//         console.log(`Serial "${s}" trimmed: "${s.trim()}", valid: ${isValid}`);
//         return isValid;
//       });

//       console.log(
//         `Item ${index}: serials length valid? ${correctLength}, all filled? ${allFilled}`
//       );

//       return correctLength && allFilled;
//     });
//   };

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

//   return (
//     <Card className="mt-8">
//       <CardHeader>
//         <CardTitle>Receive Items into Stock </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Product</TableHead>
//                 <TableHead>To Receive</TableHead>
//                 <TableHead>Selling Price (Optional)</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {itemsToReceive.map((item) => {
//                 const currentEntry = receivedItems[item._id];
//                 console.log(`Rendering item:`, item);
//                 const variant = item.productVariantId;
//                 return (
//                   <React.Fragment key={item._id}>
//                     <TableRow>
//                       <TableCell className="font-medium">
//                         {item.description}
//                       </TableCell>
//                       <TableCell>
//                         <Input
//                           type="number"
//                           max={item.quantityOrdered - item.quantityReceived}
//                           min="0"
//                           className="h-8 w-20"
//                           value={
//                             receivedItems[`${item._id}-${variant._id}`]
//                               ?.quantityReceived || ""
//                           }
//                           onChange={(e) =>
//                             handleQuantityChange(
//                               item._id,
//                               variant,
//                               e.target.value
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         {variant.templateId.type !== "serialized" && (
//                           <Input
//                             type="number"
//                             placeholder={
//                               variant.sellingPrice
//                                 ? `Default Selling Price: ${formatCurrency(
//                                     variant.sellingPrice
//                                   )}`
//                                 : "Default Selling Price: N/A"
//                             }
//                             onChange={(e) =>
//                               handlePriceChange(
//                                 item._id,
//                                 "sellingPrice",
//                                 e.target.value
//                               )
//                             }
//                             className="h-8 w-32"
//                           />
//                         )}
//                       </TableCell>
//                     </TableRow>
//                     {variant.templateId.type === "serialized" &&
//                       currentEntry?.quantityReceived > 0 && (
//                         <TableRow className="bg-slate-900/50">
//                           <TableCell colSpan={3} className="p-4">
//                             <div className="space-y-2">
//                               <Label className="font-semibold mb-2 block">
//                                 Enter Serial Numbers & Optional Override Prices:
//                               </Label>
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
//                                 {[...Array(currentEntry.quantityReceived)].map(
//                                   (_, i) => (
//                                     <div
//                                       key={i}
//                                       className="flex items-center gap-2"
//                                     >
//                                       <Input
//                                         placeholder={`Serial #${i + 1}`}
//                                         value={currentEntry.serials[i] || ""}
//                                         onChange={(e) =>
//                                           handleSerialChange(
//                                             item._id,
//                                             i,
//                                             e.target.value
//                                           )
//                                         }
//                                         required
//                                         className="h-8 flex-grow"
//                                       />
//                                       <Input
//                                         type="number"
//                                         placeholder="Override Price"
//                                         onChange={(e) =>
//                                           handlePriceChange(
//                                             item._id,
//                                             "overrideSellingPrice",
//                                             e.target.value
//                                           )
//                                         }
//                                         className="h-8 w-32"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                   </React.Fragment>
//                 );
//               })}
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
import useAuth from "../../context/useAuth";

const GoodsReceivingForm = ({ purchaseOrder, onReceive, isSaving }) => {
  const { formatCurrency } = useAuth();
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
    const variantId = variant._id;

    setReceivedItems((prev) => ({
      ...prev,
      [variantId]: {
        productVariantId: variantId,
        quantityReceived: validatedQty,
        type: variant.templateId.type,
        serials:
          variant.templateId.type === "serialized"
            ? Array(validatedQty).fill("")
            : [],
        sellingPrice: variant.defaultSellingPrice,
        overrideSellingPrice: "",
      },
    }));
  };

  const handleSerialChange = (variantId, serialIndex, value) => {
    setReceivedItems((prev) => {
      const newSerials = [...prev[variantId].serials];
      newSerials[serialIndex] = value.toUpperCase().trim();
      return {
        ...prev,
        [variantId]: { ...prev[variantId], serials: newSerials },
      };
    });
  };

  const handlePriceChange = (variantId, field, value) => {
    setReceivedItems((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value },
    }));
  };

  const isFormValid = () => {
    return Object.values(receivedItems).every((item) => {
      if (item.quantityReceived <= 0) return true;
      if (item.type !== "serialized") return true;
      if (!item.serials || item.serials.length !== item.quantityReceived)
        return false;
      return item.serials.every((s) => s.trim() !== "");
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please ensure all serial numbers are entered correctly.");
      return;
    }
    const itemsToSubmit = Object.values(receivedItems).filter(
      (item) => item.quantityReceived > 0
    );
    if (itemsToSubmit.length === 0) {
      alert("No items selected for receipt.");
      return;
    }
    onReceive({ receivedItems: itemsToSubmit });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Receive Items into Stock</CardTitle>
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
                const variant = item.productVariantId;
                const variantId = variant._id;
                const currentEntry = receivedItems[variantId];
                return (
                  <React.Fragment key={variantId}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder={`Max Qty: ${
                            item.quantityOrdered - item.quantityReceived
                          }`}
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
                            placeholder={`Default Selling Price: ${formatCurrency(
                              variant.sellingPrice
                            )}`}
                            onChange={(e) =>
                              handlePriceChange(
                                variantId,
                                "overrideSellingPrice",
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
                                            variantId,
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
                                            variantId,
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
