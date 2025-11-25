"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs"
import {
  CalendarIcon,
  CheckCircle2,
  Download,
  MoreHorizontal,
  Network,
  PencilLine,
  Plus,
  QrCode,
  Settings2,
  Text,
  Trash2,
} from "lucide-react"

import { DepartmentFormDialog, type DepartmentFormState } from "@/app/departments/_components/department-form-dialog"
import { DepartmentSelectionBar } from "@/app/departments/_components/department-selection-bar"
import { exportDepartmentsToCSV, fetchAllDepartments } from "@/app/departments/_lib/export-departments"
import { processDepartments } from "@/app/departments/_lib/process-departments"
import { isStatusFilterValue, STATUS_FILTER_OPTIONS, type StatusFilterValue } from "@/app/departments/_lib/status-filter"
import { PageHeader } from "@/components/page-header"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTablePageShell } from "@/components/data-table/data-table-page"
import { DataTableToolsDrawer } from "@/components/data-table/data-table-tools-drawer"
import { StatusFilterChip } from "@/components/status-filter-chip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { useDataTable } from "@/hooks/use-data-table"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { exportTableToCSV } from "@/lib/export"
import { formatDate } from "@/lib/format"
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"
import { cn } from "@/lib/utils"
import { showToast } from "@/lib/show-toast"
import {
  createDepartment,
  deleteDepartment,
  Department,
  DepartmentPayload,
  listDepartments,
  updateDepartment,
} from "@/lib/api"
import type { ExtendedColumnFilter, ExtendedColumnSort } from "@/types/data-table"

const DEFAULT_SORTING: ExtendedColumnSort<Department>[] = [
  { id: "created_at", desc: true },
]

const FILTER_COLUMN_IDS = ["name", "alias", "sys_code", "major", "created_at"]

const defaultForm: DepartmentFormState = {
  name: "",
  alias: "",
  major_id: "",
  is_active: true,
  sys_code: "",
}

