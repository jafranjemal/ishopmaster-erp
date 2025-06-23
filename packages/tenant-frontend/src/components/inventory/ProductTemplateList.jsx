import React from "react";
import { Link } from "react-router-dom";
import { FilePenLine, Trash2, Package } from "lucide-react";
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

const ProductTemplateList = ({ templates, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Template Name</TableHead>
        <TableHead>Brand</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Type</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {templates.map((template) => (
        <TableRow key={template._id}>
          <TableCell className="font-medium">
            {/* The name links to the future detail page where we'll generate variants */}
            <Link
              to={`/inventory/products/templates/${template._id}`}
              className="hover:text-indigo-300 hover:underline"
            >
              {template.baseName}
            </Link>
          </TableCell>
          <TableCell className="text-slate-400">
            {template.brandId?.name || "N/A"}
          </TableCell>
          <TableCell className="text-slate-400">
            {template.categoryId?.name || "N/A"}
          </TableCell>
          <TableCell>
            <Badge variant="secondary" className="capitalize">
              {template.type}
            </Badge>
          </TableCell>
          <TableCell className="text-right space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(template)}
            >
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(template)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default ProductTemplateList;
