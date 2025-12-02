"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { GraduationCap, MoreHorizontal, PencilLine, RefreshCw, Trash2 } from "lucide-react"

import { createMasterDataPage } from "@/features/master-data/master-data-page"
import {
  StudyProgramFormDialog,
  type StudyProgramFormState,
} from "@/app/program-studi/_components/study-program-form-dialog"
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
  createStudyProgram,
  deleteStudyProgram,
  getStudyProgramsMaster,
  listStudyPrograms,
  type StudyProgram,
  type StudyProgramPayload,
  updateStudyProgram,
} from "@/lib/api"
import { showToast } from "@/lib/show-toast"

const STATUS_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
]

const StudyProgramPage = createMasterDataPage<StudyProgram, StudyProgramPayload, StudyProgramFormState>({
  entity: "Program Studi",
  queryKey: "study-programs",
  title: "Data Program Studi",
  description: "Kelola daftar program studi, jenjang pendidikan, dan jurusan terkait.",
  icon: <GraduationCap className="h-4 w-4 text-primary" />,
  actions: <StudyProgramSyncButton queryKey="study-programs" />,
  searchPlaceholder: "Cari nama, kode, atau jurusan...",
  statusFilterOptions: STATUS_OPTIONS,
  getRowId: (row) => row.id,
  columns: ({ onEdit, onDelete }) => buildColumns(onEdit, onDelete),
  list: listStudyPrograms,
  create: createStudyProgram,
  update: updateStudyProgram,
  remove: deleteStudyProgram,
  defaultFormState: {
    kode_prodi: "",
    nama_prodi: "",
    alias_prodi: "",
    jenjang_pendidikan: "",
    nama_jurusan: "",
    alias_jurusan: "",
    status_prodi: "active",
  },
  mapEntityToFormState: (program) => ({
    kode_prodi: program.kode_prodi,
    nama_prodi: program.nama_prodi,
    alias_prodi: program.alias_prodi,
    jenjang_pendidikan: program.jenjang_pendidikan,
    nama_jurusan: program.nama_jurusan,
    alias_jurusan: program.alias_jurusan ?? "",
    status_prodi: program.status_prodi === "inactive" ? "inactive" : "active",
  }),
  FormComponent: StudyProgramFormDialog,
})

function StudyProgramSyncButton({ queryKey }: { queryKey: string }) {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const masterResponse = await getStudyProgramsMaster()
      const masterPrograms = masterResponse.data ?? []

      await Promise.all(
        masterPrograms.map((program) =>
          createStudyProgram({
            kode_prodi: program.kode_prodi,
            nama_prodi: program.nama_prodi,
            alias_prodi: program.alias_prodi,
            jenjang_pendidikan: program.jenjang_pendidikan,
            nama_jurusan: program.nama_jurusan,
            alias_jurusan: program.alias_jurusan ?? "",
            status_prodi: program.status_prodi ?? "active",
          }),
        ),
      )
    },
    onSuccess: () => {
      showToast("success", "Sinkronisasi program studi selesai.")
      queryClient.invalidateQueries({ queryKey: [queryKey] })
    },
    onError: (error: Error) => showToast("error", error.message),
  })

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 font-normal"
      onClick={() => mutate()}
      disabled={isPending}
      aria-busy={isPending}
    >
      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
      {isPending ? "Sinkronisasi..." : "Sync"}
    </Button>
  )
}

function buildColumns(onEdit: (item: StudyProgram) => void, onDelete: (item: StudyProgram) => void) {
  const columns: ColumnDef<StudyProgram>[] = [
      {
        id: "kode",
        accessorKey: "kode_prodi",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Kode/Nama" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.original.nama_prodi}</span>
            <span className="text-xs text-muted-foreground">{row.original.kode_prodi}</span>
          </div>
        ),
        enableColumnFilter: true,
      },
      {
        id: "jenjang",
        accessorKey: "jenjang_pendidikan",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Jenjang" />,
        cell: ({ row }) => <span className="text-xs uppercase">{row.original.jenjang_pendidikan}</span>,
      },
      {
        id: "jurusan",
        accessorKey: "nama_jurusan",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Jurusan" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.nama_jurusan}</span>
            <span className="text-xs text-muted-foreground">{row.original.alias_jurusan ?? "-"}</span>
          </div>
        ),
        enableColumnFilter: true,
      },
      {
        id: "status",
        accessorKey: "status_prodi",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
        cell: ({ row }) => (
          <Badge variant={row.original.status_prodi === "inactive" ? "secondary" : "default"}>
            {row.original.status_prodi === "inactive" ? "Nonaktif" : "Aktif"}
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

export default StudyProgramPage
