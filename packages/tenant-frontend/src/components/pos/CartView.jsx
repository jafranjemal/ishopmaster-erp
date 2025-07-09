// import React from "react";
// import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input } from "ui-library";
// import { Trash2 } from "lucide-react";
// import useAuth from "../../context/useAuth";

// const CartView = ({ items, onRemoveItem, onQuantityChange }) => {
//   const { formatCurrency } = useAuth();
//   return (
//     <div className="border border-slate-700 rounded-lg overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Product</TableHead>
//             <TableHead className="w-24 text-center">Qty</TableHead>
//             <TableHead className="w-32 text-right">Price</TableHead>
//             <TableHead className="w-12"></TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {items.length === 0 && (
//             <TableRow>
//               <TableCell colSpan={4} className="text-center h-48 text-slate-400">
//                 Cart is empty
//               </TableCell>
//             </TableRow>
//           )}
//           {items.map((item) => (
//             <TableRow key={item.cartId}>
//               <TableCell className="font-medium">{item.variantName}</TableCell>
//               <TableCell>
//                 <Input
//                   type="number"
//                   value={item.quantity}
//                   onChange={(e) => onQuantityChange(item.cartId, e.target.value)}
//                   className="h-8 w-20 text-center"
//                 />
//               </TableCell>
//               <TableCell className="text-right font-mono">{formatCurrency(item.finalPrice * item.quantity)}</TableCell>
//               <TableCell>
//                 <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.cartId)}>
//                   <Trash2 className="h-4 w-4 text-red-500" />
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };
// export default CartView;

import React from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input } from "ui-library";
import { Trash2 } from "lucide-react";
import useAuth from "../../context/useAuth";

const CartView = ({ items, onRemoveItem, onQuantityChange }) => {
  const { formatCurrency } = useAuth();
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="w-24 text-center">Qty</TableHead>
              <TableHead className="w-32 text-right">Price</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-48 text-slate-400">
                  Cart is empty
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.cartId}>
                <TableCell className="font-medium">{item.variantName}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(item.cartId, e.target.value)}
                    className="h-8 w-20 text-center bg-slate-700"
                    min="1"
                  />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.finalPrice * item.quantity)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.cartId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default CartView;
