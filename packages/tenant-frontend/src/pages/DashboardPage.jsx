import React, { useState, useEffect } from "react";

import { tenantDashboardService } from "../services/api";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// UI Components
import StatCard from "../components/dashboard/StatCard";
import { Button, Card, CardContent, CardHeader, CardTitle } from "ui-library";

// Icons
import { DollarSign, Package, Wrench, Users, PlusCircle } from "lucide-react";
import useAuth from "../context/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await tenantDashboardService.getSummary();
        setSummaryData(response.data.data);
      } catch (error) {
        toast.error("Could not load dashboard data.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  if (!summaryData) {
    return (
      <div className="text-center p-10">
        Could not load dashboard data. Please try again later.
      </div>
    );
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="mt-1 text-slate-400">
          Here's a snapshot of your business today,{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          .
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(summaryData.todaySales)}
          icon={DollarSign}
          iconBgColor="bg-green-600/30"
        />
        <StatCard
          title="Pending Repairs"
          value={summaryData.pendingRepairs}
          icon={Wrench}
          iconBgColor="bg-amber-500/30"
        />
        <StatCard
          title="Low Stock Items"
          value={summaryData.lowStockItems}
          icon={Package}
          iconBgColor="bg-red-600/30"
        />
        <StatCard
          title="New Customers"
          value={summaryData.newCustomersToday}
          icon={Users}
          iconBgColor="bg-sky-500/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Performance (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={summaryData.salesLast7Days}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                  }}
                />
                <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> New Sale
              </Button>
              <Button variant="secondary">
                <PlusCircle className="mr-2 h-4 w-4" /> New Repair Ticket
              </Button>
              <Button variant="secondary">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-700">
                {summaryData.recentActivity.map((activity) => (
                  <li key={activity.id} className="py-3">
                    <p className="text-sm text-slate-100">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {activity.time} by {activity.user}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
