"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Layers, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import { createMasterDataPage } from "@/features/master-data/master-data-page"
import {
  EmployeeClassFormDialog,
  type EmployeeClassFormState,
} from "@/app/kelas-pegawai/_components/employee-class-form-dialog"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  createEmployeeClass,
  deleteEmployeeClass,
  listEmployeeClasses,
  type EmployeeClass,
  type EmployeeClassPayload,
  updateEmployeeClass,
} from "@/lib/api"

const STATUS_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Lembur", value: "lembur" },
  { label: "Non Lembur", value: "non_lembur" },
]

const EmployeeClassPage = createMasterDataPage<EmployeeClass, EmployeeClassPayload, EmployeeClassFormState>({
  entity: "Kelas Pegawai",
  queryKey: "employee-classes",
  title: "Data Kelas Pegawai",
  description: "Kelola kelas/level pegawai beserta hak lembur dan referensi jumlah cuti.",
  icon: <Layers className="h-4 w-4 text-primary" />,
  searchPlaceholder: "Cari nama kelas...",
  statusFilterOptions: STATUS_OPTIONS,
  getRowId: (row) => row.id,
  columns: ({ onEdit, onDelete }) => buildColumns(onEdit, onDelete),
  list: listEmployeeClasses,
  create: createEmployeeClass,
  update: updateEmployeeClass,
  remove: deleteEmployeeClass,
  defaultFormState: {
    kelas_pegawai: "",
    ref_jumlah_cuti: "",
    is_lembur: false,
  },
  mapEntityToFormState: (item) => ({
    kelas_pegawai: item.kelas_pegawai,
    ref_jumlah_cuti: item.ref_jumlah_cuti !== null && item.ref_jumlah_cuti !== undefined ? String(item.ref_jumlah_cuti) : "",
    is_lembur: item.is_lembur,
  }),
  FormComponent: EmployeeClassFormDialog,
})

function buildColumns(onEdit: (item: EmployeeClass) => void, onDelete: (item: EmployeeClass) => void) {
  const columns: ColumnDef<EmployeeClass>[] = [
    {
      id: "kelas",
      accessorKey: "kelas_pegawai",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Kelas" />,
      cell: ({ row }) => <span className="font-semibold">{row.original.kelas_pegawai}</span>,
      enableColumnFilter: true,
    },
    {
      id: "ref_cuti",
      accessorKey: "ref_jumlah_cuti",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Ref. Cuti" />,
      cell: ({ row }) =>
        row.original.ref_jumlah_cuti !== null && row.original.ref_jumlah_cuti !== undefined ? (
          <span className="text-xs font-semibold">{row.original.ref_jumlah_cuti} hari</span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      id: "lembur",
      accessorKey: "is_lembur",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Lembur" />,
      cell: ({ row }) => (
        <Badge variant={row.original.is_lembur ? "default" : "secondary"}>
          {row.original.is_lembur ? "Ya" : "Tidak"}
        </Badge>
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
      size: 20,
      minSize: 20,
      maxSize: 20,
    },
  ]
  return columns
}

export default EmployeeClassPage
