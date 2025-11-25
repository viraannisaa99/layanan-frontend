"use client"

import type { Table } from "@tanstack/react-table"
import { Ban, CheckCircle2, Download, Trash2 } from "lucide-react"

import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar"
import { Separator } from "@/components/ui/separator"

import type { Department } from "@/lib/api"

export type DepartmentSelectionBarProps = {
  table: Table<Department>
  onSetStatus: (next: boolean) => void
  onDelete: () => void
  onExport: () => void
  statusPending: boolean
  deletePending: boolean
}

export function DepartmentSelectionBar({
  table,
  onSetStatus,
  onDelete,
  onExport,
  statusPending,
  deletePending,
}: DepartmentSelectionBarProps) {
  return (
    <DataTableActionBar table={table}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex w-full flex-wrap items-center justify-center gap-1.5 text-center">
        <DataTableActionBarAction
          tooltip="Aktifkan pilihan"
          onClick={() => onSetStatus(true)}
          isPending={statusPending}
        >
          <CheckCircle2 />
          Aktifkan
        </DataTableActionBarAction>
        <DataTableActionBarAction
          tooltip="Nonaktifkan pilihan"
          onClick={() => onSetStatus(false)}
          isPending={statusPending}
        >
          <Ban />
          Nonaktifkan
        </DataTableActionBarAction>
        <DataTableActionBarAction tooltip="Export CSV" onClick={onExport}>
          <Download />
          Export
        </DataTableActionBarAction>
        <DataTableActionBarAction
          tooltip="Hapus pilihan"
          onClick={onDelete}
          isPending={deletePending}
          className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
        >
          <Trash2 />
          Hapus
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  )
}
