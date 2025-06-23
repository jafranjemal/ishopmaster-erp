import React from "react";
import { Trash2, ArrowRight } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import useAuth from "../../../context/useAuth";

const ExchangeRateList = ({ rates, onDelete }) => {
  const { formatDate } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>From</TableHead>
          <TableHead></TableHead>
          <TableHead>To</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rates.map((rate) => (
          <TableRow key={rate._id}>
            <TableCell>{formatDate(rate.date)}</TableCell>
            <TableCell>{rate.fromCurrency}</TableCell>
            <TableCell>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </TableCell>
            <TableCell>{rate.toCurrency}</TableCell>
            <TableCell className="font-mono">{rate.rate}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(rate)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default ExchangeRateList;
