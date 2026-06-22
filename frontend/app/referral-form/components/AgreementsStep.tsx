"use client";

import { Checkbox } from "@/common/components/ui/checkbox";
import {
  AGREEMENT_TERMS,
  type AgreementsData,
} from "./types";

type AgreementsStepProps = {
  data: AgreementsData;
  onChange: (data: AgreementsData) => void;
};

export default function AgreementsStep({
  data,
  onChange,
}: AgreementsStepProps) {
  return (
    <div className="self-stretch flex flex-col items-start gap-6">
      <div className="self-stretch flex flex-col items-start gap-3">
        <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
          Terms and Conditions
        </h2>
        <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
          Please agree to all of our terms and conditions before proceeding
        </p>
      </div>
      <div className="self-stretch space-y-4">
        {AGREEMENT_TERMS.map((term) => (
          <label
            key={term.id}
            className="flex cursor-pointer items-start gap-3 text-sm text-foreground"
          >
            <Checkbox
              className="mt-0.5"
              checked={data[term.id] ?? false}
              onCheckedChange={(checked) =>
                onChange({ ...data, [term.id]: checked === true })
              }
            />
            <span>{term.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
