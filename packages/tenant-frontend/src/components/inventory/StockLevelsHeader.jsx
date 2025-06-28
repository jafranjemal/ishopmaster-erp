import React from "react";
import StatCard from "../dashboard/StatCard";
import {
  Boxes,
  PackageCheck,
  PackageX,
  ArrowDownCircle,
  DollarSign,
  BarChart2,
  TrendingDown,
} from "lucide-react";
import useAuth from "../../context/useAuth";

const StockLevelsHeader = ({
  summary,
  branches = [],
  selectedBranchId,
  onBranchChange,
}) => {
  const { formatCurrencyCompact, formatNumber, formatCurrency } = useAuth();

  const kpis = {
    totalStock: summary?.totalStock || 0,
    totalVariantsInStock: summary?.totalVariantsInStock || 0,
    totalVariantsOutOfStock: summary?.totalVariantsOutOfStock || 0,
    totalStockValue: summary?.totalStockValue || 0,
    totalPotentialRevenue: summary?.totalPotentialRevenue || 0,
    totalStockOut: summary?.totalStockOut || 0,
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Inventory Overview</h2>
        <select
          className="border p-2 rounded-md shadow-sm"
          value={selectedBranchId}
          onChange={(e) => onBranchChange(e.target.value)}
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Total Stock (Units)"
          value={formatNumber(kpis.totalStock)}
          icon={PackageCheck}
          iconBgColor="bg-green-600/30"
        />
        <StatCard
          title="Variants In Stock"
          value={kpis.totalVariantsInStock}
          icon={Boxes}
          iconBgColor="bg-sky-600/20"
        />
        <StatCard
          title="Variants Out of Stock"
          value={kpis.totalVariantsOutOfStock}
          icon={PackageX}
          iconBgColor="bg-red-600/30"
        />
        <StatCard
          title="Total Inventory Value"
          value={formatCurrencyCompact(kpis.totalStockValue)}
          icon={DollarSign}
          iconBgColor="bg-amber-600/30"
        />
        <StatCard
          title="Potential Revenue"
          value={formatCurrencyCompact(kpis.totalPotentialRevenue)}
          icon={BarChart2}
          iconBgColor="bg-purple-600/30"
        />
        <StatCard
          title="Stock Outflow (Sold/Damaged)"
          value={formatNumber(kpis.totalStockOut)}
          icon={TrendingDown}
          iconBgColor="bg-gray-500/20"
        />
      </div>
    </>
  );
};

export default StockLevelsHeader;
