"use client";

import { useEffect, useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import IntakeStepPage from "@/app/agent-intake/components/IntakeStepPage";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import {
  AgentCard,
  type AgentFormData,
} from "@/app/agent-intake/components/AgentCard";
import { useIntakeFormStore } from "@/app/agent-intake/stores/intakeFormStore";

const EMPTY_AGENT: AgentFormData = {
  email: "",
  isAdmin: false,
};

const ADD_AGENT_BUTTON_CLASSNAME =
  "border-[var(--unofficial-border-3)] bg-[var(--unofficial-outline)] shadow-[var(--shadow-xs)] hover:bg-[var(--unofficial-outline-hover)]";

function AddAgentButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={ADD_AGENT_BUTTON_CLASSNAME}
      onClick={onClick}
      disabled={disabled}
    >
      <Plus className="size-4" />
      Agent
    </Button>
  );
}

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

  const agents: AgentFormData[] = otherAgents.map((agent) => ({
    email: agent.email,
    isAdmin: agent.isAdmin,
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
      email: data.email,
      isAdmin: data.isAdmin,
    });
    setEditingIndex(null);
  }

  function handleSaveDraft(data: AgentFormData) {
    addOtherAgent({
      email: data.email,
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
        <Card className="min-h-[418px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg bg-secondary p-2">
              <UsersRound className="size-6 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-primary">
              No agents added yet
            </p>
            <AddAgentButton onClick={handleAddAgent} />
          </div>
        </Card>
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
              onCancel={() => setEditingIndex(null)}
              onRemove={() => handleRemove(index)}
            />
          ))}

          {draftAgent ? (
            <AgentCard
              key="new-agent"
              index={agents.length}
              agent={draftAgent}
              isEditing={editingIndex === "new"}
              isNew
              onEdit={() => setEditingIndex("new")}
              onSave={handleSaveDraft}
              onCancel={handleDiscardDraft}
              onRemove={handleDiscardDraft}
            />
          ) : null}

          <div className="flex justify-end">
            <AddAgentButton
              onClick={handleAddAgent}
              disabled={isEditingAgent}
            />
          </div>
        </div>
      )}
    </IntakeStepPage>
  );
}
