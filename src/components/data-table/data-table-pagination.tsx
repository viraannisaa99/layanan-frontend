import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData>
  extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalPages = table.getPageCount();
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;
  const totalItems = table.options.meta?.totalItems as number | undefined;

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 border-border pt-1 text-center text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:text-left md:text-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 text-foreground/80 md:flex-1 md:justify-start">
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-7 w-[90px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" className="rounded-sm border">
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={`${option}`}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="uppercase tracking-wide text-[11px] text-muted-foreground">
          Rows per page
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span>
          {selectedRows} of {totalRows} row(s) selected
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
        <span className="text-foreground">
          Page {pageIndex + 1} of {totalPages}{" "}
          {typeof totalItems === "number" ? ` (Total ${totalItems} data)` : ""}
        </span>
        <div className="inline-flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="h-7 w-7"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="h-7 w-7"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
