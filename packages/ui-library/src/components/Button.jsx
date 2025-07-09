import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";
const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-slate-100 hover:bg-indigo-600/90",
        destructive: "bg-red-600 text-slate-100 hover:bg-red-600/90",
        outline: "border border-slate-700 bg-transparent hover:bg-slate-800 hover:text-slate-100",
        secondary: "bg-slate-700 text-slate-100 hover:bg-slate-700/80",
        ghost: "hover:bg-slate-800 hover:text-slate-100",
        link: "text-slate-100 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;

// import * as React from "react";

// const styles = {
//   base: {
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     whiteSpace: "nowrap",
//     borderRadius: "0.375rem",
//     fontSize: "0.875rem",
//     fontWeight: 500,
//     transition: "background-color 0.2s, color 0.2s",
//     outline: "none",
//     pointerEvents: "auto",
//   },
//   variants: {
//     default: {
//       backgroundColor: "#4f46e5", // indigo-600
//       color: "#f1f5f9", // slate-100
//     },
//     destructive: {
//       backgroundColor: "#dc2626", // red-600
//       color: "#f1f5f9",
//     },
//     outline: {
//       border: "1px solid #334155", // slate-700
//       backgroundColor: "transparent",
//       color: "#f1f5f9",
//     },
//     secondary: {
//       backgroundColor: "#334155", // slate-700
//       color: "#f1f5f9",
//     },
//     ghost: {
//       backgroundColor: "transparent",
//       color: "#f1f5f9",
//     },
//     link: {
//       backgroundColor: "transparent",
//       color: "#f1f5f9",
//       textDecoration: "underline",
//       textUnderlineOffset: "4px",
//     },
//   },
//   sizes: {
//     default: {
//       height: "2.5rem", // 10
//       padding: "0.5rem 1rem",
//     },
//     sm: {
//       height: "2.25rem", // 9
//       borderRadius: "0.375rem",
//       padding: "0 0.75rem",
//     },
//     lg: {
//       height: "2.75rem", // 11
//       borderRadius: "0.375rem",
//       padding: "0 2rem",
//     },
//     icon: {
//       height: "2.5rem",
//       width: "2.5rem",
//     },
//   },
// };

// const Button = React.forwardRef(
//   (
//     {
//       style = {},
//       variant = "default",
//       size = "default",
//       asChild = false,
//       disabled,
//       ...props
//     },
//     ref
//   ) => {
//     const Comp = asChild ? "span" : "button";
//     const combinedStyle = {
//       ...styles.base,
//       ...(styles.variants[variant] || styles.variants.default),
//       ...(styles.sizes[size] || styles.sizes.default),
//       ...(disabled ? { opacity: 0.5, pointerEvents: "none" } : {}),
//       ...style,
//     };

//     return <Comp ref={ref} style={combinedStyle} {...props} />;
//   }
// );

// Button.displayName = "Button";

// export { Button };
// export default Button;
