"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"
import { Save } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { StudyProgram, StudyProgramPayload } from "@/lib/api"
import type { MasterDataFormProps } from "@/features/master-data/master-data-page"

export type StudyProgramFormState = {
  kode_prodi: string
  nama_prodi: string
  alias_prodi: string
  jenjang_pendidikan: string
  nama_jurusan: string
  alias_jurusan: string
  status_prodi: "active" | "inactive"
}

type Props = MasterDataFormProps<StudyProgram, StudyProgramFormState, StudyProgramPayload>

export function StudyProgramFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof StudyProgramFormState) =>
    (value: string) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Program Studi" : "Tambah Program Studi"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi program studi." : "Lengkapi data program studi baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: StudyProgramPayload = {
              kode_prodi: formState.kode_prodi.trim(),
              nama_prodi: formState.nama_prodi.trim(),
              alias_prodi: formState.alias_prodi.trim(),
              jenjang_pendidikan: formState.jenjang_pendidikan.trim(),
              nama_jurusan: formState.nama_jurusan.trim(),
              alias_jurusan: formState.alias_jurusan.trim() ? formState.alias_jurusan.trim() : null,
              status_prodi: formState.status_prodi,
            }
            onSubmit(payload)
          }}
        >
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Kode Prodi">
              <Input
                placeholder="Contoh: IF001"
                value={formState.kode_prodi}
                onChange={(event) => handleChange("kode_prodi")(event.target.value)}
                required
              />
            </Field>
            <Field label="Nama Prodi">
              <Input
                placeholder="Contoh: Teknik Informatika"
                value={formState.nama_prodi}
                onChange={(event) => handleChange("nama_prodi")(event.target.value)}
                required
              />
            </Field>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Alias Prodi">
              <Input
                placeholder="Contoh: TI"
                value={formState.alias_prodi}
                onChange={(event) => handleChange("alias_prodi")(event.target.value)}
                required
              />
            </Field>
            <Field label="Jenjang Pendidikan">
              <Input
                placeholder="Contoh: S1"
                value={formState.jenjang_pendidikan}
                onChange={(event) => handleChange("jenjang_pendidikan")(event.target.value)}
                required
              />
            </Field>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Nama Jurusan">
              <Input
                placeholder="Contoh: Teknik Elektro"
                value={formState.nama_jurusan}
                onChange={(event) => handleChange("nama_jurusan")(event.target.value)}
                required
              />
            </Field>
            <Field label="Alias Jurusan (opsional)">
              <Input
                placeholder="Contoh: TEL"
                value={formState.alias_jurusan}
                onChange={(event) => handleChange("alias_jurusan")(event.target.value)}
              />
            </Field>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status Prodi</Label>
            <Select value={formState.status_prodi} onValueChange={(value: "active" | "inactive") => handleChange("status_prodi")(value)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={disabled}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  )
}
