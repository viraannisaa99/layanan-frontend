"use client"

import { useCallback, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs"
import { Download, Plus } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTablePageShell } from "@/components/data-table/data-table-page"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusFilterChip, type StatusFilterOption } from "@/components/status-filter-chip"
import { DataTableToolsDrawer } from "@/components/data-table/data-table-tools-drawer"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { exportTableToCSV } from "@/lib/export"
import { showToast } from "@/lib/show-toast"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useDataTable } from "@/hooks/use-data-table"
import type { ApiResponse, ExtendedColumnFilter, ExtendedColumnSort } from "@/types/data-table"

export type MasterListParams = {
  status?: string
  page?: number
  perPage?: number
  search?: string
  sort?: ExtendedColumnSort<unknown>[]
  filters?: ExtendedColumnFilter<unknown>[]
  joinOperator?: "and" | "or"
}

export type MasterDataFormProps<TData, TFormState, TPayload> = {
  open: boolean
  editing: TData | null
  formState: TFormState
  disabled: boolean
  onOpenChange: (open: boolean) => void
  onFormStateChange: Dispatch<SetStateAction<TFormState>>
  onSubmit: (payload: TPayload) => void
}

export type MasterDataColumnContext<TData> = {
  onEdit: (item: TData) => void
  onDelete: (item: TData) => void
  onStatusToggle?: (item: TData, next: boolean) => void
  statusChangingId?: string | null
}

export type MasterDataPageConfig<TData, TPayload, TFormState> = {
  entity: string
  queryKey: string
  title: string
  description: string
  icon?: ReactNode
  searchPlaceholder?: string
  statusFilterOptions?: StatusFilterOption[]
  defaultStatus?: string
  getRowId: (item: TData) => string
  columns: (ctx: MasterDataColumnContext<TData>) => ColumnDef<TData>[]
  list: (params: MasterListParams) => Promise<ApiResponse<TData[]>>
  create: (payload: TPayload) => Promise<TData>
  update: (id: string, payload: TPayload) => Promise<TData>
  remove: (id: string) => Promise<unknown>
  statusTogglePayload?: (item: TData, next: boolean) => TPayload
  defaultFormState: TFormState
  mapEntityToFormState: (item: TData) => TFormState
  FormComponent: React.ComponentType<MasterDataFormProps<TData, TFormState, TPayload>>
  enableAdvancedFilter?: boolean
  defaultSorting?: ExtendedColumnSort<TData>[]
}

type ConfirmDialogConfig = {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  destructive?: boolean
  onConfirm: () => void
}

const DEFAULT_STATUS_OPTIONS: StatusFilterOption[] = [
  { label: "Semua", value: "all" },
]

