import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import type * as React from "react";

import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  desktopFilters?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onMobileToolsClick?: () => void;
  mobileTriggerAriaLabel?: string;
  mobileTriggerIcon?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  desktopFilters,
  rightSlot,
  onMobileToolsClick,
  mobileTriggerAriaLabel = "Buka pengaturan tabel",
  mobileTriggerIcon,
  className,
}: DataTableToolbarProps<TData>) {
  return (
    <DataTableAdvancedToolbar
      table={table}
      className={cn("gap-3 px-0", className)}
      rightSectionClassName="hidden md:flex"
      rightSlot={rightSlot}
    >
      <div className="flex w-full flex-nowrap items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 min-w-0 flex-1 md:max-w-xs md:flex-none"
        />
        {onMobileToolsClick ? (
          <Button
            variant="outline"
            size="icon-sm"
            className="h-8 w-8 md:hidden"
            aria-label={mobileTriggerAriaLabel}
            onClick={onMobileToolsClick}
          >
            {mobileTriggerIcon ?? <Settings2 className="h-3.5 w-3.5" />}
          </Button>
        ) : null}
        {desktopFilters ? (
          <div className="hidden md:flex">{desktopFilters}</div>
        ) : null}
      </div>
    </DataTableAdvancedToolbar>
  );
}
