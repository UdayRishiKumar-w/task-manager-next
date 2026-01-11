"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function formatDisplayDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !Number.isNaN(date.getTime());
}

type DatePickerProps = {
  id?: string;
  label?: string;
  value?: string | null; // ISO string
  placeholder?: string;
  disabled?: boolean;
  onChange?: (iso: string | null) => void;
};

export function DatePicker({
  id = "date",
  label = "Due date",
  value,
  placeholder = "",
  disabled,
  onChange,
}: Readonly<DatePickerProps>) {
  const initialDate = value ? new Date(value) : undefined;
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const [month, setMonth] = React.useState<Date>(date ?? new Date());
  const [display, setDisplay] = React.useState(formatDisplayDate(initialDate));

  React.useEffect(() => {
    const d = value ? new Date(value) : undefined;
    setDate(d);
    setMonth(d ?? new Date());
    setDisplay(formatDisplayDate(d));
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id} className="px-1">
        {label}
      </Label>
      <div className="relative flex gap-2">
        <Input
          id={id}
          value={display}
          placeholder={placeholder}
          className="bg-background pr-10"
          disabled={disabled}
          onChange={(e) => {
            const parsed = new Date(e.target.value);
            setDisplay(e.target.value);
            if (isValidDate(parsed)) {
              setDate(parsed);
              setMonth(parsed);
              onChange?.(parsed.toISOString());
            } else {
              // user free-typed value; don't emit unless valid
              onChange?.(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button id="date-picker" variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={(newMonth) => {
                if (newMonth) setMonth(newMonth);
              }}
              onSelect={(d) => {
                setDate(d);
                setDisplay(formatDisplayDate(d));
                setOpen(false);
                if (d) {
                  setMonth(d);
                  onChange?.(d.toISOString());
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
