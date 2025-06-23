import React from "react";
import { FilePenLine, Trash2, CheckCircle2 } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "ui-library";

const CurrencyList = ({ currencies, baseCurrency, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Code</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Symbol</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {currencies.map((currency) => {
        const isBase = currency.code === baseCurrency;
        return (
          <TableRow key={currency._id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {currency.code}
                {isBase && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Base
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{currency.name}</TableCell>
            <TableCell className="text-slate-400">{currency.symbol}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(currency)}
              >
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(currency)}
                disabled={isBase}
              >
                <Trash2
                  className={`h-4 w-4 ${
                    isBase ? "text-slate-600" : "text-red-500"
                  }`}
                />
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
export default CurrencyList;
