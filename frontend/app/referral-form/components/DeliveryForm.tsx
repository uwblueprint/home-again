"use client"

import { Info } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select"
import { Textarea } from "@/common/components/ui/textarea"
import { cn } from "@/common/lib/utils"

export type DeliveryFormData = {
  address1: string
  address2: string
  city: string
  province: string
  country: string
  postalCode: string
  dateNeeded: string
  notes: string
  otherDetails: string
  selectedMoves: Record<string, boolean>
}

type DeliveryFormProps = {
  className?: string
  data?: DeliveryFormData
  showErrors?: boolean
  onValidityChange?: (isValid: boolean) => void
  onDataChange?: (data: DeliveryFormData) => void
  /** Hide the in-page heading — the edit Dialog renders its own. */
  hideHeading?: boolean
}

const PROVINCES = ["Newfoundland and Labrador"]

const COUNTRIES = ["Canada"]

const ALLOWED_PROVINCE = "Newfoundland and Labrador"
const ALLOWED_COUNTRY = "Canada"

const MUNICIPALITIES = [
  "St. John's",
  "Mount Pearl",
  "Paradise",
  "Conception Bay South",
  "Petty Harbour/Maddox Cove",
  "Holyrood",
  "Portugal Cove-St. Philips",
  "Bell Island",
  "Bauline",
  "Pouch Cove",
  "Flatrock",
  "Torbay",
  "Logy Bay - Middle Cove - Outer Cove",
  "Bay Bulls",
  "Witless Bay",
]

const MOVE_OPTIONS = [
  { id: "staircases", label: "Staircases" },
  { id: "narrow-passageways", label: "Narrow passageways" },
  { id: "adequate-parking", label: "Adequate parking" },
  { id: "other", label: "Other" },
]

const buildDefaultMoves = () =>
  Object.fromEntries(MOVE_OPTIONS.map((option) => [option.id, false]))

const normalizeDeliveryData = (data?: DeliveryFormData): DeliveryFormData => ({
  address1: data?.address1 ?? "",
  address2: data?.address2 ?? "",
  city: data?.city ?? "",
  province: data?.province || ALLOWED_PROVINCE,
  country: data?.country || ALLOWED_COUNTRY,
  postalCode: data?.postalCode ?? "",
  dateNeeded: data?.dateNeeded ?? "",
  notes: data?.notes ?? "",
  otherDetails: data?.otherDetails ?? "",
  selectedMoves: {
    ...buildDefaultMoves(),
    ...(data?.selectedMoves ?? {}),
  },
})

