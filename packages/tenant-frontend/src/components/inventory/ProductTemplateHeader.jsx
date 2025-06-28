import React from "react";
import StatCard from "../dashboard/StatCard"; // Reusing our dashboard StatCard
import { LayoutGrid, Library, Boxes } from "lucide-react";

const ProductTemplateHeader = ({ summary }) => {
  const stats = {
    totalTemplates: summary?.totalTemplates || 0,
    totalVariants: summary?.totalVariants || 0,
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Product Templates"
        value={stats.totalTemplates}
        icon={Library}
      />
      <StatCard
        title="Total Unique Variants"
        value={stats.totalVariants}
        icon={Boxes}
      />
      {/* We can add more KPIs like "Categories" and "Brands" here in the future */}
    </div>
  );
};

export default ProductTemplateHeader;
