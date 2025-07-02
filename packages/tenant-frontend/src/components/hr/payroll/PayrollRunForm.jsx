import React, { useState } from "react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "ui-library";
import { PlayCircle } from "lucide-react";

const PayrollRunForm = ({ onRun, isRunning, runResult }) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRun({ startDate, endDate });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Run New Payroll</CardTitle>
        <CardDescription>Select a pay period to calculate salaries and commissions for all active employees.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isRunning}>
              <PlayCircle className="h-4 w-4 mr-2" />
              {isRunning ? "Processing..." : "Run Payroll for Period"}
            </Button>
          </div>
        </form>
        {runResult && (
          <div className="mt-6 border-t border-slate-700 pt-4">
            <h4 className="font-semibold text-green-400">Payroll Run Successful!</h4>
            <div className="text-sm space-y-1 mt-2">
              <p>Total Employees Processed: {runResult.payslipsGenerated}</p>
              <p>Total Payroll Amount: {runResult.totalPayrollAmount}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default PayrollRunForm;
