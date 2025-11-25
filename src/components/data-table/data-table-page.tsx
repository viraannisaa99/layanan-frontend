import type { ReactNode } from "react";

import { TableHeader } from "@/components/data-table/table-header";

type DataTablePageShellProps = {
  title: ReactNode;
  description?: string;
  primaryActionLabel: ReactNode;
  onPrimaryAction: () => void;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function DataTablePageShell({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  toolbar,
  children,
}: DataTablePageShellProps) {
  return (
    <>
      <TableHeader
        title={title}
        description={description}
        primaryActionLabel={primaryActionLabel}
        onPrimaryAction={onPrimaryAction}
      />
      <div className="rounded-sm border bg-card p-4">
        <div className="flex flex-col gap-2">
          {toolbar}
          {children}
        </div>
      </div>
    </>
  );
}
