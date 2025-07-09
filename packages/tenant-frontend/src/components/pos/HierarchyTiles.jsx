import React, { useState, useEffect } from "react";
import { Card } from "ui-library";
import { ChevronRight, Folder } from "lucide-react";
import { cn } from "ui-library/lib/utils";

const HierarchyTiles = ({ categories = [], onFilterChange }) => {
  const [path, setPath] = useState([]); // Array of { _id, name } objects
  const [currentItems, setCurrentItems] = useState([]);

  // Initialize with top-level categories
  useEffect(() => {
    setCurrentItems(categories.filter((c) => !c.parent));
  }, [categories]);

  const handleTileClick = (item) => {
    if (item.children && item.children.length > 0) {
      setPath((prev) => [...prev, { _id: item._id, name: item.name }]);
      setCurrentItems(item.children);
    } else {
      // This is a leaf node, apply the filter
      onFilterChange({ categoryId: item._id });
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index < 0) {
      // Go back to root
      setPath([]);
      setCurrentItems(categories.filter((c) => !c.parent));
      onFilterChange({}); // Clear filter
      return;
    }

    const newPath = path.slice(0, index + 1);
    setPath(newPath);

    // Find the new current items from the full tree
    let items = categories;
    for (const part of newPath) {
      const found = items.find((i) => i._id === part._id);
      items = found?.children || [];
    }
    setCurrentItems(items);
    onFilterChange({ categoryId: newPath[newPath.length - 1]._id });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-slate-400">
        <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:text-white">
          All Categories
        </span>
        {path.map((part, index) => (
          <React.Fragment key={part._id}>
            <ChevronRight className="h-4 w-4" />
            <span onClick={() => handleBreadcrumbClick(index)} className="cursor-pointer hover:text-white">
              {part.name}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Tiles Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {currentItems.map((item) => (
          <Card
            key={item._id}
            onClick={() => handleTileClick(item)}
            className="aspect-square flex flex-col items-center justify-center text-center p-2 cursor-pointer bg-slate-700 hover:bg-indigo-600/30 hover:border-indigo-500 transition-all duration-150"
          >
            <Folder className="h-8 w-8 text-indigo-400 mb-2" />
            <p className="text-xs font-semibold leading-tight line-clamp-2">{item.name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HierarchyTiles;
