"use client";

import { useCallback, useMemo, useState } from "react";

import { useCreateAgency, useCreateAgent } from "@/common/hooks/useApi";
import { useIntakeFormStore } from "@/app/agent-intake/stores/intakeFormStore";
import type { CreateAgencyInput } from "@/common/types";

function trimOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function extractErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const detail = (error as { response?: { data?: { detail?: unknown } } })
      .response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item !== "object" || item === null || !("msg" in item)) {
            return null;
          }

          const field = Array.isArray(item.loc)
            ? item.loc
                .filter((part: unknown) => part !== "body")
                .join(". ")
            : "";
          const message = String(item.msg);

          return field ? `${field}: ${message}` : message;
        })
        .filter((message): message is string => Boolean(message));

      if (messages.length > 0) {
        return messages.join("; ");
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "We could not submit the intake. Please try again.";
}

function buildValidationErrorMessage() {
  const { agency, mainAgent } = useIntakeFormStore.getState();

  const missingFields: string[] = [];

  if (!agency.name.trim()) missingFields.push("agency name");
  if (!agency.addressLine1.trim()) missingFields.push("address line 1");
  if (!agency.city.trim()) missingFields.push("city");
  if (!agency.province.trim()) missingFields.push("province");
  if (!agency.country.trim()) missingFields.push("country");
  if (!agency.phone.trim()) missingFields.push("phone number");
  if (!agency.postalCode.trim()) missingFields.push("postal code");
  if (!mainAgent.firstName.trim()) missingFields.push("main agent first name");
  if (!mainAgent.lastName.trim()) missingFields.push("main agent last name");
  if (!mainAgent.phone.trim()) missingFields.push("main agent phone number");

  if (missingFields.length === 0) {
    return null;
  }

  return `Complete the required intake fields before submitting: ${missingFields.join(", ")}.`;
}

export function useSubmitIntake() {
  const createAgency = useCreateAgency();
  const createAgent = useCreateAgent();
  const reset = useIntakeFormStore((state) => state.reset);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedAgencyId, setSubmittedAgencyId] = useState<string | null>(
    null
  );

  const isSuccess = submittedAgencyId !== null;

  const submit = useCallback(async () => {
    if (isSubmitting || isSuccess) {
      return null;
    }

    const validationError = buildValidationErrorMessage();
    if (validationError) {
      setSubmitError(validationError);
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const intakeState = useIntakeFormStore.getState();
    const {
      agency,
      mainAgent,
      otherAgents,
      submissionCheckpoint,
      updateSubmissionCheckpoint,
    } = intakeState;

    try {
      let agencyId = submissionCheckpoint.agencyId;

      if (!agencyId) {
        const agencyPayload: CreateAgencyInput = {
          name: agency.name.trim(),
          address_line_1: agency.addressLine1.trim(),
          address_line_2: trimOrNull(agency.addressLine2),
          city: agency.city.trim(),
          postal_code: agency.postalCode.trim(),
          phone_number: agency.phone.trim(),
        };

        const createdAgency = await createAgency.mutateAsync(agencyPayload);
        agencyId = createdAgency.id;
        updateSubmissionCheckpoint({ agencyId });
      }

      if (!submissionCheckpoint.mainAgentId) {
        const createdMainAgent = await createAgent.mutateAsync({
          first_name: mainAgent.firstName.trim(),
          last_name: mainAgent.lastName.trim(),
          email: mainAgent.email.trim(),
          phone_number: mainAgent.phone.trim(),
          agency_id: agencyId,
          supabase_user_id: null,
        });

        updateSubmissionCheckpoint({
          mainAgentId: createdMainAgent.id,
          mainAgentLinked: true,
        });
      }

      for (
        let index = submissionCheckpoint.otherAgentsCreated;
        index < otherAgents.length;
        index += 1
      ) {
        const otherAgent = otherAgents[index];

        await createAgent.mutateAsync({
          first_name: "",
          last_name: "",
          email: otherAgent.email.trim(),
          phone_number: "",
          agency_id: agencyId,
          is_admin: otherAgent.isAdmin,
          supabase_user_id: null,
        });

        updateSubmissionCheckpoint({ otherAgentsCreated: index + 1 });
      }

      setSubmittedAgencyId(agencyId);
      return agencyId;
    } catch (error) {
      setSubmitError(extractErrorMessage(error));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [createAgency, createAgent, isSubmitting, isSuccess]);

  const resetAfterSuccess = useCallback(() => {
    reset();
    setSubmitError(null);
    setSubmittedAgencyId(null);
  }, [reset]);

  return useMemo(
    () => ({
      submit,
      isSubmitting,
      submitError,
      submittedAgencyId,
      isSuccess,
      resetAfterSuccess,
    }),
    [
      isSubmitting,
      isSuccess,
      resetAfterSuccess,
      submit,
      submitError,
      submittedAgencyId,
    ]
  );
}
