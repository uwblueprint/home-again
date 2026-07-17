"use client";

import { useMemo, useState } from "react";

import {
  MultiStepLayout,
  type Step,
} from "@/common/components/multi-step-layout";
import {
  FindStep,
  FindChooseStep,
  ClientStep,
  validateClient,
  type ClientStepErrors,
  ReferralStep,
  validateReferral,
  AgentStep,
  AgreementsStep,
  ReviewStep,
  FurnitureForm,
  ITEMS,
  type FurnitureFormData,
  DeliveryForm,
  type DeliveryFormData,
  EMPTY_AGENT_DATA,
  EMPTY_AGREEMENTS_DATA,
  EMPTY_CLIENT_DATA,
  EMPTY_REFERRAL_DATA,
  type AgentData,
  type AgreementsData,
  type ClientData,
  type ReferralData,
} from "@/app/referral-form/components";
import type { Client, CreateReferralInput } from "@/common/types";
import {
  useAgents,
  useCreateClient,
  useCreateReferral,
  useUpdateClient,
} from "@/common/hooks/useApi";
import { useAuthStore } from "@/common/stores/authStore";
import { cn } from "@/common/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

const EDIT_STEP_TITLES: Record<number, string> = {
  1: "Client Details",
  2: "Referral Details",
  3: "Agent Details",
  4: "Furniture Selection",
  5: "Delivery Details",
};

const EDIT_STEP_SUBTITLES: Record<number, string> = {
  1: "Enter the details of the client you are referring.",
  2: "Tell us why you are referring this client.",
  3: "Enter the referring agent's details.",
  4: "Add one or more requested furniture or household items.",
  5: "Describe the client's delivery needs and any access details.",
};

function buildRequestedItems(furniture: FurnitureFormData) {
  return ITEMS.flatMap((item) => {
    const subs = furniture.subOptions[item.id]?.filter(
      (sub) => sub.quantity > 0
    );
    if (subs?.length) {
      return subs.map((sub) => ({
        item: item.label,
        size: sub.label,
        quantity: sub.quantity,
        notes: furniture.notes[item.id] || null,
      }));
    }
    if (
      furniture.selected[item.id] &&
      (furniture.quantities[item.id] ?? 0) > 0
    ) {
      return [
        {
          item: item.label,
          quantity: furniture.quantities[item.id],
          notes: furniture.notes[item.id] || null,
        },
      ];
    }
    return [];
  });
}

const STEP_LABELS = [
  "Find",
  "Client",
  "Referral",
  "Agent",
  "Furniture",
  "Delivery",
  "Agreements",
  "Review",
];

const EMPTY_FURNITURE_DATA: FurnitureFormData = {
  selected: {},
  quantities: {},
  notes: {},
  subOptions: {},
};

const EMPTY_DELIVERY_DATA: DeliveryFormData = {
  address1: "",
  address2: "",
  city: "",
  province: "",
  country: "",
  postalCode: "",
  dateNeeded: "",
  notes: "",
  otherDetails: "",
  selectedMoves: {},
};

const DEFAULT_STEP_SECTION_CLASS =
  "self-stretch max-w-none px-36 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.00)] inline-flex flex-col justify-start items-center gap-9";

const TALL_STEP_SECTION_CLASS =
  "self-stretch max-w-none px-36 pt-6 pb-16 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.00)] inline-flex flex-col justify-start items-center gap-9";

const FURNITURE_STEP_SECTION_CLASS =
  "self-stretch max-w-none px-36 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.00)] inline-flex flex-col justify-start items-start gap-8";

const DEFAULT_STEP_BODY_CLASS =
  "self-stretch px-36 flex flex-col justify-start items-start gap-8";

const FIND_CHOOSE_BODY_CLASS =
  "w-[777px] flex-1 px-24 pt-24 flex flex-col justify-start items-start gap-8";

const FURNITURE_STEP_BODY_CLASS =
  "self-stretch flex flex-col justify-start items-start gap-12";

const SECTION_CLASS_BY_STEP: Record<number, string> = {
  2: TALL_STEP_SECTION_CLASS,
  4: FURNITURE_STEP_SECTION_CLASS,
  5: TALL_STEP_SECTION_CLASS,
  7: TALL_STEP_SECTION_CLASS,
};

