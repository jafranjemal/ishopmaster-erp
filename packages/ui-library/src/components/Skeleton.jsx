import React from "react";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";

/**
 * ERP-Optimized Skeleton Component
 *
 * Features:
 * - Adaptive sizing with aspect ratio control
 * - Configurable animation speed
 * - Responsive design
 * - Dark/light mode support
 * - Customizable shimmer effect
 */
export const Skeleton = ({
  ratio = 1,
  className = "",
  variant = "rectangle",
  speed = 1.5,
  lines = 1,
  lineHeight = 1,
  width = "100%",
}) => {
  // Animation speed calculation (ERP standard: 1.0-2.0)
  const animationSpeed = Math.max(0.5, Math.min(2.0, speed));

  // Variant configuration
  const isCircle = variant === "circle";
  const isText = variant === "text";

  const shimmerStyle = {
    animationDuration: `${1.5 / animationSpeed}s`,
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width }}>
      {isText ? (
        // Text skeleton variant
        Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden mb-2 last:mb-0"
            style={{ height: `${lineHeight}rem` }}
          >
            <div
              className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded"
              style={shimmerStyle}
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-600 to-transparent animate-shimmer"
              style={shimmerStyle}
            />
          </div>
        ))
      ) : (
        // Visual skeleton variant (rectangle/circle)
        <AspectRatio.Root ratio={ratio}>
          <div className="absolute inset-0">
            <div
              className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 ${
                isCircle ? "rounded-full" : "rounded-lg"
              }`}
              style={shimmerStyle}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-600 to-transparent animate-shimmer ${
                isCircle ? "rounded-full" : "rounded-lg"
              }`}
              style={shimmerStyle}
            />
          </div>
        </AspectRatio.Root>
      )}
    </div>
  );
};

export default Skeleton;