export function createMasterDataPage<TData extends { id: string }, TPayload, TFormState>(
  config: MasterDataPageConfig<TData, TPayload, TFormState>,
) {
  const {
    entity,
    queryKey,
    title,
    description,
    icon,
    searchPlaceholder = "Cari...",
    statusFilterOptions,
    defaultStatus = "all",
    getRowId,
    columns: buildColumns,
    list,
    create,
    update,
    remove,
    statusTogglePayload,
    defaultFormState,
    mapEntityToFormState,
    FormComponent,
    enableAdvancedFilter = false,
    defaultSorting,
  } = config

  return function MasterDataPageClient() {
    const { data: session, isReady } = useRequireAuth()
    const queryClient = useQueryClient()

    const [formState, setFormState] = useState<TFormState>(defaultFormState)
    const [editing, setEditing] = useState<TData | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [toolsOpen, setToolsOpen] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [statusChangingId, setStatusChangingId] = useState<string | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null)

    const effectiveStatusOptions = statusFilterOptions?.length ? statusFilterOptions : DEFAULT_STATUS_OPTIONS

    const queryStateOptions = useMemo(
      () => ({
        history: "replace" as const,
        scroll: false,
        shallow: true,
        throttleMs: 50,
        debounceMs: 300,
        clearOnDefault: true,
      }),
      [],
    )

    const [searchParam, setSearchParam] = useQueryState(
      "search",
      parseAsString.withOptions(queryStateOptions).withDefault(""),
    )

    const statusValues = effectiveStatusOptions.map((option) => option.value) as [string, ...string[]]
    const [statusParam, setStatusParam] = useQueryState(
      "status",
      parseAsStringEnum(statusValues).withOptions({ ...queryStateOptions, clearOnDefault: true }).withDefault(defaultStatus),
    )

    const [pageParam, setPageParam] = useQueryState(
      "page",
      parseAsInteger.withOptions(queryStateOptions).withDefault(1),
    )
    const [perPageParam] = useQueryState(
      "perPage",
      parseAsInteger.withOptions(queryStateOptions).withDefault(10),
    )

    const currentPage = pageParam ?? 1
    const currentPerPage = perPageParam ?? 10
    const search = searchParam?.trim() ?? ""
    const statusFilter = statusParam ?? defaultStatus

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
      (next: string) => {
        void setStatusParam(next === "all" ? null : next)
        void setPageParam(1)
      },
      [setStatusParam, setPageParam],
    )

    const listQueryKey = useMemo(
      () => [queryKey, statusFilter, currentPage, currentPerPage, search],
      [queryKey, statusFilter, currentPage, currentPerPage, search],
    )

    const listQuery = useQuery({
      queryKey: listQueryKey,
      queryFn: () =>
        list({
          status: statusFilter,
          page: currentPage,
          perPage: currentPerPage,
          search,
        }),
      enabled: isReady,
      placeholderData: keepPreviousData,
    })

    const listResponse = listQuery.data
    const items = listResponse?.data ?? []
    const pagination = listResponse?.meta?.pagination
    const totalPages = Math.max(1, pagination?.total_pages ?? 1)
    const totalItems = pagination?.total_items ?? items.length

    const resetForm = useCallback(() => {
      setFormState(defaultFormState)
    }, [defaultFormState])

    const handleAdd = useCallback(() => {
      setEditing(null)
      resetForm()
      setDialogOpen(true)
    }, [resetForm])

    const handleEdit = useCallback(
      (item: TData) => {
        setEditing(item)
        setFormState(mapEntityToFormState(item))
        setDialogOpen(true)
      },
      [mapEntityToFormState],
    )

    const upsertMutation = useMutation({
      mutationFn: async (payload: TPayload) => {
        if (editing) {
          return update(getRowId(editing), payload)
        }
        return create(payload)
      },
      onSuccess: () => {
        showToast("success", `${entity} tersimpan.`)
        setDialogOpen(false)
        resetForm()
        setEditing(null)
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      },
      onError: (error: Error) => showToast("error", error.message),
    })

    const removeMutation = useMutation({
      mutationFn: async (id: string) => remove(id),
      onSuccess: () => {
        showToast("success", `${entity} dihapus.`)
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      },
      onError: (error: Error) => showToast("error", error.message),
    })

    const statusMutation = statusTogglePayload
      ? useMutation({
          mutationFn: async ({ item, next }: { item: TData; next: boolean }) => {
            setStatusChangingId(getRowId(item))
            const payload = statusTogglePayload(item, next)
            return update(getRowId(item), payload)
          },
          onSuccess: () => {
            showToast("success", `Status ${entity.toLowerCase()} diperbarui.`)
            queryClient.invalidateQueries({ queryKey: [queryKey] })
          },
          onError: (error: Error) => showToast("error", error.message),
          onSettled: () => setStatusChangingId(null),
        })
      : null

    const requestDelete = useCallback(
      (item: TData) => {
        setConfirmDialog({
          title: `Hapus ${entity.toLowerCase()}?`,
          description: `Data "${getRowId(item)}" akan diarsipkan.`,
          confirmLabel: "Hapus",
          destructive: true,
          onConfirm: () => removeMutation.mutate(getRowId(item)),
        })
      },
      [entity, getRowId, removeMutation],
    )

    const columns = useMemo(() => {
      return buildColumns({
        onEdit: handleEdit,
        onDelete: requestDelete,
        onStatusToggle: statusMutation
          ? (item, next) => statusMutation.mutate({ item, next })
          : undefined,
        statusChangingId,
      })
    }, [buildColumns, handleEdit, requestDelete, statusMutation, statusChangingId])

    const { table, shallow, debounceMs, throttleMs } = useDataTable({
      data: items,
      columns,
      pageCount: totalPages,
      getRowId,
      enableAdvancedFilter,
      initialState: {
        sorting: defaultSorting ?? [],
      },
      meta: { totalItems },
    })

    const disabled =
      upsertMutation.isPending ||
      removeMutation.isPending ||
      listQuery.isLoading ||
      !isReady

    const isInitialLoading = listQuery.isLoading && !listQuery.data
    const isRefetching = listQuery.isFetching && Boolean(listQuery.data)

    const FormComponentNode = (
      <FormComponent
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        formState={formState}
        onFormStateChange={setFormState}
        disabled={disabled}
        onSubmit={(payload) => upsertMutation.mutate(payload)}
      />
    )

    const tableSection = isInitialLoading ? (
      <Skeleton className="h-80 w-full rounded-sm" />
    ) : listQuery.isError ? (
      <div className="rounded-sm border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
        Gagal memuat data {entity.toLowerCase()}: {(listQuery.error as Error)?.message ?? "unknown"}
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
        <DataTable table={table}>
          <DataTableToolbar
            table={table}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder={searchPlaceholder}
            desktopFilters={
              statusFilterOptions ? (
                <StatusFilterChip
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  options={effectiveStatusOptions}
                />
              ) : null
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
                  onClick={() =>
                    exportTableToCSV(table, {
                      filename: entity.toLowerCase().replace(/\s+/g, "-"),
                      excludeColumns: ["actions"],
                    })
                  }
                  disabled={!items.length}
                >
                  <Download className="text-muted-foreground" />
                  Export
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
            statusFilterOptions ? (
              <StatusFilterChip
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={effectiveStatusOptions}
              />
            ) : null
          }
          shallow={shallow}
          debounceMs={debounceMs}
          throttleMs={throttleMs}
          onExport={() =>
            exportTableToCSV(table, {
              filename: entity.toLowerCase().replace(/\s+/g, "-"),
              excludeColumns: ["actions"],
            })
          }
          disableExport={!items.length}
        />
      </div>
    )

    return (
      <SidebarProvider>
        <AppSidebar user={session?.user ?? undefined} />
        <SidebarInset>
          <PageHeader items={[{ label: `Master ${entity}` }]} />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DataTablePageShell
              title={
                <span className="flex items-center gap-2">
                  {icon}
                  {title}
                </span>
              }
              description={description}
              primaryActionLabel={
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Tambah {entity}
                </>
              }
              onPrimaryAction={handleAdd}
            >
              {tableSection}
            </DataTablePageShell>
          </div>
        </SidebarInset>

        {FormComponentNode}

        <Dialog open={Boolean(confirmDialog)} onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <DialogContent className="max-w-md rounded-sm" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="text-base">{confirmDialog?.title}</DialogTitle>
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
}
