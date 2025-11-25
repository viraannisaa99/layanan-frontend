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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import type { Position, PositionPayload } from "@/lib/api"
import type { MasterDataFormProps } from "@/features/master-data/master-data-page"

export type PositionFormState = {
  nama_posisi: string
  alias_posisi: string
  sys_code: string
  is_active: boolean
}

type Props = MasterDataFormProps<Position, PositionFormState, PositionPayload>

export function PositionFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof PositionFormState) =>
    (value: string | boolean) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Posisi" : "Tambah Posisi"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi posisi pegawai." : "Lengkapi data posisi baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: PositionPayload = {
              nama_posisi: formState.nama_posisi.trim(),
              alias_posisi: formState.alias_posisi.trim(),
              sys_code: formState.sys_code.trim(),
              is_active: formState.is_active,
            }
            onSubmit(payload)
          }}
        >
          <Field label="Nama Posisi">
            <Input
              placeholder="Contoh: Manajer Operasional"
              value={formState.nama_posisi}
              onChange={(event) => handleChange("nama_posisi")(event.target.value)}
              required
            />
          </Field>
          <Field label="Alias / Singkatan">
            <Input
              placeholder="Contoh: OPS-MGR"
              value={formState.alias_posisi}
              onChange={(event) => handleChange("alias_posisi")(event.target.value)}
              required
            />
          </Field>
          <Field label="Sys Code">
            <Input
              placeholder="Contoh: ops_mgr"
              value={formState.sys_code}
              onChange={(event) => handleChange("sys_code")(event.target.value)}
              required
            />
          </Field>
          <div className="flex items-center gap-2 rounded-sm border bg-muted/20 px-2 py-2">
            <Switch
              id="position-active"
              checked={formState.is_active}
              onCheckedChange={(checked) => handleChange("is_active")(checked)}
            />
            <Label htmlFor="position-active" className="text-xs font-medium">
              Posisi aktif
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
