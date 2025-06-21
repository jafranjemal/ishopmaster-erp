import React from "react";
import { FilePenLine, Trash2 } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";

const BrandList = ({ brands, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Brand Name</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {brands.map((brand) => (
        <TableRow key={brand._id}>
          <TableCell className="font-medium">{brand.name}</TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(brand)}>
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(brand)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default BrandList;
