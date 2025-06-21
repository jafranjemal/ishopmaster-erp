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

const CategoryList = ({ categories, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Category Name</TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {categories.map((cat) => (
        <TableRow key={cat._id}>
          <TableCell className="font-medium">{cat.name}</TableCell>
          <TableCell className="text-slate-400">
            {cat.description || "N/A"}
          </TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(cat)}>
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(cat)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
export default CategoryList;
