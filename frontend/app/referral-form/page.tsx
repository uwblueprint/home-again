"use client"

import { useMemo, useState } from "react"

import GenericLayout from "@/components/referral-form/GenericLayout"
import FurnitureForm from "@/components/referral-form/FurnitureForm"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Step = {
  title: string
  content: JSX.Element
}

export default function ReferralLayoutDemoPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps: Step[] = useMemo(
    () => [
      {
        title: "Client",
        content: (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="Alex" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Smith" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="alex@example.com" />
            </div>
          </div>
        ),
      },
      {
        title: "Agent",
        content: (
          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="case-worker">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="case-worker">Case worker</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="coordinator">Program coordinator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="standard">
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any relevant context…" />
            </div>
          </div>
        ),
      },
      {
        title: "Referral",
        content: (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This is a simple preview screen. In a real flow you would summarize what was entered
              and maybe add a final acknowledgement checkbox.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Breadcrumbs highlight the current step.</li>
              <li>Back button only appears when the handler is provided.</li>
              <li>Primary action shows loading state via <code>isSubmitting</code>.</li>
            </ul>
          </div>
        ),
      },
      {
        title: "Furniture",
        content: (
          <FurnitureForm />
        ),
      },
      {
        title: "Delivery",
        content: (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This is a simple preview screen. In a real flow you would summarize what was entered
              and maybe add a final acknowledgement checkbox.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Breadcrumbs highlight the current step.</li>
              <li>Back button only appears when the handler is provided.</li>
              <li>Primary action shows loading state via <code>isSubmitting</code>.</li>
            </ul>
          </div>
        ),
      },
      {
        title: "Agreements",
        content: (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This is a simple preview screen. In a real flow you would summarize what was entered
              and maybe add a final acknowledgement checkbox.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Breadcrumbs highlight the current step.</li>
              <li>Back button only appears when the handler is provided.</li>
              <li>Primary action shows loading state via <code>isSubmitting</code>.</li>
            </ul>
          </div>
        ),
      },
      {
        title: "Review",
        content: (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This is a simple preview screen. In a real flow you would summarize what was entered
              and maybe add a final acknowledgement checkbox.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Breadcrumbs highlight the current step.</li>
              <li>Back button only appears when the handler is provided.</li>
              <li>Primary action shows loading state via <code>isSubmitting</code>.</li>
            </ul>
          </div>
        ),
      },
    ],
    []
  )

  const baseBreadcrumbs = useMemo(() => steps.map((step) => step.title), [steps])

  const current = steps[stepIndex]

  const handleNext = () => {
    if (isSubmitting) return

    if (stepIndex === steps.length - 1) {
      setIsSubmitting(true)
      // TODO: submit the form, replace delay
      setTimeout(() => {
        setIsSubmitting(false)
      }, 2000)
      return
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = stepIndex > 0 ? () => setStepIndex((prev) => Math.max(prev - 1, 0)) : undefined

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
      <GenericLayout
        title={current.title}
        showTitle={current.title !== "Furniture"}
        breadcrumbLabels={baseBreadcrumbs}
        activeBreadcrumbIndex={stepIndex}
        onNext={handleNext}
        onBack={handleBack}
        isSubmitting={isSubmitting}
        nextLabel={stepIndex === steps.length - 1 ? "Submit" : "Next"}
      >
        {current.content}
      </GenericLayout>
    </main>
  )
}
