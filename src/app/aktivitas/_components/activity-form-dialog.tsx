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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Activity, ActivityPayload } from "@/lib/api"
import type { MasterDataFormProps } from "@/features/master-data/master-data-page"

export type ActivityFormState = {
  kode_aktivitas: string
  nama_aktivitas: string
  status_aktivitas: "active" | "inactive"
  is_active: boolean
}

type Props = MasterDataFormProps<Activity, ActivityFormState, ActivityPayload>

export function ActivityFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof ActivityFormState) =>
    (value: string | boolean) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Aktivitas" : "Tambah Aktivitas"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi aktivitas." : "Lengkapi data aktivitas baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: ActivityPayload = {
              kode_aktivitas: formState.kode_aktivitas.trim(),
              nama_aktivitas: formState.nama_aktivitas.trim(),
              status_aktivitas: formState.status_aktivitas,
              is_active: formState.is_active,
            }
            onSubmit(payload)
          }}
        >
          <Field label="Kode Aktivitas">
            <Input
              placeholder="Contoh: TRAVEL"
              value={formState.kode_aktivitas}
              onChange={(event) => handleChange("kode_aktivitas")(event.target.value)}
              required
            />
          </Field>
          <Field label="Nama Aktivitas">
            <Input
              placeholder="Contoh: Perjalanan Dinas"
              value={formState.nama_aktivitas}
              onChange={(event) => handleChange("nama_aktivitas")(event.target.value)}
              required
            />
          </Field>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status Aktivitas</Label>
            <Select
              value={formState.status_aktivitas}
              onValueChange={(value: "active" | "inactive") => handleChange("status_aktivitas")(value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 rounded-sm border bg-muted/20 px-2 py-2">
            <Switch
              id="activity-active"
              checked={formState.is_active}
              onCheckedChange={(checked) => handleChange("is_active")(checked)}
            />
            <Label htmlFor="activity-active" className="text-xs font-medium">
              Aktivitas aktif
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
