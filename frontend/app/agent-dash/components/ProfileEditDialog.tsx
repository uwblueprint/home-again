"use client";

import { useEffect, useState } from "react";

import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";

import type { AgentProfile } from "../data/mockProfile";

type ProfileEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: AgentProfile;
  onSave: (profile: AgentProfile) => void;
};

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileEditDialogProps) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (open) {
      setDraft(profile);
    }
  }, [open, profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[7.5rem] max-h-[calc(100vh-8.5rem)] w-full max-w-[1000px] translate-y-0 overflow-y-auto sm:max-w-[1000px]"
      >
        <DialogHeader className="after:hidden">
          <DialogTitle className="text-heading-2 font-semibold">
            My Profile
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input
                id="profile-first-name"
                value={draft.firstName}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input
                id="profile-last-name"
                value={draft.lastName}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={draft.email}
                disabled
                readOnly
                aria-readonly="true"
                className="bg-secondary text-muted-foreground disabled:bg-secondary disabled:opacity-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-phone">Phone number</Label>
              <Input
                id="profile-phone"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
