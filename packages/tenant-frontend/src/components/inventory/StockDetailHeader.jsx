import React from "react";
import StatCard from "../dashboard/StatCard";
import { Boxes, PackageCheck, PackageX, Sigma } from "lucide-react";
import useAuth from "../../context/useAuth";

const StockDetailHeader = ({ details }) => {
  const { formatCurrency } = useAuth();

  // The component now receives real, calculated data as props.
  const kpis = {
    totalInStock: details?.totalInStock || 0,
    totalValue: details?.totalValue || 0,
    unitsSold: details?.unitsSold || 0,
    averageCost: details?.averageCost || 0,
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Units In Stock"
        value={kpis.totalInStock}
        icon={Boxes}
      />
      <StatCard
        title="Total Stock Value (Cost)"
        value={formatCurrency(kpis.totalValue)}
        icon={PackageCheck}
      />
      <StatCard
        title="Lifetime Units Sold"
        value={kpis.unitsSold}
        icon={PackageX}
      />
      <StatCard
        title="Average Cost Price"
        value={formatCurrency(kpis.averageCost)}
        icon={Sigma}
      />
    </div>
  );
};

export default StockDetailHeader;
