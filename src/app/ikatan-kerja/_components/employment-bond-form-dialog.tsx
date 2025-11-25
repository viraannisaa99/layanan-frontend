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

import type { EmploymentBond, EmploymentBondPayload } from "@/lib/api"
import type { MasterDataFormProps } from "@/features/master-data/master-data-page"

export type EmploymentBondFormState = {
  kode_ikatan_kerja: string
  nama_ikatan_kerja: string
  organisasi: string
  sys_code: string
  is_active: boolean
}

type Props = MasterDataFormProps<EmploymentBond, EmploymentBondFormState, EmploymentBondPayload>

export function EmploymentBondFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof EmploymentBondFormState) =>
    (value: string | boolean) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Ikatan Kerja" : "Tambah Ikatan Kerja"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi ikatan kerja." : "Lengkapi data ikatan kerja baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: EmploymentBondPayload = {
              kode_ikatan_kerja: formState.kode_ikatan_kerja.trim(),
              nama_ikatan_kerja: formState.nama_ikatan_kerja.trim(),
              organisasi: formState.organisasi.trim(),
              sys_code: formState.sys_code.trim(),
              is_active: formState.is_active,
            }
            onSubmit(payload)
          }}
        >
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Kode">
              <Input
                placeholder="Contoh: PKWT"
                value={formState.kode_ikatan_kerja}
                onChange={(event) => handleChange("kode_ikatan_kerja")(event.target.value)}
                required
              />
            </Field>
            <Field label="Sys Code">
              <Input
                placeholder="Contoh: pkwt"
                value={formState.sys_code}
                onChange={(event) => handleChange("sys_code")(event.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Nama Ikatan Kerja">
            <Input
              placeholder="Contoh: Perjanjian Kerja Waktu Tertentu"
              value={formState.nama_ikatan_kerja}
              onChange={(event) => handleChange("nama_ikatan_kerja")(event.target.value)}
              required
            />
          </Field>
          <Field label="Organisasi">
            <Input
              placeholder="Nama organisasi"
              value={formState.organisasi}
              onChange={(event) => handleChange("organisasi")(event.target.value)}
              required
            />
          </Field>
          <div className="flex items-center gap-2 rounded-sm border bg-muted/20 px-2 py-2">
            <Switch
              id="bond-active"
              checked={formState.is_active}
              onCheckedChange={(checked) => handleChange("is_active")(checked)}
            />
            <Label htmlFor="bond-active" className="text-xs font-medium">
              Ikatan kerja aktif
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
