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
import { Textarea } from "@/components/ui/textarea"

import type { LeaveQuota, LeaveQuotaPayload } from "@/lib/api"
import type { MasterDataFormProps } from "@/features/master-data/master-data-page"

export type LeaveQuotaFormState = {
  jumlah_cuti: number
  keterangan: string
}

type Props = MasterDataFormProps<LeaveQuota, LeaveQuotaFormState, LeaveQuotaPayload>

export function LeaveQuotaFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof LeaveQuotaFormState) =>
    (value: string | number) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Jumlah Cuti" : "Tambah Jumlah Cuti"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui nilai jumlah cuti." : "Definisikan jumlah cuti baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: LeaveQuotaPayload = {
              jumlah_cuti: Number(formState.jumlah_cuti) || 0,
              keterangan: formState.keterangan.trim() ? formState.keterangan.trim() : null,
            }
            onSubmit(payload)
          }}
        >
          <Field label="Jumlah Cuti (hari)">
            <Input
              type="number"
              min={0}
              placeholder="Contoh: 12"
              value={formState.jumlah_cuti}
              onChange={(event) => handleChange("jumlah_cuti")(Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Keterangan (opsional)">
            <Textarea
              placeholder="Deskripsi singkat"
              value={formState.keterangan}
              onChange={(event) => handleChange("keterangan")(event.target.value)}
              rows={3}
            />
          </Field>
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