export default function DepartmentsPageClient() {
  const { data: session, isReady } = useRequireAuth()
  const queryClient = useQueryClient()

  const [formState, setFormState] = useState<DepartmentFormState>(defaultForm)
  const [editing, setEditing] = useState<Department | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null)

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const queryStateOptions = useMemo(
    () => ({
      history: "replace" as const,
      scroll: false,
      shallow: true,
      throttleMs: 50,
      debounceMs: 300,
      clearOnDefault: true,
    }),
    []
  )

  const [searchParam, setSearchParam] = useQueryState(
    "search",
    parseAsString.withOptions(queryStateOptions).withDefault("")
  )
  const [statusParam, setStatusParam] = useQueryState(
    "status",
    parseAsStringEnum(["all", "active", "inactive"])
      .withOptions({ ...queryStateOptions, clearOnDefault: true })
      .withDefault("all")
  )
  const [pageParam, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withOptions(queryStateOptions).withDefault(1)
  )
  const [perPageParam] = useQueryState(
    "perPage",
    parseAsInteger.withOptions(queryStateOptions).withDefault(10)
  )
  const [sortingParam] = useQueryState(
    "sort",
    getSortingStateParser<Department>(new Set(FILTER_COLUMN_IDS))
      .withOptions(queryStateOptions)
      .withDefault(DEFAULT_SORTING)
  )
  const [filtersParam] = useQueryState(
    "filters",
    getFiltersStateParser<Department>(FILTER_COLUMN_IDS)
      .withOptions({ ...queryStateOptions, throttleMs: 75 })
      .withDefault([])
  )
  const [joinOperatorParam] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"])
      .withOptions({ ...queryStateOptions, clearOnDefault: true })
      .withDefault("and")
  )

  const currentPage = pageParam ?? 1
  const currentPerPage = perPageParam ?? 10
  const sorting = sortingParam ?? DEFAULT_SORTING
  const filters = filtersParam ?? []
  const joinOperator = joinOperatorParam ?? "and"
  const search = searchParam?.trim() ?? ""
  const statusFilter = isStatusFilterValue(statusParam) ? statusParam : "all"

  useEffect(() => {
    setSearchInput((prev) => {
      if (prev === (searchParam ?? "")) return prev
      return searchParam ?? ""
    })
  }, [searchParam])

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim()
      void setSearchParam(trimmed.length ? trimmed : null)
      void setPageParam(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchInput, setPageParam, setSearchParam])

  const handleStatusFilterChange = useCallback(
    (next: StatusFilterValue) => {
      void setStatusParam(next === "all" ? null : next)
      void setPageParam(1)
    },
    [setStatusParam, setPageParam]
  )

  const departmentQueryKey = [
    "departments",
    statusFilter,
    search,
    currentPage,
    currentPerPage,
    JSON.stringify(sorting),
    JSON.stringify(filters),
    joinOperator,
  ]

  const departmentQuery = useQuery({
    queryKey: departmentQueryKey,
    queryFn: () =>
      listDepartments({
        status: statusFilter,
        page: currentPage,
        perPage: currentPerPage,
        search,
        sort: sorting,
        filters,
        joinOperator,
      }),
    enabled: isReady,
    placeholderData: keepPreviousData,
  })

  const listResponse = departmentQuery.data
  const departments = listResponse?.data ?? []
  const pagination = listResponse?.meta?.pagination
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)
  const totalItems = pagination?.total_items ?? departments.length

  const processedDepartments = useMemo(() => {
    return processDepartments({
      rows: departments,
      search,
      statusFilter,
      filters,
      joinOperator,
      sorting,
    })
  }, [departments, search, statusFilter, filters, joinOperator, sorting])

  const upsertMutation = useMutation({
    mutationFn: async (payload: DepartmentPayload) => {
      if (editing) {
        return updateDepartment(editing.id, payload)
      }
      return createDepartment(payload)
    },
    onSuccess: () => {
      showToast("success", "Data departemen tersimpan.")
      setDialogOpen(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ["departments"] })
    },
    onError: (error: Error) => showToast("error", error.message),
  })

  const removeMutation = useMutation({
    mutationFn: async (id: string) => deleteDepartment(id),
    onSuccess: () => {
      showToast("success", "Departemen dihapus (soft delete).")
      if (editing?.id) {
        resetForm()
      }
      queryClient.invalidateQueries({ queryKey: ["departments"] })
    },
    onError: (error: Error) => showToast("error", error.message),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ dept, next }: { dept: Department; next: boolean }) => {
      setTogglingId(dept.id)
      return updateDepartment(dept.id, {
        name: dept.name,
        alias: dept.alias,
        sys_code: dept.sys_code,
        major_id: dept.major_id ?? null,
        is_active: next,
      })
    },
    onSuccess: () => {
      showToast("success", "Status departemen diperbarui.")
      queryClient.invalidateQueries({ queryKey: ["departments"] })
    },
    onError: (error: Error) => showToast("error", error.message),
    onSettled: () => setTogglingId(null),
  })

  const { mutate: removeRow } = removeMutation
  const { mutate: toggleRowStatus } = toggleStatusMutation

  const requestSingleDelete = useCallback(
    (dept: Department) => {
      setConfirmDialog({
        title: "Hapus departemen?",
        description: `Departemen "${dept.name}" akan diarsipkan (soft delete) dan tidak lagi muncul di daftar aktif.`,
        confirmLabel: "Hapus",
        destructive: true,
        onConfirm: () => removeRow(dept.id),
      })
    },
    [removeRow]
  )

  const resetForm = useCallback(() => {
    setFormState({ ...defaultForm })
  }, [])

  const handleEdit = useCallback(
    (dept: Department) => {
      setEditing(dept)
      setFormState({
        name: dept.name,
        alias: dept.alias,
        sys_code: dept.sys_code,
        is_active: dept.is_active,
        major_id: dept.major_id ?? "",
      })
      setDialogOpen(true)
    },
    []
  )

  const handleAdd = useCallback(() => {
    setEditing(null)
    resetForm()
    setDialogOpen(true)
  }, [resetForm])

  const columns = useMemo<ColumnDef<Department>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex justify-start ps-2 w-full">
            <Checkbox
              aria-label="Pilih semua baris"
              className="translate-y-0.5 h-4.5 w-4.5 me-0"
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-start ps-2 w-full">
            <Checkbox
              aria-label="Pilih baris"
              className="translate-y-0.5 h-4.5 w-4.5 me-0"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 10,
        minSize: 10,
        maxSize: 10,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Nama" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.original.name}</span>
            <span className="text-muted-foreground">{row.original.alias}</span>
          </div>
        ),
        meta: {
          label: "Nama",
          placeholder: "Cari nama atau alias...",
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
      },
      {
        id: "sys_code",
        accessorKey: "sys_code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Sys Code" />
        ),
        cell: ({ row }) => (
          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] uppercase">
            {row.original.sys_code}
          </span>
        ),
        meta: {
          label: "Sys Code",
          placeholder: "Cari kode...",
          variant: "text",
          icon: QrCode,
        },
        enableColumnFilter: true,
      },
      {
        id: "major",
        accessorFn: (row) => row.major_id ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Major ID" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.major_id ?? "-"}
          </span>
        ),
        meta: {
          label: "Major ID",
          placeholder: "Cari major...",
          variant: "text",
          icon: Network,
        },
        enableColumnFilter: true,
      },
      {
        id: "status",
        accessorFn: (row) => (row.is_active ? "active" : "inactive"),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              aria-label="Toggle aktif"
              checked={row.original.is_active}
              onCheckedChange={(checked) =>
                toggleRowStatus({ dept: row.original, next: checked })
              }
              disabled={togglingId === row.original.id}
              className="data-[state=unchecked]:bg-muted"
            />
            <Badge variant={row.original.is_active ? "default" : "secondary"}>
              {row.original.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        ),
        meta: {
          label: "Status",
          variant: "select",
          options: [
            { label: "Aktif", value: "active" },
            { label: "Nonaktif", value: "inactive" },
          ],
          icon: CheckCircle2,
        },
        enableColumnFilter: false,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Dibuat" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.created_at, { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        ),
        meta: {
          label: "Dibuat",
          variant: "dateRange",
          icon: CalendarIcon,
        },
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
                <DropdownMenuItem onSelect={() => handleEdit(row.original)} className="text-xs">
                  <PencilLine className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    requestSingleDelete(row.original)
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
  }, [handleEdit, removeRow, toggleRowStatus, togglingId])

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data: processedDepartments,
    columns,
    pageCount: totalPages,
    queryKeys: {
      page: "page",
      perPage: "perPage",
      sort: "sort",
      filters: "filters",
      joinOperator: "joinOperator",
    },
    enableAdvancedFilter: true,
    initialState: {
      sorting,
      columnPinning: { left: ["select"], right: ["actions"] },
      columnVisibility: { created_at: false },
    },
    getRowId: (row) => row.id,
    meta: {
      totalItems,
    },
  })

  const {
    mutate: triggerExportAll,
    isPending: isExportingAll,
  } = useMutation({
    mutationFn: async () => {
      const rows = await fetchAllDepartments({
        status: statusFilter,
        search,
        filters,
        sorting,
        joinOperator,
        pageSize: Math.max(currentPerPage, 50),
      })
      exportDepartmentsToCSV(rows, "departments")
    },
    onSuccess: () => {
      showToast("success", "Seluruh data departemen berhasil diekspor.")
    },
    onError: (error: Error) => showToast("error", error.message),
  })

  const handleExportAll = useCallback(() => {
    if (isExportingAll) return
    triggerExportAll()
  }, [isExportingAll, triggerExportAll])

  const bulkStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const rows = table.getFilteredSelectedRowModel().rows
      if (!rows.length) return
      await Promise.all(
        rows.map((row) =>
          updateDepartment(row.original.id, {
            name: row.original.name,
            alias: row.original.alias,
            sys_code: row.original.sys_code,
            is_active: isActive,
            major_id: row.original.major_id ?? null,
          })
        )
      )
    },
    onSuccess: (_, isActive) => {
      showToast("success", isActive ? "Departemen diaktifkan." : "Departemen dinonaktifkan.")
      table.toggleAllRowsSelected(false)
      queryClient.invalidateQueries({ queryKey: ["departments"] })
    },
    onError: (error: Error) => showToast("error", error.message),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const rows = table.getFilteredSelectedRowModel().rows
      if (!rows.length) return
      await Promise.all(rows.map((row) => deleteDepartment(row.original.id)))
    },
    onSuccess: () => {
      showToast("success", "Departemen terhapus.")
      table.toggleAllRowsSelected(false)
      queryClient.invalidateQueries({ queryKey: ["departments"] })
    },
    onError: (error: Error) => showToast("error", error.message),
  })

  const requestBulkStatusChange = useCallback(
    (next: boolean) => {
      const count = table.getFilteredSelectedRowModel().rows.length
      if (!count) {
        showToast("warning", "Pilih setidaknya satu departemen terlebih dahulu.")
        return
      }
      setConfirmDialog({
        title: next ? `Aktifkan ${count} departemen?` : `Nonaktifkan ${count} departemen?`,
        description: "Aksi massal ini akan memperbarui status semua data yang dipilih.",
        confirmLabel: next ? "Aktifkan" : "Nonaktifkan",
        onConfirm: () => bulkStatusMutation.mutate(next),
      })
    },
    [bulkStatusMutation, showToast, table]
  )

  const requestBulkDelete = useCallback(() => {
    const count = table.getFilteredSelectedRowModel().rows.length
    if (!count) {
      showToast("warning", "Pilih setidaknya satu departemen terlebih dahulu.")
      return
    }
    setConfirmDialog({
      title: `Hapus ${count} departemen?`,
      description: "Semua data terpilih akan diarsipkan (soft delete) dan disembunyikan dari daftar.",
      confirmLabel: "Hapus",
      destructive: true,
      onConfirm: () => bulkDeleteMutation.mutate(),
    })
  }, [bulkDeleteMutation, showToast, table])

  const disabled =
    upsertMutation.isPending ||
    removeMutation.isPending ||
    departmentQuery.isLoading ||
    !isReady

  const isInitialLoading = departmentQuery.isLoading && !departmentQuery.data
  const isRefetching = departmentQuery.isFetching && Boolean(departmentQuery.data)

  const tableSection = isInitialLoading ? (
    <Skeleton className="h-80 w-full rounded-sm" />
  ) : departmentQuery.isError ? (
    <div className="rounded-sm border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
      Gagal memuat data departemen: {(departmentQuery.error as Error)?.message ?? "unknown"}
    </div>
  ) : (
    <div className="relative">
      {isRefetching && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
          <div className="rounded-sm border bg-background/95 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm">
            Memuat data terbaru...
          </div>
        </div>
      )}
      <DataTable
        table={table}
        actionBar={
          <DepartmentSelectionBar
            table={table}
            onSetStatus={requestBulkStatusChange}
            onDelete={requestBulkDelete}
            onExport={() =>
              exportTableToCSV(table, {
                filename: "departments",
                excludeColumns: ["select", "actions"],
                onlySelected: true,
              })
            }
            statusPending={bulkStatusMutation.isPending}
            deletePending={bulkDeleteMutation.isPending}
          />
        }
      >
        <DataTableToolbar
          table={table}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Cari nama, alias, atau kode..."
          desktopFilters={
            <StatusFilterChip
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={STATUS_FILTER_OPTIONS}
            />
          }
          onMobileToolsClick={() => setToolsOpen(true)}
          rightSlot={
            <>
              <DataTableSortList table={table} align="end" />
              <DataTableFilterList
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
                align="end"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 font-normal"
                onClick={handleExportAll}
                disabled={!processedDepartments.length || isExportingAll}
                aria-busy={isExportingAll}
              >
                <Download className="text-muted-foreground" />
                {isExportingAll ? "Mengekspor..." : "Export"}
              </Button>
            </>
          }
        />
      </DataTable>
      <DataTableToolsDrawer
        open={toolsOpen}
        onOpenChange={setToolsOpen}
        table={table}
        filterExtra={
          <StatusFilterChip
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={STATUS_FILTER_OPTIONS}
          />
        }
        shallow={shallow}
        debounceMs={debounceMs}
        throttleMs={throttleMs}
        onExport={handleExportAll}
        disableExport={!processedDepartments.length || isExportingAll}
      />
    </div>
  )

  return (
    <SidebarProvider>
      <AppSidebar user={session?.user ?? undefined} />
      <SidebarInset>
        <PageHeader items={[{ label: "Master Departemen" }]} />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataTablePageShell
            title={
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Data Departemen
              </span>
            }
            description="Kelola daftar departemen, status aktif, dan aksi lanjutan."
            primaryActionLabel={
              <>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Tambah Departemen
              </>
            }
            onPrimaryAction={handleAdd}
          >
            {tableSection}
          </DataTablePageShell>
        </div>
      </SidebarInset>

      <DepartmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        formState={formState}
        disabled={disabled}
        onFormStateChange={setFormState}
        onSubmit={(payload) => upsertMutation.mutate(payload)}
      />

      <Dialog open={Boolean(confirmDialog)} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent className="max-w-md rounded-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-base">
              {confirmDialog?.title}
            </DialogTitle>
            {confirmDialog?.description ? (
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmDialog(null)}>
              Batal
            </Button>
            <Button
              variant={confirmDialog?.destructive ? "destructive" : "default"}
              onClick={() => {
                confirmDialog?.onConfirm()
                setConfirmDialog(null)
              }}
            >
              {confirmDialog?.confirmLabel ?? "Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

type ConfirmDialogConfig = {
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  destructive?: boolean
  onConfirm: () => void
}
