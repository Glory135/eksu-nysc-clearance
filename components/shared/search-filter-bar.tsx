"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface SearchFilterBarProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: any) => void
  onExport: () => void
  showDepartmentFilter?: boolean
  showDateFilter?: boolean
  showStatusFilter?: boolean
  statusOptions?: { value: string; label: string }[]
}

export function SearchFilterBar({
  onSearch,
  onFilterChange,
  onExport,
  showDepartmentFilter = false,
  showDateFilter = true,
  showStatusFilter = true,
  statusOptions = [],
}: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const handleSearch = () => {
    onSearch(searchQuery)
  }

  const handleFilterChange = () => {
    onFilterChange({
      status,
      dateFrom,
      dateTo,
    })
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, matric number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {showStatusFilter && statusOptions.length > 0 && (
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value)
              handleFilterChange()
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showDateFilter && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start text-left font-normal bg-transparent">
                  <Filter className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date)
                    handleFilterChange()
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start text-left font-normal bg-transparent">
                  <Filter className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date)
                    handleFilterChange()
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </div>
  )
}
