"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Handshake, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { createMasterDataPage } from "@/features/master-data/master-data-page"
import {
  EmploymentBondFormDialog,
  type EmploymentBondFormState,
} from "@/app/ikatan-kerja/_components/employment-bond-form-dialog"
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
  createEmploymentBond,
  deleteEmploymentBond,
  listEmploymentBonds,
  type EmploymentBond,
  type EmploymentBondPayload,
  updateEmploymentBond,
} from "@/lib/api"

const STATUS_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
]

const EmploymentBondPage = createMasterDataPage<EmploymentBond, EmploymentBondPayload, EmploymentBondFormState>({
  entity: "Ikatan Kerja",
  queryKey: "employment-bonds",
  title: "Data Ikatan Kerja",
  description: "Kelola tipe ikatan kerja dan organisasi yang berlaku.",
  icon: <Handshake className="h-4 w-4 text-primary" />,
  searchPlaceholder: "Cari kode atau nama ikatan kerja...",
  statusFilterOptions: STATUS_OPTIONS,
  getRowId: (row) => row.id,
  columns: ({ onEdit, onDelete, onStatusToggle, statusChangingId }) =>
    buildColumns(onEdit, onDelete, onStatusToggle, statusChangingId),
  list: listEmploymentBonds,
  create: createEmploymentBond,
  update: updateEmploymentBond,
  remove: deleteEmploymentBond,
  statusTogglePayload: (item, next) => ({
    kode_ikatan_kerja: item.kode_ikatan_kerja,
    nama_ikatan_kerja: item.nama_ikatan_kerja,
    organisasi: item.organisasi,
    sys_code: item.sys_code,
    is_active: next,
  }),
  defaultFormState: {
    kode_ikatan_kerja: "",
    nama_ikatan_kerja: "",
    organisasi: "",
    sys_code: "",
    is_active: true,
  },
  mapEntityToFormState: (item) => ({
    kode_ikatan_kerja: item.kode_ikatan_kerja,
    nama_ikatan_kerja: item.nama_ikatan_kerja,
    organisasi: item.organisasi,
    sys_code: item.sys_code,
    is_active: item.is_active,
  }),
  FormComponent: EmploymentBondFormDialog,
})

function buildColumns(
  onEdit: (item: EmploymentBond) => void,
  onDelete: (item: EmploymentBond) => void,
  onStatusToggle?: (item: EmploymentBond, next: boolean) => void,
  statusChangingId?: string | null,
) {
  const columns: ColumnDef<EmploymentBond>[] = [
    {
      id: "kode",
      accessorKey: "kode_ikatan_kerja",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Kode/Nama" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.nama_ikatan_kerja}</span>
          <span className="text-xs text-muted-foreground">{row.original.kode_ikatan_kerja}</span>
        </div>
      ),
      enableColumnFilter: true,
    },
    {
      id: "organisasi",
      accessorKey: "organisasi",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Organisasi" />,
      cell: ({ row }) => <span>{row.original.organisasi}</span>,
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
    },
  ]
  return columns
}

export default EmploymentBondPage
