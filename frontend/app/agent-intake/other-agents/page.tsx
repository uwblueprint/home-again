"use client";

import { useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard, type AgentFormData } from "@/components/AgentCard";
import { useIntakeFormStore } from "@/stores/intakeFormStore";

const EMPTY_AGENT: AgentFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

export default function OtherAgentsStep() {
  const { otherAgents, addOtherAgent, updateOtherAgent, removeOtherAgent } =
    useIntakeFormStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const isEditingAgent = editingIndex !== null;

  const agents: AgentFormData[] = otherAgents.map((a) => ({
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    phoneNumber: a.phone,
  }));

  function handleAddAgent() {
    addOtherAgent({ firstName: "", lastName: "", email: "", phone: "" });
    setEditingIndex(otherAgents.length);
  }

  function handleSave(index: number, data: AgentFormData) {
    updateOtherAgent(index, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phoneNumber,
    });
    setEditingIndex(null);
  }

  function handleRemove(index: number) {
    removeOtherAgent(index);
    if (editingIndex === null) return;
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  }

  return (
    <div className="flex flex-col gap-8 px-36">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-foreground">
          Other Agents
        </h2>
        <p className="text-lg leading-[27px] text-muted-foreground">
          Add other agents from your agency who need access. You can add more
          later from your dashboard.
        </p>
      </div>

      {agents.length === 0 ? (
        /* Empty State */
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
        /* Agent Cards */
        <div className="flex flex-col gap-5">
          {agents.map((agent, index) => (
            <AgentCard
              key={index}
              index={index}
              agent={agent}
              isEditing={editingIndex === index}
              onEdit={() => setEditingIndex(index)}
              onClose={() => setEditingIndex(null)}
              onSave={(data) => handleSave(index, data)}
              onRemove={() => handleRemove(index)}
            />
          ))}

          {/* Add Agent Button */}
          <Button
            variant="outline"
            className="w-full rounded-[14px] border-dashed py-4 h-auto"
            onClick={handleAddAgent}
            disabled={isEditingAgent}
          >
            <Plus className="size-4" />
            Add Agent
          </Button>
        </div>
      )}
    </div>
  );
}
