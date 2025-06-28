import React from "react";
import { Link } from "react-router-dom";
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
import { FilePenLine, Trash2 } from "lucide-react";

const LabelTemplateList = ({ templates, onDelete }) => {
  if (!templates || templates.length === 0) {
    return (
      <div className="text-center p-8 text-slate-400">
        No label templates have been created yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Template Name</TableHead>
          <TableHead>Paper Type</TableHead>
          <TableHead>Label Size (W x H)</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template._id}>
            <TableCell className="font-medium">
              <Link
                to={`/settings/printing/${template._id}`}
                className="hover:text-indigo-300 hover:underline"
              >
                {template.name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {template.paperType}
              </Badge>
            </TableCell>
            <TableCell className="text-slate-400 font-mono">
              {template.labelWidth}mm x {template.labelHeight}mm
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Link to={`/settings/printing/${template._id}`}>
                <Button variant="ghost" size="icon" aria-label="Edit Template">
                  <FilePenLine className="h-4 w-4" />
                </Button>
              </Link>
              {!template.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(template)}
                  aria-label="Delete Template"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LabelTemplateList;
