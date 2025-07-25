import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";

// --- Utility ---
const normalizeValue = (v) => (v === undefined || v === null ? "" : v);
const isEqual = (a, b) => String(a) === String(b); // Loose comparison

// --- Select Root with optimization ---
const Select = ({ value, onValueChange, allowEmptyString = true, optimize = true, ...props }) => {
  const safeValue = normalizeValue(value);

  const handleValueChange = React.useCallback(
    (incomingValue) => {
      const denormalized =
        incomingValue === "__none__" ? (allowEmptyString ? "" : null) : incomingValue;

      if (optimize && isEqual(denormalized, value)) return;

      onValueChange?.(denormalized);
    },
    [value, onValueChange, allowEmptyString, optimize]
  );

  return (
    <SelectPrimitive.Root
      value={safeValue === "" ? "__none__" : safeValue}
      onValueChange={handleValueChange}
      {...props}
    />
  );
};

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(
  ({ className, children, suffixIcon: SuffixIcon, onSuffixIconClick, ...props }, ref) => (
    <div className="relative flex items-center">
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm ring-offset-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </SelectPrimitive.Trigger>

      <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </SelectPrimitive.Icon>

        {SuffixIcon && (
          <button
            type="button"
            onClick={onSuffixIconClick}
            className="cursor-pointer p-1 text-slate-400 hover:text-white"
            aria-label="Suffix action"
          >
            <SuffixIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "max-h-[250px] overflow-y-auto relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-md animate-in fade-in-80",
          position === "popper" && "translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-slate-400", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const normalizedValue = normalizeValue(value);

  if (normalizedValue === "") {
    // Handle empty string explicitly
    return (
      <SelectPrimitive.Item
        ref={ref}
        value="__none__"
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-700 focus:text-slate-100",
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Check className="h-4 w-4" />
          </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children ?? "None"}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      value={normalizedValue}
      className={cn(
        "cursor-pointer relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-700 focus:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-slate-700", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
