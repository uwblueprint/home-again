"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/common/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/common/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        data-empty={!date}
        className="flex min-h-9 w-full items-center gap-xs rounded-lg border border-border bg-input px-sm py-[var(--scale-hacks-7p5)] text-left text-sm text-foreground shadow-[var(--shadow-xs)] transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-[var(--unofficial-border-4)] data-popup-open:bg-accent data-popup-open:ring-3 data-popup-open:ring-ring data-[empty=true]:text-muted-foreground"
      >
        <CalendarIcon className="size-4 shrink-0" />
        {date ? format(date, "MMMM d, yyyy") : placeholder}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border border-border p-md shadow-[var(--shadow-md)] ring-0"
        align="start"
      >
        <Calendar
          className="p-0"
          mode="single"
          selected={date}
          onSelect={onDateChange}
          defaultMonth={date}
          captionLayout="dropdown-months"
        />
      </PopoverContent>
    </Popover>
  );
}