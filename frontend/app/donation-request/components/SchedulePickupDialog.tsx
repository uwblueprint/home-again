"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";
import { DatePicker } from "@/common/components/forms";
import { Textarea } from "@/common/components/ui/textarea";
import { Alert } from "@/common/components/ui/alert";

const MAX_NOTE_LENGTH = 500;

/** "yyyy-mm-dd" <-> local-midnight Date, so the picked day never shifts by TZ. */
const toDate = (iso: string): Date | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : undefined;
};
const toIsoDate = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

interface SchedulePickupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "schedule" = first time; "edit" = changing an existing pickup. */
  mode?: "schedule" | "edit";
  /** Whether the pickup being edited is already confirmed (shows a warning). */
  isConfirmed?: boolean;
  defaultDate?: string;
  defaultNote?: string;
  onSubmit: (date: string, note: string) => void;
}

/**
 * Schedule or edit a donation pickup: a date and an optional note.
 * In edit mode on a confirmed pickup, warns that changing the date re-triggers
 * confirmation.
 */
function SchedulePickupDialog({
  open,
  onOpenChange,
  mode = "schedule",
  isConfirmed = false,
  defaultDate = "",
  defaultNote = "",
  onSubmit,
}: SchedulePickupDialogProps) {
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState(defaultNote);

  // Reset the fields to the current pickup each time the dialog opens.
  useEffect(() => {
    if (open) {
      setDate(defaultDate);
      setNote(defaultNote);
    }
  }, [open, defaultDate, defaultNote]);

  const isValid = date.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[739px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Pickup" : "Schedule Pickup"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {mode === "edit" && isConfirmed && (
            <Alert variant="info">
              You&apos;ve already confirmed the selected date. Selecting a new
              date will require new confirmation.
            </Alert>
          )}

          <div className="flex flex-col gap-xs">
            <Label htmlFor="pickup-date">
              Date<span className="text-destructive"> *</span>
            </Label>
            <DatePicker
              id="pickup-date"
              date={toDate(date)}
              onDateChange={(picked) =>
                setDate(picked ? toIsoDate(picked) : "")
              }
              disabled={{ before: startOfToday() }}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="pickup-note">Add a note</Label>
            <Textarea
              id="pickup-note"
              placeholder="Add any details for this pickup."
              value={note}
              maxLength={MAX_NOTE_LENGTH}
              onChange={(event) => setNote(event.target.value)}
            />
            <p className="self-end text-paragraph-mini text-muted-foreground">
              {note.length}/{MAX_NOTE_LENGTH} Characters
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <DialogClose
            render={
              <Button
                disabled={!isValid}
                onClick={() => isValid && onSubmit(date, note)}
              />
            }
          >
            Save
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SchedulePickupDialog };