export default function ReferralFormPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [substepIndex, setSubstepIndex] = useState(0);
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<number | null>(null);

  function goToStep(nextStep: number, nextSubstep = 0) {
    setStepIndex(nextStep);
    setSubstepIndex(nextSubstep);
  }

  const authUser = useAuthStore((state) => state.user);
  const { data: agents = [] } = useAgents();
  const currentAgent =
    agents.find((agent) => agent.id === authUser?.id) ?? agents[0] ?? null;

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const createReferral = useCreateReferral();
  const isSubmitting =
    createClient.isPending ||
    updateClient.isPending ||
    createReferral.isPending;

  // Step 0: Find
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Step 1: Client
  const [clientData, setClientData] = useState<ClientData>(EMPTY_CLIENT_DATA);
  const [clientTouched, setClientTouched] = useState<
    Partial<Record<keyof ClientStepErrors, boolean>>
  >({});

  // Step 2: Referral
  const [referralData, setReferralData] =
    useState<ReferralData>(EMPTY_REFERRAL_DATA);

  // Step 3: Agent
  const [agentData, setAgentData] = useState<AgentData>(EMPTY_AGENT_DATA);

  // Step 4: Furniture
  const [furnitureData, setFurnitureData] =
    useState<FurnitureFormData>(EMPTY_FURNITURE_DATA);
  const [furnitureIsValid, setFurnitureIsValid] = useState(true);

  // Step 5: Delivery
  const [deliveryData, setDeliveryData] =
    useState<DeliveryFormData>(EMPTY_DELIVERY_DATA);
  const [deliveryIsValid, setDeliveryIsValid] = useState(false);

  // Step 6: Agreements
  const [agreementsData, setAgreementsData] = useState<AgreementsData>(
    EMPTY_AGREEMENTS_DATA
  );

  const clientErrors = useMemo(() => validateClient(clientData), [clientData]);
  const referralErrors = useMemo(
    () => validateReferral(referralData),
    [referralData]
  );

  const isClientStepValid = Object.values(clientErrors).every((e) => !e);
  const isReferralStepValid = Object.values(referralErrors).every((e) => !e);
  const isAgreementsStepValid = Object.values(agreementsData).every(Boolean);

  const isNextDisabled = (() => {
    if (stepIndex === 0 && substepIndex === 0) {
      // The "choose" substep proceeds via its own buttons, not Next.
      return true;
    }
    switch (stepIndex) {
      case 0:
        return !selectedClient;
      case 1:
        return attempted[1] ? !isClientStepValid : false;
      case 2:
        return attempted[2] ? !isReferralStepValid : false;
      case 4:
        return !furnitureIsValid;
      case 5:
        return attempted[5] ? !deliveryIsValid : false;
      case 6:
        return !isAgreementsStepValid;
      default:
        return false;
    }
  })();

  const footerAlert = (() => {
    if (stepIndex === 4 && !furnitureIsValid) {
      return "Select a size to continue";
    }
    if (stepIndex === 5 && attempted[5] && !deliveryIsValid) {
      return "Complete the required fields to continue";
    }
    if (stepIndex === 6 && !isAgreementsStepValid) {
      return "Agree to all terms and conditions to continue";
    }
    if (stepIndex === 7 && submitError) {
      return submitError;
    }
    return undefined;
  })();

  function handleBeforeNext() {
    if (isSubmitting) return false;

    if (
      (stepIndex === 1 && !isClientStepValid) ||
      (stepIndex === 2 && !isReferralStepValid) ||
      (stepIndex === 5 && !deliveryIsValid)
    ) {
      setAttempted((prev) => ({ ...prev, [stepIndex]: true }));
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    setSubmitError(null);
    try {
      let clientId = selectedClient?.id;
      const clientPayload = {
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        birthday: clientData.birthday,
        gender: clientData.gender || null,
        phone: clientData.phone || null,
        phone_notes: clientData.phoneNotes || null,
        speaks_english: !clientData.firstLanguageNotEnglish,
        language: clientData.languages || null,
        family_type: clientData.familyType,
        num_children: clientData.numChildren,
        num_adults: clientData.numAdults,
        immigration_status: clientData.immigrationStatus || null,
      };

      if (clientId) {
        await updateClient.mutateAsync({ clientId, data: clientPayload });
      } else {
        const created = await createClient.mutateAsync(clientPayload);
        clientId = created.id;
      }

      const selectedMoveLabels = new Set(
        Object.entries(deliveryData.selectedMoves)
          .filter(([, checked]) => checked)
          .map(([id]) => id)
      );

      const payload: CreateReferralInput = {
        client_id: clientId,
        requested_items: buildRequestedItems(furnitureData),
        agent_id: currentAgent?.id ?? null,
        secondary_agent_id: agentData.secondaryAgentId,
        agents_present_during_delivery: agentData.agentNeedsToBePresent,
        program: agentData.programSearch || null,
        is_priority: referralData.isHighPriority,
        priority_description: referralData.highPriorityReason || null,
        reason_low_income: referralData.reasons["low-income"],
        reason_exiting_homelessness:
          referralData.reasons["exiting-homelessness"],
        reason_new_to_community: referralData.reasons["new-to-community"],
        previous_city_town_country: referralData.newToCommunityDetails || null,
        reason_escaping_abuse: referralData.reasons["escaping-abuse"],
        reason_mental_health: referralData.reasons["mental-health-issues"],
        reason_exiting_prison: referralData.reasons["exiting-prison"],
        reason_physical_disability:
          referralData.reasons["physical-disabilities"],
        reason_health_issues: referralData.reasons["health-issues"],
        reason_other: referralData.reasons.others,
        reason_other_info: referralData.otherReasonDetails || null,
        address_line_1: deliveryData.address1,
        address_line_2: deliveryData.address2 || null,
        city: deliveryData.city,
        postal_code: deliveryData.postalCode || null,
        date_items_needed: deliveryData.dateNeeded || null,
        staircases: selectedMoveLabels.has("staircases"),
        narrow_passageways: selectedMoveLabels.has("narrow-passageways"),
        adequate_parking: selectedMoveLabels.has("adequate-parking"),
        move_other_info: deliveryData.otherDetails || null,
        notes_and_instructions: deliveryData.notes || null,
        status: "pending",
      };

      await createReferral.mutateAsync(payload);
    } catch (error) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Something went wrong submitting the referral.";
      setSubmitError(message);
    }
  }

  function handleSelectClient(client: Client | null) {
    setSelectedClient(client);
    if (client) {
      setClientData({
        firstName: client.first_name,
        lastName: client.last_name,
        birthday: client.birthday ?? "",
        gender: client.gender ?? "",
        immigrationStatus: client.immigration_status ?? "",
        firstLanguageNotEnglish: !client.speaks_english,
        languages: client.language ?? "",
        phone: client.phone ?? "",
        phoneNotes: client.phone_notes ?? "",
        familyType: client.family_type ?? "",
        numAdults: client.num_adults,
        numChildren: client.num_children,
      });
    }
  }

  function handleAddNewClient() {
    setSelectedClient(null);
    setSearchQuery("");
    setClientData(EMPTY_CLIENT_DATA);
    goToStep(1);
  }

  const renderClientStep = (hideHeading: boolean) => (
    <ClientStep
      data={clientData}
      onChange={setClientData}
      errors={
        attempted[1] || Object.values(clientTouched).some(Boolean)
          ? clientErrors
          : {}
      }
      onBlurField={(field) =>
        setClientTouched((prev) => ({ ...prev, [field]: true }))
      }
      onFindAnotherClient={() => {
        setSelectedClient(null);
        setSearchQuery("");
        setEditingStep(null);
        goToStep(0, 1);
      }}
      hideHeading={hideHeading}
    />
  );

  const renderReferralStep = (hideHeading: boolean) => (
    <ReferralStep
      data={referralData}
      onChange={setReferralData}
      errors={attempted[2] ? referralErrors : {}}
      hideHeading={hideHeading}
    />
  );

  const renderAgentStep = (hideHeading: boolean) => (
    <AgentStep
      data={agentData}
      onChange={setAgentData}
      currentAgent={currentAgent}
      agents={agents}
      hideHeading={hideHeading}
    />
  );

  const renderFurnitureStep = (hideHeading: boolean) => (
    <FurnitureForm
      data={furnitureData}
      showHeader={!hideHeading}
      onValidityChange={setFurnitureIsValid}
      onDataChange={setFurnitureData}
    />
  );

  const renderDeliveryStep = (hideHeading: boolean) => (
    <DeliveryForm
      data={deliveryData}
      showErrors={attempted[5]}
      onValidityChange={setDeliveryIsValid}
      onDataChange={setDeliveryData}
      hideHeading={hideHeading}
    />
  );

  const clientStepContent = renderClientStep(false);
  const referralStepContent = renderReferralStep(false);
  const agentStepContent = renderAgentStep(false);
  const furnitureStepContent = renderFurnitureStep(false);
  const deliveryStepContent = renderDeliveryStep(false);

  const steps: Step[] = STEP_LABELS.map((label, idx) => {
    if (idx === 0) {
      return {
        label,
        substeps: [
          {
            label: "",
            wide: true,
            contentPadding: "none",
            contentClassName: DEFAULT_STEP_SECTION_CLASS,
            contentBodyClassName: FIND_CHOOSE_BODY_CLASS,
            content: (
              <FindChooseStep
                onFindExisting={() => setSubstepIndex(1)}
                onAddNew={handleAddNewClient}
              />
            ),
          },
          {
            label: "",
            wide: true,
            contentPadding: "none",
            contentClassName: DEFAULT_STEP_SECTION_CLASS,
            contentBodyClassName: DEFAULT_STEP_BODY_CLASS,
            content: (
              <FindStep
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedClientId={selectedClient?.id ?? null}
                onSelectClient={handleSelectClient}
                onAddNewClient={handleAddNewClient}
              />
            ),
          },
        ],
      };
    }

    let content: React.ReactNode;
    switch (idx) {
      case 1:
        content = clientStepContent;
        break;
      case 2:
        content = referralStepContent;
        break;
      case 3:
        content = agentStepContent;
        break;
      case 4:
        content = furnitureStepContent;
        break;
      case 5:
        content = deliveryStepContent;
        break;
      case 6:
        content = (
          <AgreementsStep data={agreementsData} onChange={setAgreementsData} />
        );
        break;
      default:
        content = (
          <ReviewStep
            client={clientData}
            referral={referralData}
            agent={agentData}
            currentAgent={currentAgent}
            secondaryAgent={
              agents.find((a) => a.id === agentData.secondaryAgentId) ?? null
            }
            furniture={furnitureData}
            delivery={deliveryData}
            onEditStep={setEditingStep}
          />
        );
        break;
    }

    // Every step component renders its own heading, so the substep label
    // (a second, generic heading) is left empty to avoid a duplicate title.
    // The visual frame is defined here so each step component can focus on its fields.
    return {
      label,
      substeps: [
        {
          label: "",
          content,
          wide: true,
          contentPadding: "none",
          contentClassName:
            SECTION_CLASS_BY_STEP[idx] ?? DEFAULT_STEP_SECTION_CLASS,
          contentBodyClassName:
            idx === 4 ? FURNITURE_STEP_BODY_CLASS : DEFAULT_STEP_BODY_CLASS,
        },
      ],
    };
  });

  const editStepContent =
    editingStep === 1
      ? renderClientStep(true)
      : editingStep === 2
        ? renderReferralStep(true)
        : editingStep === 3
          ? renderAgentStep(true)
          : editingStep === 4
            ? renderFurnitureStep(true)
            : editingStep === 5
              ? renderDeliveryStep(true)
              : null;

  return (
    <>
      <MultiStepLayout
        className="w-full max-w-none"
        steps={steps}
        stepIndex={stepIndex}
        substepIndex={substepIndex}
        onNavigate={({ stepIndex: nextStep, substepIndex: nextSubstep }) => {
          setStepIndex(nextStep);
          setSubstepIndex(nextSubstep);
        }}
        onBeforeNext={handleBeforeNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isNextDisabled={isNextDisabled}
        footerAlert={footerAlert}
        submitLabel="Submit"
      />
      <Dialog
        open={editingStep !== null}
        onOpenChange={(open) => !open && setEditingStep(null)}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            "max-h-[85vh]",
            editingStep === 4
              ? "max-w-7xl sm:max-w-7xl"
              : "max-w-5xl sm:max-w-5xl"
          )}
        >
          <DialogHeader className="gap-2 px-4xl pt-4xl pb-2xl">
            <DialogTitle className="text-3xl font-semibold text-black">
              {editingStep ? EDIT_STEP_TITLES[editingStep] : ""}
            </DialogTitle>
            <DialogDescription className="text-lg text-neutral-500">
              {editingStep ? EDIT_STEP_SUBTITLES[editingStep] : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="overflow-y-auto px-4xl py-2xl">
            {editStepContent}
          </DialogBody>
          <DialogFooter className="border-t border-border px-4xl py-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingStep(null)}
            >
              Back
            </Button>
            <Button type="button" onClick={() => setEditingStep(null)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
