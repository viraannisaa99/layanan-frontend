"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Activity, CheckCircle2, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { createMasterDataPage } from "@/features/master-data/master-data-page"
import { ActivityFormDialog, type ActivityFormState } from "@/app/aktivitas/_components/activity-form-dialog"
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
  createActivity,
  deleteActivity,
  listActivities,
  type Activity as ActivityEntity,
  type ActivityPayload,
  updateActivity,
} from "@/lib/api"

const STATUS_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
]

const AktivitasPage = createMasterDataPage<ActivityEntity, ActivityPayload, ActivityFormState>({
  entity: "Aktivitas",
  queryKey: "activities",
  title: "Data Aktivitas",
  description: "Definisikan aktivitas yang dapat dikaitkan ke karyawan.",
  icon: <Activity className="h-4 w-4 text-primary" />,
  searchPlaceholder: "Cari nama atau kode aktivitas...",
  statusFilterOptions: STATUS_OPTIONS,
  getRowId: (row) => row.id,
  columns: ({ onEdit, onDelete, onStatusToggle, statusChangingId }) =>
    buildColumns(onEdit, onDelete, onStatusToggle, statusChangingId),
  list: listActivities,
  create: createActivity,
  update: updateActivity,
  remove: deleteActivity,
  statusTogglePayload: (item, next) => ({
    kode_aktivitas: item.kode_aktivitas,
    nama_aktivitas: item.nama_aktivitas,
    status_aktivitas: next ? "active" : "inactive",
    is_active: next,
  }),
  defaultFormState: {
    kode_aktivitas: "",
    nama_aktivitas: "",
    status_aktivitas: "active",
    is_active: true,
  },
  mapEntityToFormState: (item) => ({
    kode_aktivitas: item.kode_aktivitas,
    nama_aktivitas: item.nama_aktivitas,
    status_aktivitas: item.status_aktivitas === "inactive" ? "inactive" : "active",
    is_active: item.is_active,
  }),
  FormComponent: ActivityFormDialog,
})

function buildColumns(
  onEdit: (item: ActivityEntity) => void,
  onDelete: (item: ActivityEntity) => void,
  onStatusToggle?: (item: ActivityEntity, next: boolean) => void,
  statusChangingId?: string | null,
) {
  const columns: ColumnDef<ActivityEntity>[] = [
    {
      id: "kode",
      accessorKey: "kode_aktivitas",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Kode" />,
      cell: ({ row }) => (
        <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] uppercase">
          {row.original.kode_aktivitas}
        </span>
      ),
    },
    {
      id: "nama",
      accessorKey: "nama_aktivitas",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Nama Aktivitas" />,
      cell: ({ row }) => <span className="font-semibold">{row.original.nama_aktivitas}</span>,
      enableColumnFilter: true,
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

export default AktivitasPage
