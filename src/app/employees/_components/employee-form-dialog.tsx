"use client"

import { Save } from "lucide-react"

import type { MasterDataFormProps } from "@/features/master-data/master-data-page"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Employee, EmployeePayload } from "@/lib/api"

export type EmployeeFormState = {
  nip: string
  inisial: string
  nama_display: string
  title_prefix: string
  title_suffix: string
  program_studi_id: string
  department_id: string
  position_id: string
}

type SelectOption = {
  value: string
  label: string
}

type Props = MasterDataFormProps<Employee, EmployeeFormState, EmployeePayload> & {
  programOptions: SelectOption[]
  departmentOptions: SelectOption[]
  positionOptions: SelectOption[]
  loadingOptions?: boolean
}

export function EmployeeFormDialog({
  open,
  editing,
  formState,
  disabled,
  programOptions,
  departmentOptions,
  positionOptions,
  loadingOptions = false,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof EmployeeFormState) =>
    (value: string) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  const isOptionsEmpty =
    !programOptions.length || !departmentOptions.length || !positionOptions.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Karyawan" : "Tambah Karyawan"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Perbarui informasi karyawan."
              : "Lengkapi data karyawan baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: EmployeePayload = {
              nip: formState.nip.trim(),
              inisial: formState.inisial.trim(),
              nama_display: formState.nama_display.trim(),
              title_prefix: formState.title_prefix.trim()
                ? formState.title_prefix.trim()
                : null,
              title_suffix: formState.title_suffix.trim()
                ? formState.title_suffix.trim()
                : null,
              program_studi_id: formState.program_studi_id,
              department_id: formState.department_id,
              position_id: formState.position_id,
            }
            onSubmit(payload)
          }}
        >
          <div className="grid gap-2 md:grid-cols-3">
            <Field label="NIP">
              <Input
                placeholder="Contoh: 19871231"
                value={formState.nip}
                onChange={(event) => handleChange("nip")(event.target.value)}
                required
              />
            </Field>
            <Field label="Inisial">
              <Input
                placeholder="Contoh: AS"
                value={formState.inisial}
                onChange={(event) => handleChange("inisial")(event.target.value)}
                required
              />
            </Field>
            <Field label="Nama Tampilan">
              <Input
                placeholder="Contoh: Asep Sutisna"
                value={formState.nama_display}
                onChange={(event) => handleChange("nama_display")(event.target.value)}
                required
              />
            </Field>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Gelar Depan (opsional)">
              <Input
                placeholder="Contoh: Dr."
                value={formState.title_prefix}
                onChange={(event) => handleChange("title_prefix")(event.target.value)}
              />
            </Field>
            <Field label="Gelar Belakang (opsional)">
              <Input
                placeholder="Contoh: M.Kom"
                value={formState.title_suffix}
                onChange={(event) => handleChange("title_suffix")(event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <Field label="Program Studi">
              <Select
                value={formState.program_studi_id}
                onValueChange={(value) => handleChange("program_studi_id")(value)}
                disabled={loadingOptions || !programOptions.length}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih program studi" />
                </SelectTrigger>
                <SelectContent>
                  {programOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Departemen">
              <Select
                value={formState.department_id}
                onValueChange={(value) => handleChange("department_id")(value)}
                disabled={loadingOptions || !departmentOptions.length}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Posisi">
              <Select
                value={formState.position_id}
                onValueChange={(value) => handleChange("position_id")(value)}
                disabled={loadingOptions || !positionOptions.length}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih posisi" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {isOptionsEmpty ? (
            <p className="rounded-sm border border-dashed border-muted-foreground/40 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Data referensi (program studi, departemen, posisi) belum tersedia. Tambahkan
              terlebih dahulu sebelum membuat karyawan.
            </p>
          ) : null}

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={disabled || isOptionsEmpty}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  )
}
