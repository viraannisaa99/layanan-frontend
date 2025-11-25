"use client"

import type { Dispatch, SetStateAction } from "react"
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

import type { Department, DepartmentPayload } from "@/lib/api"

export type DepartmentFormState = DepartmentPayload & { major_id?: string | null }

interface DepartmentFormDialogProps {
  open: boolean
  editing: Department | null
  formState: DepartmentFormState
  disabled: boolean
  onOpenChange: (open: boolean) => void
  onFormStateChange: Dispatch<SetStateAction<DepartmentFormState>>
  onSubmit: (payload: DepartmentPayload) => void
}

export function DepartmentFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: DepartmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Departemen" : "Tambah Departemen"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi departemen." : "Lengkapi data untuk menambahkan departemen baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: DepartmentPayload = {
              name: formState.name.trim(),
              alias: formState.alias.trim(),
              sys_code: formState.sys_code.trim(),
              is_active: formState.is_active,
              major_id:
                formState.major_id && formState.major_id.trim().length > 0
                  ? formState.major_id.trim()
                  : null,
            }
            onSubmit(payload)
          }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Nama Departemen</label>
            <Input
              placeholder="Contoh: Departemen Keuangan"
              value={formState.name}
              onChange={(event) =>
                onFormStateChange((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Alias / Singkatan</label>
            <Input
              placeholder="Contoh: FIN"
              value={formState.alias}
              onChange={(event) =>
                onFormStateChange((prev) => ({ ...prev, alias: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Sys Code</label>
            <Input
              placeholder="contoh: kabag"
              value={formState.sys_code}
              onChange={(event) =>
                onFormStateChange((prev) => ({ ...prev, sys_code: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Major ID (opsional)</label>
            <Input
              placeholder="UUID jurusan (jika ada)"
              value={formState.major_id ?? ""}
              onChange={(event) =>
                onFormStateChange((prev) => ({ ...prev, major_id: event.target.value }))
              }
            />
          </div>
          <div className="flex items-center gap-2 rounded-sm border bg-muted/20 px-2 py-2">
            <Switch
              id="dept-active"
              checked={formState.is_active}
              onCheckedChange={(checked) =>
                onFormStateChange((prev) => ({ ...prev, is_active: checked }))
              }
            />
            <label htmlFor="dept-active" className="text-xs font-medium">
              Departemen aktif
            </label>
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
