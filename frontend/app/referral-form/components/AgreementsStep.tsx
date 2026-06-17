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
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-foreground">
        Terms and Conditions
      </h2>
      <p className="text-sm text-muted-foreground">
        Please agree to all of our terms and conditions before proceeding
      </p>

      <div className="mt-4 space-y-4">
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
