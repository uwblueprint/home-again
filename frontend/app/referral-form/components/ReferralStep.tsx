"use client";

import { Input, InputError } from "@/common/components/ui/input";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  REFERRAL_REASONS,
  type ReferralData,
  type ReferralReasonId,
} from "./types";

export type ReferralStepErrors = Partial<
  Record<"newToCommunityDetails" | "otherReasonDetails", string>
>;

export function validateReferral(data: ReferralData): ReferralStepErrors {
  const errors: ReferralStepErrors = {};
  if (data.reasons["new-to-community"] && !data.newToCommunityDetails.trim()) {
    errors.newToCommunityDetails = "Enter the previous town/city/country.";
  }
  if (data.reasons.others && !data.otherReasonDetails.trim()) {
    errors.otherReasonDetails = "Enter additional details.";
  }
  return errors;
}

type ReferralStepProps = {
  data: ReferralData;
  onChange: (data: ReferralData) => void;
  errors?: ReferralStepErrors;
  /** Hide the in-page heading — the edit Dialog renders its own. */
  hideHeading?: boolean;
};

export default function ReferralStep({
  data,
  onChange,
  errors = {},
  hideHeading = false,
}: ReferralStepProps) {
  function patch(updates: Partial<ReferralData>) {
    onChange({ ...data, ...updates });
  }

  function toggleReason(id: ReferralReasonId, checked: boolean) {
    patch({ reasons: { ...data.reasons, [id]: checked } });
  }

  return (
    <div className="self-stretch flex flex-col items-start gap-6">
      {hideHeading ? null : (
        <div className="self-stretch flex flex-col items-start gap-3">
          <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
            Referral Details
          </h2>
          <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
            Tell us why you are referring this client.
          </p>
        </div>
      )}
      <div className="self-stretch space-y-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground">
          <Checkbox
            checked={data.hasReceivedFurnitureBefore}
            onCheckedChange={(checked) =>
              patch({ hasReceivedFurnitureBefore: checked === true })
            }
          />
          Has the client received furniture before?
        </label>
        {data.hasReceivedFurnitureBefore ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="last-furniture-referral-date"
                className="text-sm font-medium text-foreground"
              >
                Last furniture referral date
              </label>
              <Input
                id="last-furniture-referral-date"
                type="date"
                value={data.lastFurnitureReferralDate}
                onChange={(e) =>
                  patch({ lastFurnitureReferralDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="reason-for-repeat-referral"
                className="text-sm font-medium text-foreground"
              >
                Reason for repeat referral
              </label>
              <Input
                id="reason-for-repeat-referral"
                placeholder="e.g. Got out of dangerous home situation"
                value={data.reasonForRepeatReferral}
                onChange={(e) =>
                  patch({ reasonForRepeatReferral: e.target.value })
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="self-stretch space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Reason for new referral
        </h3>
        <p className="text-sm text-muted-foreground">Check all that apply.</p>
      </div>

      <div className="self-stretch space-y-2">
        {REFERRAL_REASONS.map((reason) => {
          const isChecked = data.reasons[reason.id];
          const requiresDetails =
            reason.id === "new-to-community" || reason.id === "others";
          return (
            <div key={reason.id} className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    toggleReason(reason.id, checked === true)
                  }
                />
                {reason.label}
                {requiresDetails ? (
                  <span className="text-destructive">*</span>
                ) : null}
              </label>
              {reason.id === "new-to-community" && isChecked ? (
                <div className="pl-6">
                  <Input
                    placeholder="Previous town/city/country"
                    value={data.newToCommunityDetails}
                    onChange={(e) =>
                      patch({ newToCommunityDetails: e.target.value })
                    }
                    aria-invalid={Boolean(errors.newToCommunityDetails)}
                  />
                  {errors.newToCommunityDetails ? (
                    <InputError>{errors.newToCommunityDetails}</InputError>
                  ) : null}
                </div>
              ) : null}
              {reason.id === "others" && isChecked ? (
                <div className="pl-6">
                  <Input
                    placeholder="Add any additional details"
                    value={data.otherReasonDetails}
                    onChange={(e) =>
                      patch({ otherReasonDetails: e.target.value })
                    }
                    aria-invalid={Boolean(errors.otherReasonDetails)}
                  />
                  {errors.otherReasonDetails ? (
                    <InputError>{errors.otherReasonDetails}</InputError>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="self-stretch space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={data.isHighPriority}
            onCheckedChange={(checked) =>
              patch({ isHighPriority: checked === true })
            }
          />
          Is this referral high priority?
        </label>
        {data.isHighPriority ? (
          <Input
            placeholder="Reason for high priority"
            value={data.highPriorityReason}
            onChange={(e) => patch({ highPriorityReason: e.target.value })}
          />
        ) : null}
      </div>
    </div>
  );
}
