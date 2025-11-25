import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import type * as React from "react";

import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DataTableToolsDrawerProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  filterExtra?: React.ReactNode;
  shallow?: boolean;
  debounceMs?: number;
  throttleMs?: number;
  onExport?: () => void;
  disableExport?: boolean;
  exportLabel?: string;
  title?: React.ReactNode;
}

export function DataTableToolsDrawer<TData>({
  open,
  onOpenChange,
  table,
  filterExtra,
  shallow,
  debounceMs,
  throttleMs,
  onExport,
  disableExport,
  exportLabel = "Export CSV",
  title = "Pengaturan Tabel",
}: DataTableToolsDrawerProps<TData>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t bg-background p-4"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-5">
          {filterExtra ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Filter Cepat
              </p>
              {filterExtra}
            </div>
          ) : null}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Sorting
            </p>
            <DataTableSortList table={table} align="start" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Filter
            </p>
            <DataTableFilterList
              table={table}
              shallow={shallow}
              debounceMs={debounceMs}
              throttleMs={throttleMs}
              align="start"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Tampilan Kolom
            </p>
            <DataTableViewOptions
              table={table}
              mode="inline"
              contentClassName="rounded-sm border p-0 max-h-60 overflow-y-auto"
            />
          </div>
          {onExport ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full gap-1.5"
              onClick={onExport}
              disabled={disableExport}
            >
              <Download className="h-4 w-4" />
              {exportLabel}
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