export default function DeliveryForm({
  className,
  data,
  showErrors = false,
  onValidityChange,
  onDataChange,
  hideHeading = false,
}: DeliveryFormProps) {
  const initialData = useMemo(() => normalizeDeliveryData(data), [data])
  const [address1, setAddress1] = useState(initialData.address1)
  const [address2, setAddress2] = useState(initialData.address2)
  const [city, setCity] = useState(initialData.city)
  const [province, setProvince] = useState(initialData.province)
  const [country, setCountry] = useState(initialData.country)
  const [postalCode, setPostalCode] = useState(initialData.postalCode)
  const [dateNeeded, setDateNeeded] = useState(initialData.dateNeeded)
  const [notes, setNotes] = useState(initialData.notes)
  const [otherDetails, setOtherDetails] = useState(initialData.otherDetails)
  const [selectedMoves, setSelectedMoves] = useState<Record<string, boolean>>(
    initialData.selectedMoves
  )

  const errors = useMemo(() => {
    const address1Error = address1.trim()
      ? ""
      : "Address line 1"
    const cityError = city.trim() ? "" : "Select a municipality."
    const provinceError = province
      ? province === ALLOWED_PROVINCE
        ? ""
        : "Deliveries are not supported in this region."
      : "Select your agency's province/territory"
    const countryError = country
      ? country === ALLOWED_COUNTRY
        ? ""
        : "Deliveries are not supported in this region."
      : "Select your agency's country."
    const otherError = selectedMoves.other && !otherDetails.trim()
      ? "Enter additional details."
      : ""

    return {
      address1: address1Error,
      city: cityError,
      province: provinceError,
      country: countryError,
      other: otherError,
    }
  }, [address1, city, country, otherDetails, province, selectedMoves.other])

  const isValid = useMemo(
    () => Object.values(errors).every((error) => !error),
    [errors]
  )

  const showError = (field: keyof typeof errors) =>
    Boolean(showErrors && errors[field])

  useEffect(() => {
    onValidityChange?.(isValid)
  }, [isValid, onValidityChange])

  useEffect(() => {
    onDataChange?.({
      address1,
      address2,
      city,
      province,
      country,
      postalCode,
      dateNeeded,
      notes,
      otherDetails,
      selectedMoves,
    })
  }, [
    address1,
    address2,
    city,
    province,
    country,
    postalCode,
    dateNeeded,
    notes,
    otherDetails,
    selectedMoves,
    onDataChange,
  ])

  return (
    <div className={cn("self-stretch flex flex-col items-start gap-6", className)}>
      {hideHeading ? null : (
        <div className="self-stretch flex flex-col items-start gap-3">
          <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
            Delivery Details
          </h2>
          <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
            Describe the client&apos;s delivery needs and any access details.
          </p>
        </div>
      )}
      <div className="self-stretch flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-foreground">
        <Info className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        <span>
          Home Again Furniture Bank is currently only servicing Newfoundland and
          Labrador, Canada
        </span>
      </div>

      <div className="self-stretch grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="delivery-address-1">
            Address line 1<span className="text-destructive">*</span>
          </Label>
          <Input
            id="delivery-address-1"
            placeholder="Street address"
            autoComplete="address-line1"
            value={address1}
            onChange={(event) => setAddress1(event.target.value)}
            aria-invalid={showError("address1")}
            className={cn(
              showError("address1") && "border-destructive"
            )}
          />
          {showError("address1") ? (
            <p className="text-xs text-destructive">{errors.address1}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="delivery-address-2">Address line 2</Label>
          <Input
            id="delivery-address-2"
            placeholder="Suite, unit, floor, or building"
            autoComplete="address-line2"
            value={address2}
            onChange={(event) => setAddress2(event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="delivery-municipality">
              Municipality<span className="text-destructive">*</span>
            </Label>
            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value ?? "")
              }}
            >
              <SelectTrigger
                id="delivery-municipality"
                aria-invalid={showError("city")}
                className={cn(
                  "w-full",
                  showError("city") && "border-destructive"
                )}
              >
                <SelectValue placeholder="Select a municipality" />
              </SelectTrigger>
              <SelectContent>
                {MUNICIPALITIES.map((municipality) => (
                  <SelectItem key={municipality} value={municipality}>
                    {municipality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showError("city") ? (
              <p className="text-xs text-destructive">{errors.city}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-province">
              Province/territory<span className="text-destructive">*</span>
            </Label>
            <Select
              value={province}
              onValueChange={(value) => {
                setProvince(value ?? "")
              }}
            >
              <SelectTrigger
                id="delivery-province"
                aria-invalid={showError("province")}
                className={cn(
                  "w-full",
                  showError("province") && "border-destructive"
                )}
              >
                <SelectValue
                  placeholder="Select a province/territory"
                />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((provinceOption) => (
                  <SelectItem
                    key={provinceOption}
                    value={provinceOption.toLowerCase()}
                  >
                    {provinceOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showError("province") ? (
              <p className="text-xs text-destructive">{errors.province}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-country">
              Country<span className="text-destructive">*</span>
            </Label>
            <Select
              value={country}
              onValueChange={(value) => {
                setCountry(value ?? "")
              }}
            >
              <SelectTrigger
                id="delivery-country"
                aria-invalid={showError("country")}
                className={cn(
                  "w-full",
                  showError("country") && "border-destructive"
                )}
              >
                <SelectValue
                  placeholder="Select a country"
                  className="capitalize"
                />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((countryOption) => (
                  <SelectItem
                    key={countryOption}
                    value={countryOption.toLowerCase()}
                  >
                    {countryOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showError("country") ? (
              <p className="text-xs text-destructive">{errors.country}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-postal">Postal code</Label>
            <Input
              id="delivery-postal"
              placeholder="Enter postal code"
              autoComplete="postal-code"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="self-stretch space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Information related to the move
        </Label>
        <div className="grid gap-2 text-sm">
          {MOVE_OPTIONS.map((option) => (
            <label
              key={option.id}
              htmlFor={option.id}
              className="flex items-center gap-2 text-foreground"
            >
              <input
                id={option.id}
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-[#9E4876] accent-[#9E4876] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E4876]/40"
                checked={selectedMoves[option.id] ?? false}
                onChange={(event) => {
                  const isChecked = event.target.checked
                  setSelectedMoves((prev) => ({
                    ...prev,
                    [option.id]: isChecked,
                  }))
                  if (option.id === "other" && !isChecked) {
                    setOtherDetails("")
                  }
                }}
              />
              {option.label}
            </label>
          ))}
          {selectedMoves.other ? (
            <div className="space-y-2">
              <Input
                id="delivery-other-details"
                placeholder="e.g. Dog on premises"
                value={otherDetails}
                onChange={(event) => setOtherDetails(event.target.value)}
                aria-invalid={showError("other")}
                className={cn(showError("other") && "border-destructive")}
              />
              {showError("other") ? (
                <p className="text-xs text-destructive">{errors.other}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="self-stretch space-y-2">
        <Label htmlFor="delivery-date">Date items needed by</Label>
        <Input
          id="delivery-date"
          type="date"
          placeholder="MM/DD/YYYY"
          value={dateNeeded}
          onChange={(event) => setDateNeeded(event.target.value)}
        />
      </div>

      <div className="self-stretch space-y-2">
        <Label htmlFor="delivery-notes">Notes and instructions</Label>
        <Textarea
          id="delivery-notes"
          placeholder="Add delivery notes or instructions"
          className="min-h-30"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </div>
  )
}
