"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge, MoreHorizontal, PencilLine, Trash2, Users } from "lucide-react"

import { createMasterDataPage } from "@/features/master-data/master-data-page"
import { EmployeeFormDialog, type EmployeeFormState } from "@/app/employees/_components/employee-form-dialog"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  createEmployee,
  deleteEmployee,
  listDepartments,
  listEmployees,
  listPositions,
  listStudyPrograms,
  type Employee,
  type EmployeePayload,
  updateEmployee,
} from "@/lib/api"

type LookupOption = { value: string; label: string }
type LookupMaps = {
  programs: Record<string, string>
  departments: Record<string, string>
  positions: Record<string, string>
}

const compactId = (value: string) =>
  value.length > 8 ? `${value.slice(0, 8)}…` : value

const DEFAULT_FORM_STATE: EmployeeFormState = {
  nip: "",
  inisial: "",
  nama_display: "",
  title_prefix: "",
  title_suffix: "",
  program_studi_id: "",
  department_id: "",
  position_id: "",
}

function useEmployeeLookups() {
  const programQuery = useQuery({
    queryKey: ["study-program-options"],
    queryFn: () => listStudyPrograms({ status: "all", perPage: 200 }),
    select: (response) => response.data ?? [],
  })

  const departmentQuery = useQuery({
    queryKey: ["department-options"],
    queryFn: () => listDepartments({ status: "all", perPage: 200 }),
    select: (response) => response.data ?? [],
  })

  const positionQuery = useQuery({
    queryKey: ["position-options"],
    queryFn: () => listPositions({ status: "all", perPage: 200 }),
    select: (response) => response.data ?? [],
  })

  const programOptions: LookupOption[] =
    programQuery.data?.map((item) => ({
      value: item.id,
      label: `${item.nama_prodi} (${item.kode_prodi})`,
    })) ?? []

  const departmentOptions: LookupOption[] =
    departmentQuery.data?.map((item) => ({
      value: item.id,
      label: `${item.name} (${item.alias})`,
    })) ?? []

  const positionOptions: LookupOption[] =
    positionQuery.data?.map((item) => ({
      value: item.id,
      label: `${item.nama_posisi} (${item.alias_posisi})`,
    })) ?? []

  const lookupMaps: LookupMaps = {
    programs: programOptions.reduce<Record<string, string>>((acc, curr) => {
      acc[curr.value] = curr.label
      return acc
    }, {}),
    departments: departmentOptions.reduce<Record<string, string>>((acc, curr) => {
      acc[curr.value] = curr.label
      return acc
    }, {}),
    positions: positionOptions.reduce<Record<string, string>>((acc, curr) => {
      acc[curr.value] = curr.label
      return acc
    }, {}),
  }

  const loadingOptions = programQuery.isLoading || departmentQuery.isLoading || positionQuery.isLoading
  return {
    programOptions,
    departmentOptions,
    positionOptions,
    lookupMaps,
    loadingOptions,
  }
}

function buildColumns(
  handlers: {
    onEdit: (item: Employee) => void
    onDelete: (item: Employee) => void
  },
  lookups: LookupMaps,
): ColumnDef<Employee>[] {
  const columns: ColumnDef<Employee>[] = [
    {
      id: "nip",
      accessorKey: "nip",
      header: ({ column }) => <DataTableColumnHeader column={column} label="NIP / Nama" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.nama_display}</span>
          <span className="text-xs text-muted-foreground">{row.original.nip}</span>
        </div>
      ),
    },
    {
      id: "inisial",
      accessorKey: "inisial",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Inisial" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.inisial}</span>
        </div>
      ),
      size: 40,
      minSize: 40,
      maxSize: 60,
    },
    {
      id: "program",
      accessorKey: "program_studi_id",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Program Studi" />,
      cell: ({ row }) => (
        <span className="text-sm">
          {lookups.programs[row.original.program_studi_id] ?? compactId(row.original.program_studi_id)}
        </span>
      ),
    },
    {
      id: "department",
      accessorKey: "department_id",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Departemen" />,
      cell: ({ row }) => (
        <span className="text-sm">
          {lookups.departments[row.original.department_id] ?? compactId(row.original.department_id)}
        </span>
      ),
    },
    {
      id: "position",
      accessorKey: "position_id",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Posisi" />,
      cell: ({ row }) => (
        <span className="text-sm">
          {lookups.positions[row.original.position_id] ?? compactId(row.original.position_id)}
        </span>
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

export default function EmployeePageClient() {
  const {
    programOptions,
    departmentOptions,
    positionOptions,
    lookupMaps,
    loadingOptions,
  } = useEmployeeLookups()

  const EmployeePage = useMemo(
    () =>
      createMasterDataPage<Employee, EmployeePayload, EmployeeFormState>({
        entity: "Karyawan",
        queryKey: "employees",
        title: "Data Karyawan",
        description:
          "Kelola data karyawan beserta referensi program studi, departemen, dan posisi.",
        icon: <Users className="h-4 w-4 text-primary" />,
        searchPlaceholder: "Cari NIP atau nama...",
        getRowId: (row) => row.id,
        columns: ({ onEdit, onDelete }) => buildColumns({ onEdit, onDelete }, lookupMaps),
        list: (params) => listEmployees(params),
        create: createEmployee,
        update: (id, payload) => updateEmployee(id, payload),
        remove: deleteEmployee,
        defaultFormState: DEFAULT_FORM_STATE,
        mapEntityToFormState: (item) => ({
          nip: item.nip,
          inisial: item.inisial,
          nama_display: item.nama_display,
          title_prefix: item.title_prefix ?? "",
          title_suffix: item.title_suffix ?? "",
          program_studi_id: item.program_studi_id,
          department_id: item.department_id,
          position_id: item.position_id,
        }),
        FormComponent: (props) => (
          <EmployeeFormDialog
            {...props}
            programOptions={programOptions}
            departmentOptions={departmentOptions}
            positionOptions={positionOptions}
            loadingOptions={loadingOptions}
          />
        ),
      }),
    [lookupMaps, programOptions, departmentOptions, positionOptions, loadingOptions],
  )

  return <EmployeePage />
}
