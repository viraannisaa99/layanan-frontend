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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import type { EmployeeClass, EmployeeClassPayload } from "@/lib/api"
import type { MasterDataFormProps } from "@/features/master-data/master-data-page"

export type EmployeeClassFormState = {
  kelas_pegawai: string
  ref_jumlah_cuti: string
  is_lembur: boolean
}

type Props = MasterDataFormProps<EmployeeClass, EmployeeClassFormState, EmployeeClassPayload>

export function EmployeeClassFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof EmployeeClassFormState) =>
    (value: string | boolean) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Kelas Pegawai" : "Tambah Kelas Pegawai"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi kelas pegawai." : "Lengkapi data kelas/level pegawai."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const trimmed = formState.ref_jumlah_cuti.trim()
            const refValue =
              trimmed.length === 0
                ? null
                : Number.isNaN(Number(trimmed))
                  ? null
                  : Number(trimmed)
            const payload: EmployeeClassPayload = {
              kelas_pegawai: formState.kelas_pegawai.trim(),
              ref_jumlah_cuti: refValue,
              is_lembur: formState.is_lembur,
            }
            onSubmit(payload)
          }}
        >
          <Field label="Nama Kelas">
            <Input
              placeholder="Contoh: Kelas I"
              value={formState.kelas_pegawai}
              onChange={(event) => handleChange("kelas_pegawai")(event.target.value)}
              required
            />
          </Field>
          <Field label="Referensi Jumlah Cuti (hari)">
            <Input
              type="number"
              min={0}
              placeholder="Contoh: 12"
              value={formState.ref_jumlah_cuti}
              onChange={(event) => handleChange("ref_jumlah_cuti")(event.target.value)}
            />
          </Field>
          <div className="flex items-center gap-2 rounded-sm border bg-muted/20 px-2 py-2">
            <Switch
              id="lembur-toggle"
              checked={formState.is_lembur}
              onCheckedChange={(checked) => handleChange("is_lembur")(checked)}
            />
            <Label htmlFor="lembur-toggle" className="text-xs font-medium">
              Berhak Lembur
            </Label>
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
