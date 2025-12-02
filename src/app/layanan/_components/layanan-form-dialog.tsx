"use client"

import { useEffect, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { useQuery } from "@tanstack/react-query"
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

import type { Department, Service, ServicePayload } from "@/lib/api"
import { listDepartments } from "@/lib/api"
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["departments", "options"],
    queryFn: () => listDepartments({ status: "active", perPage: 200 }),
  });

  const departments: Department[] = data?.data ?? []

  useEffect(() => {
    if (editing || formState.department_id || !departments.length) return;
    onFormStateChange(prev =>
      prev.department_id ? prev : { ...prev, department_id: departments[0].id }
    );
  }, [editing, departments, formState.department_id, onFormStateChange]);

  const selectedDeptMissing =
    Boolean(formState.department_id) &&
    !departments.some((dept) => dept.id === formState.department_id)

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
                disabled={isLoading || isError}
              >
                <SelectTrigger className="h-8" aria-busy={isLoading}>
                  <SelectValue
                    placeholder={isLoading ? "Memuat..." : isError ? "Gagal memuat" : "Pilih departemen"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <DepartmentSelectOptions
                    departments={departments}
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
              {isError ? (
                <p className="text-[11px] text-destructive">Tidak dapat memuat list.</p>
              ) : null}
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
  departments: Department[]
  formState: ServiceFormState
  selectedDeptMissing: boolean
}) {
  return (
    <>
      {departments.map((dept) => (
        <SelectItem key={dept.id} value={dept.id}>
          {dept.name} ({dept.alias})
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


