import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-slate-100 hover:bg-indigo-600/80",
        success: "border-transparent bg-green-600 text-slate-100",
        destructive: "border-transparent bg-red-600 text-slate-100",
        warning: "border-transparent bg-amber-500 text-slate-900",
        outline: "text-slate-100 border-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

export default Badge;
