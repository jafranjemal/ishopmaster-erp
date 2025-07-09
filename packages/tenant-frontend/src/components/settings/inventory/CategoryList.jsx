import React from "react";
import { FilePenLine, Trash2, PlusCircle } from "lucide-react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";

const CategoryRow = ({ category, level, onEdit, onDelete, onAddChild }) => {
  const indentation = "\u00A0".repeat(level * 4);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <TableRow key={category._id} className="group">
        <TableCell className="font-medium">
          <span className="text-slate-500 mr-2">
            {indentation}
            {level > 0 ? "↳" : ""}
          </span>
          {category.name}
        </TableCell>
        <TableCell className="text-slate-400">{category.description || "N/A"}</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            {/* The new "Add Sub-category" button, which becomes visible on hover */}
            <Button variant="ghost" size="icon" onClick={() => onAddChild(category._id)} title="Add Sub-category">
              <PlusCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(category)} title="Edit">
              <FilePenLine className="h-4 w-4" />
            </Button>
            {!hasChildren && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(category)} title="Delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {hasChildren &&
        category.children.map((child) => (
          <CategoryRow
            key={child._id}
            category={child}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild} // Pass the handler down recursively
          />
        ))}
    </>
  );
};

const CategoryList = ({ categories, onEdit, onDelete, onAddChild }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Category Name</TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {categories.length > 0 ? (
        categories.map((rootCategory) => <CategoryRow key={rootCategory._id} category={rootCategory} level={0} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />)
      ) : (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-slate-500">
            No categories found. Click "New Category" to begin.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

export default CategoryList;
