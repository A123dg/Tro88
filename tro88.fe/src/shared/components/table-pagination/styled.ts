import type { CSSProperties, HTMLAttributes, PropsWithChildren } from "react";
import React, { forwardRef } from "react";

function joinClassName(...items: Array<string | undefined>) {
  return items.filter(Boolean).join(" ");
}

type TableWrapperProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    $bodyHeight?: string | number;
    paginationBackground?: string;
  }
>;

export const TableWrapper = forwardRef<HTMLDivElement, TableWrapperProps>(
  function TableWrapper(
    { $bodyHeight, paginationBackground, className, style, ...props },
    ref
  ) {
    const cssVars = {
      ...style,
      "--table-pagination-body-height":
        typeof $bodyHeight === "number" ? `${$bodyHeight}px` : $bodyHeight,
      "--table-pagination-bg": paginationBackground,
    } as CSSProperties;

    return React.createElement("div", {
      ...props,
      ref,
      className: joinClassName(
        "table-pagination",
        $bodyHeight !== undefined ? "table-pagination--fixed-body" : undefined,
        paginationBackground
          ? "table-pagination--custom-pagination-bg"
          : undefined,
        className
      ),
      style: cssVars,
    });
  }
);
