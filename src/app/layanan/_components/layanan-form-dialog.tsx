"use client"

import { useEffect, type ReactNode } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Service, ServicePayload } from "@/lib/api"

export type ServiceFormState = {
  sys_code: string
  name: string
  department_id: string
  requester_scope: string
  description: string
  is_active: boolean
}

type SelectOption = { value: string; label: string }

type Props = MasterDataFormProps<Service, ServiceFormState, ServicePayload> & {
  departmentOptions: SelectOption[]
  loadingDepartments?: boolean
}

export function ServiceFormDialog({
  open,
  editing,
  formState,
  disabled,
  departmentOptions,
  loadingDepartments = false,
  onOpenChange,
  onFormStateChange,
  onSubmit,
}: Props) {
  const handleChange =
    (field: keyof ServiceFormState) =>
    (value: string) => {
      onFormStateChange((prev) => ({ ...prev, [field]: value }))
    }

  useEffect(() => {
    if (editing || formState.department_id || !departmentOptions.length) return
    onFormStateChange((prev) =>
      prev.department_id ? prev : { ...prev, department_id: departmentOptions[0].value },
    )
  }, [editing, departmentOptions, formState.department_id, onFormStateChange])

  const selectedDeptMissing =
    Boolean(formState.department_id) &&
    !departmentOptions.some((dept) => dept.value === formState.department_id)

  type RequesterScope = "All" | "Mahasiswa" | "Pegawai"

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
                placeholder="e.g. RQ_HSP"
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
              <Select
                value={formState.department_id}
                onValueChange={(value) => handleChange("department_id")(value)}
                disabled={loadingDepartments || !departmentOptions.length}
              >
                <SelectTrigger className="h-8" aria-busy={loadingDepartments}>
                  <SelectValue placeholder={loadingDepartments ? "Memuat..." : "Pilih departemen"} />
                </SelectTrigger>
                <SelectContent>
                  <DepartmentSelectOptions
                    departments={departmentOptions}
                    formState={formState}
                    selectedDeptMissing={selectedDeptMissing}
                  />
                </SelectContent>
              </Select>
              <input
                type="hidden"
                value={formState.department_id}
                required
                aria-hidden="true"
              />
            </Field>
            <Field label="Requester Scope">
              <Select value={formState.requester_scope} onValueChange={(requester_scope: RequesterScope) => handleChange("requester_scope")(requester_scope)} required>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Choose Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                  <SelectItem value="Pegawai">Pegawai</SelectItem>
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

function DepartmentSelectOptions({
  departments,
  formState,
  selectedDeptMissing,
}: {
  departments: SelectOption[]
  formState: ServiceFormState
  selectedDeptMissing: boolean
}) {
  return (
    <>
      {departments.map((dept) => (
        <SelectItem key={dept.value} value={dept.value}>
          {dept.label}
        </SelectItem>
      ))}

      {selectedDeptMissing && (
        <SelectItem value={formState.department_id}>
          ID saat ini: {formState.department_id}
        </SelectItem>
      )}
    </>
  )
}
