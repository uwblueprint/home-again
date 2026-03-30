"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard, type AgentFormData } from "@/components/AgentCard";

const EMPTY_AGENT: AgentFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

export default function OtherAgentsStep() {
  const [agents, setAgents] = useState<AgentFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function handleAddAgent() {
    setAgents((prev) => [...prev, { ...EMPTY_AGENT }]);
    setEditingIndex(agents.length);
  }

  function handleSave(index: number, data: AgentFormData) {
    setAgents((prev) => prev.map((a, i) => (i === index ? data : a)));
    setEditingIndex(null);
  }

  function handleRemove(index: number) {
    setAgents((prev) => prev.filter((_, i) => i !== index));
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

      {/* Agent Cards */}
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
        >
          <Plus className="size-4" />
          Add Agent
        </Button>
      </div>
    </div>
  );
}
