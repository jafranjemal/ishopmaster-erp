import React from "react";
import { cn, Card, CardContent, CardHeader, CardTitle } from "ui-library";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  iconBgColor = "bg-slate-700",
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <div
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-md",
            iconBgColor
          )}
        >
          {Icon && (
            <Icon className="h-5 w-5 text-slate-100" strokeWidth={1.5} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
