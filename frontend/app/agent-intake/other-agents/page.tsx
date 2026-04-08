"use client";

import { useEffect, useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import IntakeStepPage from "@/components/intake/IntakeStepPage";
import { Button } from "@/components/ui/button";
import { AgentCard, type AgentFormData } from "@/components/AgentCard";
import { useIntakeFormStore } from "@/stores/intakeFormStore";

const EMPTY_AGENT: AgentFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  isAdmin: false,
};

export default function OtherAgentsStep() {
  const {
    otherAgents,
    addOtherAgent,
    updateOtherAgent,
    removeOtherAgent,
    setOtherAgentsStepLocked,
  } = useIntakeFormStore();
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);
  const [draftAgent, setDraftAgent] = useState<AgentFormData | null>(null);
  const isEditingAgent = editingIndex !== null;

  const agents: AgentFormData[] = otherAgents.map((a) => ({
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    phoneNumber: a.phone,
    isAdmin: a.isAdmin,
  }));
  const hasVisibleAgents = agents.length > 0 || draftAgent !== null;

  useEffect(() => {
    setOtherAgentsStepLocked(isEditingAgent);

    return () => {
      setOtherAgentsStepLocked(false);
    };
  }, [isEditingAgent, setOtherAgentsStepLocked]);

  function handleAddAgent() {
    setDraftAgent({ ...EMPTY_AGENT });
    setEditingIndex("new");
  }

  function handleSave(index: number, data: AgentFormData) {
    updateOtherAgent(index, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phoneNumber,
      isAdmin: data.isAdmin,
    });
    setEditingIndex(null);
  }

  function handleSaveDraft(data: AgentFormData) {
    addOtherAgent({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phoneNumber,
      isAdmin: data.isAdmin,
    });
    setDraftAgent(null);
    setEditingIndex(null);
  }

  function handleDiscardDraft() {
    setDraftAgent(null);
    setEditingIndex(null);
  }

  function handleRemove(index: number) {
    removeOtherAgent(index);
    if (editingIndex === null || editingIndex === "new") return;
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  }

  return (
    <IntakeStepPage
      title="Other Agents"
      description="Add other agents from your agency who need access. You can add more later from your dashboard."
    >
      {!hasVisibleAgents ? (
        <div className="border border-border rounded-xl shadow-sm p-12 flex items-center justify-center min-h-[418px]">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-secondary rounded-lg p-2">
              <UsersRound className="size-6 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-primary">
              No agents added yet
            </p>
            <Button onClick={handleAddAgent}>Add an agent</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {agents.map((agent, index) => (
            <AgentCard
              key={index}
              index={index}
              agent={agent}
              isEditing={editingIndex === index}
              disabled={isEditingAgent && editingIndex !== index}
              onEdit={() => setEditingIndex(index)}
              onSave={(data) => handleSave(index, data)}
              onRemove={() => handleRemove(index)}
            />
          ))}

          {draftAgent ? (
            <AgentCard
              key="new-agent"
              index={agents.length}
              agent={draftAgent}
              isEditing={editingIndex === "new"}
              onEdit={() => setEditingIndex("new")}
              onSave={handleSaveDraft}
              onRemove={handleDiscardDraft}
            />
          ) : null}

          <Button
            variant="outline"
            className="h-auto w-full rounded-[14px] border-dashed py-4 hover:bg-accent aria-expanded:bg-accent"
            onClick={handleAddAgent}
            disabled={isEditingAgent}
          >
            <Plus className="size-4" />
            Add Agent
          </Button>
        </div>
      )}
    </IntakeStepPage>
  );
}
