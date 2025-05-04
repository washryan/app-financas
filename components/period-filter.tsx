"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type PeriodType = "day" | "week" | "month" | "year" | "custom"

interface DateRange {
  from: Date
  to: Date
}

interface PeriodFilterProps {
  onPeriodChange: (period: PeriodType, dateRange?: DateRange) => void
}

export function PeriodFilter({ onPeriodChange }: PeriodFilterProps) {
  const [period, setPeriod] = useState<PeriodType>("month")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })
  const [date, setDate] = useState<Date>(new Date())

  const handlePeriodChange = (value: PeriodType) => {
    setPeriod(value)

    let newDateRange: DateRange = { from: new Date(), to: new Date() }
    const now = new Date()

    switch (value) {
      case "day":
        newDateRange = {
          from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
        }
        break
      case "week":
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
        newDateRange = {
          from: new Date(now.getFullYear(), now.getMonth(), diff),
          to: new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59),
        }
        break
      case "month":
        newDateRange = {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        }
        break
      case "year":
        newDateRange = {
          from: new Date(now.getFullYear(), 0, 1),
          to: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
        }
        break
      case "custom":
        // Keep the current date range for custom
        newDateRange = dateRange
        break
    }

    setDateRange(newDateRange)
    onPeriodChange(value, newDateRange)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      const newDateRange = {
        from: selectedDate,
        to: selectedDate,
      }
      setDateRange(newDateRange)
      onPeriodChange("custom", newDateRange)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Hoje</SelectItem>
          <SelectItem value="week">Esta semana</SelectItem>
          <SelectItem value="month">Este mês</SelectItem>
          <SelectItem value="year">Este ano</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {period === "custom" && (
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
