"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Calendar } from "lucide-react"

import { createMasterDataPage } from "@/features/master-data/master-data-page"
import {
  LeaveQuotaFormDialog,
  type LeaveQuotaFormState,
} from "@/app/jumlah-cuti/_components/leave-quota-form-dialog"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  createLeaveQuota,
  deleteLeaveQuota,
  listLeaveQuotas,
  type LeaveQuota,
  type LeaveQuotaPayload,
  updateLeaveQuota,
} from "@/lib/api"
import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

const LeaveQuotaPage = createMasterDataPage<LeaveQuota, LeaveQuotaPayload, LeaveQuotaFormState>({
  entity: "Jumlah Cuti",
  queryKey: "leave-quotas",
  title: "Data Jumlah Cuti",
  description: "Definisikan variasi jumlah cuti yang dapat digunakan di konfigurasi lainnya.",
  icon: <Calendar className="h-4 w-4 text-primary" />,
  searchPlaceholder: "Cari jumlah atau keterangan...",
  getRowId: (row) => row.id,
  columns: ({ onEdit, onDelete }) => buildColumns(onEdit, onDelete),
  list: listLeaveQuotas,
  create: createLeaveQuota,
  update: updateLeaveQuota,
  remove: deleteLeaveQuota,
  defaultFormState: {
    jumlah_cuti: 0,
    keterangan: "",
  },
  mapEntityToFormState: (item) => ({
    jumlah_cuti: item.jumlah_cuti,
    keterangan: item.keterangan ?? "",
  }),
  FormComponent: LeaveQuotaFormDialog,
})

function buildColumns(onEdit: (item: LeaveQuota) => void, onDelete: (item: LeaveQuota) => void) {
  const columns: ColumnDef<LeaveQuota>[] = [
    {
      id: "jumlah",
      accessorKey: "jumlah_cuti",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Jumlah (hari)" />,
      cell: ({ row }) => <span className="font-semibold">{row.original.jumlah_cuti}</span>,
    },
    {
      id: "keterangan",
      accessorKey: "keterangan",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Keterangan" />,
      cell: ({ row }) =>
        row.original.keterangan ? (
          <span>{row.original.keterangan}</span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
      enableColumnFilter: true,
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

export default LeaveQuotaPage
