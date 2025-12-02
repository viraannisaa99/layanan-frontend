import type {
  ExtendedColumnFilter,
  ExtendedColumnSort,
} from "@/types/data-table"

const API_BASE = "/api/backend"

export type ApiResponse<T> = {
  success: boolean
  code: number
  message: string
  data: T
  errors?: ApiError[]
  meta?: Meta
  links?: Record<string, string>
}

export type ApiError = {
  code: string
  message: string
  field?: string | null
  details?: Record<string, unknown>
}

export type Meta = {
  api_version?: string
  timestamp?: string
  request_id?: string
  pagination?: {
    page?: number
    per_page?: number
    total_items?: number
    total_pages?: number
  }
  sort?: {
    by?: string
    order?: "asc" | "desc"
  }
  filters?: Record<string, unknown>
}

export type Service = {
  id: string
  sys_code: string
  name: string
  department_id: string
  requester_scope: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type ServicePayload = {
  sys_code: string
  name: string
  department_id: string
  requester_scope: string
  description: string
  is_active: boolean
}

export type Department = {
  id: string
  name: string
  alias: string
  major_id?: string | null
  is_active: boolean
  sys_code: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type DepartmentPayload = {
  name: string
  alias: string
  major_id?: string | null
  is_active: boolean
  sys_code: string
}

export type StudyProgram = {
  id: string
  kode_prodi: string
  nama_prodi: string
  alias_prodi: string
  jenjang_pendidikan: string
  nama_jurusan: string
  alias_jurusan?: string | null
  status_prodi: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type StudyProgramPayload = {
  kode_prodi: string
  nama_prodi: string
  alias_prodi: string
  jenjang_pendidikan: string
  nama_jurusan: string
  alias_jurusan?: string | null
  status_prodi?: string
}

export type Position = {
  id: string
  nama_posisi: string
  alias_posisi: string
  is_active: boolean
  sys_code: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type PositionPayload = {
  nama_posisi: string
  alias_posisi: string
  is_active: boolean
  sys_code: string
}

export type EmployeeClass = {
  id: string
  kelas_pegawai: string
  ref_jumlah_cuti?: number | null
  is_lembur: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type EmployeeClassPayload = {
  kelas_pegawai: string
  ref_jumlah_cuti?: number | null
  is_lembur: boolean
}

export type Activity = {
  id: string
  kode_aktivitas: string
  nama_aktivitas: string
  status_aktivitas: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type ActivityPayload = {
  kode_aktivitas: string
  nama_aktivitas: string
  status_aktivitas: string
  is_active: boolean
}

export type LeaveQuota = {
  id: string
  jumlah_cuti: number
  keterangan?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type LeaveQuotaPayload = {
  jumlah_cuti: number
  keterangan?: string | null
}

export type EmploymentBond = {
  id: string
  kode_ikatan_kerja: string
  nama_ikatan_kerja: string
  organisasi: string
  is_active: boolean
  sys_code: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type EmploymentBondPayload = {
  kode_ikatan_kerja: string
  nama_ikatan_kerja: string
  organisasi: string
  is_active: boolean
  sys_code: string
}

export type Employee = {
  id: string
  nip: string
  inisial: string
  nama_display: string
  title_prefix?: string | null
  title_suffix?: string | null
  program_studi_id: string
  department_id: string
  position_id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type EmployeePayload = {
  nip: string
  inisial: string
  nama_display: string
  title_prefix?: string | null
  title_suffix?: string | null
  program_studi_id: string
  department_id: string
  position_id: string
}

type FetchOptions<T> = {
  init?: RequestInit
  fallback?: T
}

async function apiRequest<T>(
  path: string,
  options?: FetchOptions<T>
): Promise<ApiResponse<T>> {
  const headers = new Headers(options?.init?.headers)
  headers.set("Content-Type", "application/json")

  const response = await fetch(`${API_BASE}${path}`, {
    ...options?.init,
    headers,
  })

  if (response.status === 204) {
    return {
      success: true,
      code: 204,
      message: "No content",
      data: (options?.fallback ?? (undefined as T)) as T,
      errors: [],
      meta: undefined,
    }
  }

  const isJson =
    response.headers.get("content-type")?.includes("application/json")
  if (!isJson) {
    const text = await response.text()
    throw new Error(text || `Server returned ${response.status}`)
  }

  let payload: ApiResponse<T>
  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch (error) {
    throw new Error(`Tidak dapat mem-parsing respons (${error})`)
  }

  if (!payload.success || !response.ok) {
    const message =
      payload.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload
}

async function apiFetch<T>(
  path: string,
  options?: FetchOptions<T>
): Promise<T> {
  const payload = await apiRequest<T>(path, options)

  if (payload.data === undefined || payload.data === null) {
    if (options?.fallback !== undefined) {
      return options.fallback
    }
    return undefined as T
  }

  return payload.data
}

type DepartmentListParams = {
  status?: string
  page?: number
  perPage?: number
  search?: string
  sort?: ExtendedColumnSort<Department>[]
  filters?: ExtendedColumnFilter<Department>[]
  joinOperator?: "and" | "or"
}

type PaginatedListParams = {
  status?: string
  page?: number
  perPage?: number
  search?: string
}

function buildListSearchParams(params: PaginatedListParams) {
  const search = new URLSearchParams()
  if (params.status) {
    search.set("status", params.status)
  }
  if (params.page) {
    search.set("page", params.page.toString())
  }
  if (params.perPage) {
    search.set("per_page", params.perPage.toString())
  }
  if (params.search) {
    search.set("search", params.search)
  }
  return search
}

type EmployeeListParams = PaginatedListParams & {
  program_studi_id?: string
  department_id?: string
  position_id?: string
}

// Department

export function getDepartementsMaster(params: DepartmentListParams = {}) {
  const search = new URLSearchParams()
  search.set("status", params.status ?? "all")

  return apiRequest<Department[]>(
    `/api/v1/departments?${search.toString()}`, {
    init: {
      headers: {
        "X-Backend-Base-Url": "https://api.devpcr.duckdns.org/"
      }
    }
  }
  )
}

export function listDepartments(params: DepartmentListParams = {}) {
  const search = new URLSearchParams()
  search.set("status", params.status ?? "all")
  if (params.page) {
    search.set("page", params.page.toString())
  }
  if (params.perPage) {
    search.set("per_page", params.perPage.toString())
  }
  if (params.search) {
    search.set("search", params.search)
  }
  if (params.sort?.length) {
    search.set("sort", JSON.stringify(params.sort))
  }
  if (params.filters?.length) {
    search.set("filters", JSON.stringify(params.filters))
    if (params.joinOperator) {
      search.set("join_operator", params.joinOperator)
    }
  }
  return apiRequest<Department[]>(
    `/api/v1/departments?${search.toString()}`
  )
}

export function createDepartment(
  payload: DepartmentPayload
) {
  return apiFetch<Department>(`/api/v1/departments`, {
    init: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  })
}

export function updateDepartment(
  id: string,
  payload: DepartmentPayload
) {
  return apiFetch<Department>(`/api/v1/departments/${id}`, {
    init: {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  })
}

export function deleteDepartment(id: string) {
  return apiFetch<null>(`/api/v1/departments/${id}`, {
    init: { method: "DELETE" },
    fallback: null,
  })
}

// Study Programs

export function getStudyProgramsMaster(params: PaginatedListParams = {}) {
  const search = buildListSearchParams(params)
  return apiRequest<StudyProgram[]>(`/api/v1/study-programs?${search.toString()}`, {
    init: {
      headers: {
        "X-Backend-Base-Url": "https://api.devpcr.duckdns.org/"
      }
    }
  })
}

export function listStudyPrograms(params: PaginatedListParams = {}) {
  const search = new URLSearchParams()
  search.set("status", params.status ?? "all")
  if (params.page) {
    search.set("page", params.page.toString())
  }
  if (params.perPage) {
    search.set("per_page", params.perPage.toString())
  }
  if (params.search) {
    search.set("search", params.search)
  }

  return apiRequest<StudyProgram[]>(
    `/api/v1/study-programs?${search.toString()}`
  )
}

export function createStudyProgram(payload: StudyProgramPayload) {
  return apiFetch<StudyProgram>(`/api/v1/study-programs`, {
    init: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  })
}

export function updateStudyProgram(id: string, payload: StudyProgramPayload) {
  return apiFetch<StudyProgram>(`/api/v1/study-programs/${id}`, {
    init: {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  })
}

export function deleteStudyProgram(id: string) {
  return apiFetch<null>(`/api/v1/study-programs/${id}`, {
    init: { method: "DELETE" },
    fallback: null,
  })
}

// Positions

export function getPositionsMaster(params: PaginatedListParams = {}) {
  const search = new URLSearchParams()
  search.set("status", params.status ?? "all")
  return apiRequest<Position[]>(`/api/v1/positions?${search.toString()}`, {
    init: {
      headers: {
        "X-Backend-Base-Url": "https://api.devpcr.duckdns.org/"
      }
    }
  })
}

export function listPositions(params: PaginatedListParams = {}) {
  const search = buildListSearchParams(params)
  search.set("status", params.status ?? "all")
  if (params.page) {
    search.set("page", params.page.toString())
  }
  if (params.perPage) {
    search.set("per_page", params.perPage.toString())
  }
  if (params.search) {
    search.set("search", params.search)
  }
  return apiRequest<Position[]>(`/api/v1/positions?${search.toString()}`)
}

export function createPosition(payload: PositionPayload) {
  return apiFetch<Position>(`/api/v1/positions`, {
    init: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  })
}

export function updatePosition(id: string, payload: PositionPayload) {
  return apiFetch<Position>(`/api/v1/positions/${id}`, {
    init: {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  })
}

export function deletePosition(id: string) {
  return apiFetch<null>(`/api/v1/positions/${id}`, {
    init: { method: "DELETE" },
    fallback: null,
  })
}

// Employees

export function listEmployees(params: EmployeeListParams = {}) {
  const search = new URLSearchParams()
  if (params.page) {
    search.set("page", params.page.toString())
  }
  if (params.perPage) {
    search.set("per_page", params.perPage.toString())
  }
  if (params.search) {
    search.set("search", params.search)
  }
  if (params.program_studi_id) {
    search.set("program_studi_id", params.program_studi_id)
  }
  if (params.department_id) {
    search.set("department_id", params.department_id)
  }
  if (params.position_id) {
    search.set("position_id", params.position_id)
  }
  return apiRequest<Employee[]>(`/api/v1/employees?${search.toString()}`)
}

export function createEmployee(payload: EmployeePayload) {
  return apiFetch<Employee>(`/api/v1/employees`, {
    init: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  })
}

export function updateEmployee(id: string, payload: EmployeePayload) {
  return apiFetch<Employee>(`/api/v1/employees/${id}`, {
    init: {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  })
}

export function deleteEmployee(id: string) {
  return apiFetch<null>(`/api/v1/employees/${id}`, {
    init: { method: "DELETE" },
    fallback: null,
  })
}

// Services

export function listServices(params: PaginatedListParams = {}) {
  const search = buildListSearchParams(params)
  return apiRequest<Service[]>(`/api/v1/services?${search.toString()}`)
}

export function createService(payload: ServicePayload) {
  return apiFetch<Service>(`/api/v1/services`, {
    init: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  })
}

export function updateService(id: string, payload: ServicePayload) {
  return apiFetch<Service>(`/api/v1/service/${id}`, {
    init: {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  })
}

export function deleteService(id: string) {
  return apiFetch<null>(`/api/v1/service/${id}`, {
    init: { method: "DELETE" },
    fallback: null,
  })
}
