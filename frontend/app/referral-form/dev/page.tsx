"use client"

import { useState } from "react"

import FurnitureForm from "@/components/referral-form/FurnitureForm"
import GenericLayout from "@/components/referral-form/GenericLayout"

export default function ReferralFormDevPage() {
  const [furnitureIsValid, setFurnitureIsValid] = useState(true)

  return (
    <GenericLayout
      title="Furniture"
      showTitle={false}
      breadcrumbLabels={["Furniture"]}
      activeBreadcrumbIndex={0}
      onNext={() => {}}
      onBack={() => {}}
      isNextDisabled={!furnitureIsValid}
      footerAlert={!furnitureIsValid ? "Select a size to continue" : undefined}
    >
      <FurnitureForm onValidityChange={setFurnitureIsValid} />
    </GenericLayout>
  )
}
