"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onPreset: (preset: "today" | "month" | "all") => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPreset,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel htmlFor="report-start">From</FieldLabel>
          <Input
            id="report-start"
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="h-11 text-base"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="report-end">To</FieldLabel>
          <Input
            id="report-end"
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="h-11 text-base"
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onPreset("today")}>
          Today
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onPreset("month")}>
          This Month
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onPreset("all")}>
          All Time
        </Button>
      </div>
    </div>
  );
}
