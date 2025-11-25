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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Service, ServicePayload } from "@/lib/api"
import type { MasterDataFormProps } from "@/features/master-data/master-data-page"

export type ServiceFormState = {
  sys_code: string
  name: string
  department_id: string
  requester_scope: string
  description: string
  is_active: boolean 
}

type Props = MasterDataFormProps<Service, ServiceFormState, ServicePayload>

export function ServiceFormDialog({
  open,
  editing,
  formState,
  disabled,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof ServiceFormState) =>
    (value: string) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Layanan" : "Tambah Layanan"}</DialogTitle>
          <DialogDescription>
            {editing ? "Perbarui informasi layanan." : "Lengkapi data layanan baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const payload: ServicePayload = {
              sys_code: formState.sys_code.trim(),
              name: formState.name.trim(),
              department_id: formState.department_id.trim(),
              requester_scope: formState.requester_scope.trim(),
              description: formState.description.trim(),
              is_active: formState.is_active,
            }
            onSubmit(payload)
          }}
        >
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Service Code">
              <Input
                placeholder="e.g. IF001"
                value={formState.sys_code}
                onChange={(event) => handleChange("sys_code")(event.target.value)}
                required
              />
            </Field>
            <Field label="Service Name">
              <Input
                placeholder="e.g. Request Hosting"
                value={formState.name}
                onChange={(event) => handleChange("name")(event.target.value)}
                required
              />
            </Field>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Departemen">
              <Input
                placeholder="e.g. PTI"
                value={formState.department_id}
                onChange={(event) => handleChange("department_id")(event.target.value)}
                required
              />
            </Field>
            <Field label="Requester Scope">
              <Select value={formState.requester_scope} onValueChange={(value: "all" | "mahasiswa" | "pegawai") => handleChange("requester_scope")(value)} required>
                  <SelectTrigger className="h-8">
                      <SelectValue placeholder="Choose Scope" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="pegawai">Pegawai</SelectItem>
                  </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Description">
              <Input
                placeholder="e.g. Description"
                value={formState.description}
                onChange={(event) => handleChange("description")(event.target.value)}
                required
              />
            </Field>

            <Field label="Service Status">
              <Switch
                id="is_active"
                checked={formState.is_active}
                onCheckedChange={(checked) =>
                  onFormStateChange((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </Field>
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
