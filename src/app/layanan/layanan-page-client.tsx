"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"
import { GraduationCap, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

import {
  ServiceFormDialog,
  type ServiceFormState,
} from "@/app/layanan/_components/layanan-form-dialog"
import { useDepartmentOptions } from "@/features/master-data/hooks/useDepartmentOptions"
import { createMasterDataPage } from "@/features/master-data/master-data-page"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  createService,
  deleteService,
  listServices,
  type Service,
  type ServicePayload,
  updateService,
} from "@/lib/api"

const STATUS_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
]

const DEFAULT_FORM_STATE: ServiceFormState = {
  sys_code: "",
  name: "",
  department_id: "",
  requester_scope: "",
  description: "",
  is_active: true,
}

type LookupMaps = { departments: Record<string, string> }

const compactId = (value: string) => (value.length > 8 ? `${value.slice(0, 8)}...` : value)

function useServiceLookups() {
  const { options, lookupMap, loading } = useDepartmentOptions({ status: "active" })
  return {
    departmentOptions: options,
    lookupMaps: { departments: lookupMap },
    loadingDepartments: loading,
  }
}

function buildColumns(
  handlers: {
    onEdit: (item: Service) => void
    onDelete: (item: Service) => void
  },
  lookups: LookupMaps,
) {
  const columns: ColumnDef<Service>[] = [
    {
      id: "sys_code",
      accessorKey: "sys_code",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Service" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.sys_code}</span>
        </div>
      ),
      enableColumnFilter: true,
    },
    {
      id: "department_id",
      accessorKey: "department_id",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Departemen" />,
      cell: ({ row }) => (
        <span className="text-xs">
          {lookups.departments[row.original.department_id] ??
            compactId(row.original.department_id)}
        </span>
      ),
    },
    {
      id: "requester_scope",
      accessorKey: "requester_scope",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Scope" />,
      cell: ({ row }) => (
        <Badge variant={row.original.requester_scope === "All" ? "secondary" : "default"}>
          {row.original.requester_scope}
        </Badge>
      ),
      enableColumnFilter: true,
    },
    {
      id: "is_active",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active == true ? "Active" : "Inactive"}
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
              <DropdownMenuItem onSelect={() => handlers.onEdit(row.original)} className="text-xs">
                <PencilLine className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  handlers.onDelete(row.original)
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

export default function ServicePageClient() {
  const { departmentOptions, lookupMaps, loadingDepartments } = useServiceLookups()

  const ServicePage = useMemo(
    () =>
      createMasterDataPage<Service, ServicePayload, ServiceFormState>({
        entity: "Service",
        queryKey: "service",
        title: "Data Service",
        description: "Kelola daftar layanan yang tersedia.",
        icon: <GraduationCap className="h-4 w-4 text-primary" />,
        searchPlaceholder: "Cari nama atau kode...",
        statusFilterOptions: STATUS_OPTIONS,
        getRowId: (row) => row.id,
        columns: ({ onEdit, onDelete }) => buildColumns({ onEdit, onDelete }, lookupMaps),
        list: listServices,
        create: createService,
        update: updateService,
        remove: deleteService,
        defaultFormState: DEFAULT_FORM_STATE,
        mapEntityToFormState: (service) => ({
          sys_code: service.sys_code,
          name: service.name,
          department_id: service.department_id,
          requester_scope: service.requester_scope,
          description: service.description,
          is_active: service.is_active,
        }),
        FormComponent: (props) => (
          <ServiceFormDialog
            {...props}
            departmentOptions={departmentOptions}
            loadingDepartments={loadingDepartments}
          />
        ),
      }),
    [lookupMaps, departmentOptions, loadingDepartments],
  )

  return <ServicePage />
}
