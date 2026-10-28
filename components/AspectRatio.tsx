"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type AspectRatioProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Desired width / height ratio (e.g. 16 / 9, 4 / 3, 1) */
  ratio?: number;
};

export default function AspectRatio({
  ratio = 1,
  className,
  style,
  children,
  ...props
}: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / ratio}%`,
        ...style,
      }}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 h-full w-full [&>*]:h-full [&>*]:w-full [&>*]:object-cover">
        {children}
      </div>
    </div>
  );
}
