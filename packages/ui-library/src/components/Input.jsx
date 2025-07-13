import * as React from "react";
import { cn } from "../lib/utils";

const statusVariants = {
  default: "border-slate-700 focus:ring-indigo-500",
  error: "border-red-500 focus:ring-red-500",
  success: "border-green-500 focus:ring-green-500",
};

export const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      as = "input", // "input" | "textarea"
      rows = 3,
      autoResize = false,
      status = "default",
      showCharCount = false,
      maxLength,
      prefixIcon,
      suffixIcon,
      onPrefixClick,
      onSuffixClick,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(value || "");

    React.useEffect(() => {
      if (value !== undefined) setInputValue(value);
    }, [value]);

    const handleChange = (e) => {
      if (onChange) onChange(e);
      setInputValue(e.target.value);

      if (autoResize && ref?.current && as === "textarea") {
        ref.current.style.height = "auto";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
    };

    const baseClass = cn(
      "w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm",
      "placeholder:text-slate-400 ring-offset-slate-900 bg-gray-700 border border-gray-600 ",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      statusVariants[status],
      className
    );
    const handleFocus = (e) => {
      e.target.select();
    };
    const InputElement =
      as === "textarea" ? (
        <textarea
          ref={ref}
          rows={rows}
          value={inputValue}
          maxLength={maxLength}
          className={baseClass}
          onChange={handleChange}
          onFocus={handleFocus}
          {...props}
        />
      ) : (
        <input
          ref={ref}
          type={type}
          value={inputValue}
          maxLength={maxLength}
          className={baseClass}
          onFocus={handleFocus}
          onChange={handleChange}
          {...props}
        />
      );

    return (
      <div className="relative w-full">
        {prefixIcon && (
          <span
            className={cn(
              "absolute left-3 top-2.5 text-slate-400",
              onPrefixClick && "cursor-pointer hover:text-indigo-400"
            )}
            onClick={onPrefixClick}
          >
            {prefixIcon}
          </span>
        )}
        {React.cloneElement(InputElement, {
          className: cn(baseClass, prefixIcon && "pl-10", suffixIcon && "pr-10"),
        })}
        {suffixIcon && (
          <span
            className={cn(
              "absolute right-3 top-2.5 text-slate-400",
              onSuffixClick && "cursor-pointer hover:text-indigo-400"
            )}
            onClick={onSuffixClick}
          >
            {suffixIcon}
          </span>
        )}
        {showCharCount && maxLength && (
          <div className="text-right text-xs text-slate-500 mt-1">
            {inputValue.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
