"use client"

import { useCallback, useState } from "react"
import { Check, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type StatusFilterOption = {
  label: string
  value: string
}

interface StatusFilterChipProps {
  value: string
  options: StatusFilterOption[]
  onChange: (next: string) => void
  triggerLabel?: string
}

export function StatusFilterChip({
  value,
  options,
  onChange,
  triggerLabel = "Status",
}: StatusFilterChipProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  const handleSelect = useCallback(
    (next: string) => {
      onChange(next)
      setOpen(false)
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    onChange("all")
    setOpen(false)
  }, [onChange])

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-md border-dashed px-3 text-xs font-medium"
          >
            <Plus className="mr-1.5 h-3 w-3" />
            {triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 rounded-md p-0 shadow-md">
          <div className="border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {triggerLabel}
          </div>
          <Command>
            <CommandList>
              <CommandGroup className="p-1">
                {options.map((option) => {
                  const isSelected = option.value === value
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </span>
                      <span className="flex-1">{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <Button
            variant="ghost"
            disabled={value === "all"}
            className="w-full rounded-none border-t text-xs font-semibold text-muted-foreground"
            onClick={handleClear}
          >
            Clear filter
          </Button>
        </PopoverContent>
      </Popover>
      {value !== "all" && selected ? (
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-md border px-3 text-xs"
          onClick={() => onChange("all")}
        >
          {selected.label}
          <X className="ml-1 h-3 w-3" />
        </Button>
      ) : null}
    </div>
  )
}
