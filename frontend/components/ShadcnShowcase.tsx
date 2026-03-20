"use client";

import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ShadcnShowcase() {
  const [selectValue, setSelectValue] = useState<string>("Agencies");

  return (
    <section className="mt-10">
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Design system quick check</CardTitle>
          <CardDescription>
            Validate shadcn components and theme tokens
          </CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Actions
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Starter actions</DropdownMenuLabel>
                  <DropdownMenuItem>Create record</DropdownMenuItem>
                  <DropdownMenuItem>Export CSV</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Archive all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="showcase-input">Input</Label>
            <Input id="showcase-input" placeholder="Type here..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="showcase-textarea">Textarea</Label>
            <Textarea
              id="showcase-textarea"
              placeholder="Describe what you are testing..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Resource type</Label>
            <Select
              value={selectValue}
              onValueChange={(value) => setSelectValue(value ?? "Agencies")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-card-foreground">
                <SelectItem value="Agencies">Agencies</SelectItem>
                <SelectItem value="Clients">Clients</SelectItem>
                <SelectItem value="Donors">Donors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Dialog>
            <DialogTrigger render={<Button variant="link" />}>
              Open dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog preview</DialogTitle>
                <DialogDescription>
                  This confirms overlay, content, and tokenized colors work.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </section>
  );
}

