"use client"

import { useMemo, useState } from "react"

import GenericLayout from "@/components/referral-form/GenericLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Substep = {
  title: string
  content: JSX.Element
}

type Step = {
  title: string
  substeps: Substep[]
}

export default function ReferralLayoutDemoPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [substepIndex, setSubstepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps: Step[] = useMemo(
    () => [
      {
        title: "Client",
        substeps: [
          {
            title: "Client details",
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
            title: "Client contact",
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredContact">Preferred contact</Label>
                  <Select defaultValue="phone">
                    <SelectTrigger id="preferredContact">
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St" />
                </div>
              </div>
            ),
          },
        ],
      },
      {
        title: "Agent",
        substeps: [
          {
            title: "Agent details",
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
        ],
      },
      {
        title: "Referral",
        substeps: [
          {
            title: "Referral overview",
            content: (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  This is a simple preview screen. In a real flow you would summarize what was
                  entered and maybe add a final acknowledgement checkbox.
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
      },
      {
        title: "Furniture",
        substeps: [
          {
            title: "Furniture overview",
            content: (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  This is a simple preview screen. In a real flow you would summarize what was
                  entered and maybe add a final acknowledgement checkbox.
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
      },
      {
        title: "Delivery",
        substeps: [
          {
            title: "Delivery overview",
            content: (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  This is a simple preview screen. In a real flow you would summarize what was
                  entered and maybe add a final acknowledgement checkbox.
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
      },
      {
        title: "Agreements",
        substeps: [
          {
            title: "Agreement overview",
            content: (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  This is a simple preview screen. In a real flow you would summarize what was
                  entered and maybe add a final acknowledgement checkbox.
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
      },
      {
        title: "Review",
        substeps: [
          {
            title: "Final review",
            content: (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  This is a simple preview screen. In a real flow you would summarize what was
                  entered and maybe add a final acknowledgement checkbox.
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
      },
    ],
    []
  )

  const breadcrumbs = useMemo(
    () => steps.map((step, idx) => ({ label: step.title, current: idx === stepIndex })),
    [steps, stepIndex]
  )

  const currentStep = steps[stepIndex]
  const currentSubstep = currentStep.substeps[substepIndex]
  const isLastStep = stepIndex === steps.length - 1
  const isLastSubstep = substepIndex === currentStep.substeps.length - 1

  const handleNext = () => {
    if (isSubmitting) return

    if (isLastStep && isLastSubstep) {
      setIsSubmitting(true)
      // TODO: submit the form, replace delay
      setTimeout(() => {
        setIsSubmitting(false)
      }, 2000)
      return
    }

    if (isLastSubstep) {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
      setSubstepIndex(0)
      return
    }

    setSubstepIndex((prev) => Math.min(prev + 1, currentStep.substeps.length - 1))
  }

  const handleBack =
    stepIndex > 0 || substepIndex > 0
      ? () => {
          if (substepIndex > 0) {
            setSubstepIndex((prev) => Math.max(prev - 1, 0))
            return
          }

          setStepIndex((prev) => Math.max(prev - 1, 0))
          const previousStep = steps[Math.max(stepIndex - 1, 0)]
          setSubstepIndex(previousStep.substeps.length - 1)
        }
      : undefined

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4">
      <GenericLayout
        title={currentStep.title}
        activeIndex={stepIndex}
        breadcrumbs={breadcrumbs}
        onNext={handleNext}
        onBack={handleBack}
        isSubmitting={isSubmitting}
        nextLabel={isLastStep && isLastSubstep ? "Submit" : "Next"}
      >
        {currentSubstep.content}
      </GenericLayout>
    </main>
  )
}
