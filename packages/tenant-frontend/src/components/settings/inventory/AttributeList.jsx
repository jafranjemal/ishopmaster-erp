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

/**
 * A presentational component to display a list of individual attributes.
 * @param {object} props
 * @param {Array} props.attributes - The array of attribute objects to display.
 * @param {Function} props.onEdit - Callback function to trigger when an edit button is clicked.
 * @param {Function} props.onDelete - Callback function to trigger when a delete button is clicked.
 */
const AttributeList = ({ attributes, onEdit, onDelete }) => {
  return (
    <div className="max-h-96 overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-slate-800">
          <TableRow>
            <TableHead>Attribute Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-slate-400">
                No attributes created yet.
              </TableCell>
            </TableRow>
          ) : (
            attributes.map((attribute) => (
              <TableRow key={attribute._id}>
                <TableCell className="font-medium">{attribute.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(attribute)}
                  >
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(attribute)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttributeList;
