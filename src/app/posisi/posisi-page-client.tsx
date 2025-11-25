"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Briefcase, CheckCircle2, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { createMasterDataPage } from "@/features/master-data/master-data-page"
import { PositionFormDialog, type PositionFormState } from "@/app/posisi/_components/position-form-dialog"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  createPosition,
  deletePosition,
  listPositions,
  type Position,
  type PositionPayload,
  updatePosition,
} from "@/lib/api"

const STATUS_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
]

const PositionPage = createMasterDataPage<Position, PositionPayload, PositionFormState>({
  entity: "Posisi",
  queryKey: "positions",
  title: "Data Posisi",
  description: "Daftar posisi dan peran yang tersedia untuk karyawan.",
  icon: <Briefcase className="h-4 w-4 text-primary" />,
  searchPlaceholder: "Cari nama atau sys code...",
  statusFilterOptions: STATUS_OPTIONS,
  getRowId: (row) => row.id,
  columns: ({ onEdit, onDelete, onStatusToggle, statusChangingId }) =>
    buildColumns(onEdit, onDelete, onStatusToggle, statusChangingId),
  list: listPositions,
  create: createPosition,
  update: updatePosition,
  remove: deletePosition,
  statusTogglePayload: (item, next) => ({
    nama_posisi: item.nama_posisi,
    alias_posisi: item.alias_posisi,
    sys_code: item.sys_code,
    is_active: next,
  }),
  defaultFormState: {
    nama_posisi: "",
    alias_posisi: "",
    sys_code: "",
    is_active: true,
  },
  mapEntityToFormState: (item) => ({
    nama_posisi: item.nama_posisi,
    alias_posisi: item.alias_posisi,
    sys_code: item.sys_code,
    is_active: item.is_active,
  }),
  FormComponent: PositionFormDialog,
})

function buildColumns(
  onEdit: (item: Position) => void,
  onDelete: (item: Position) => void,
  onStatusToggle?: (item: Position, next: boolean) => void,
  statusChangingId?: string | null,
) {
  const columns: ColumnDef<Position>[] = [
    {
      id: "nama",
      accessorKey: "nama_posisi",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Nama" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.nama_posisi}</span>
          <span className="text-xs text-muted-foreground">{row.original.alias_posisi}</span>
        </div>
      ),
      enableColumnFilter: true,
    },
    {
      id: "sys_code",
      accessorKey: "sys_code",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Sys Code" />,
      cell: ({ row }) => (
        <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] uppercase">
          {row.original.sys_code}
        </span>
      ),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {onStatusToggle ? (
            <Switch
              aria-label="Toggle aktif"
              checked={row.original.is_active}
              onCheckedChange={(checked) => onStatusToggle(row.original, checked)}
              disabled={statusChangingId === row.original.id}
              className="data-[state=unchecked]:bg-muted"
            />
          ) : null}
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
      ),
      meta: {
        icon: CheckCircle2,
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex justify-end pe-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-6 w-6 rounded-md bg-background text-muted-foreground hover:bg-background"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-sm">
              <DropdownMenuItem onSelect={() => onEdit(row.original)} className="text-xs">
                <PencilLine className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onDelete(row.original)
                }}
                className="text-xs text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 20,
      minSize: 20,
      maxSize: 20,
    },
  ]
  return columns
}

export default PositionPage
