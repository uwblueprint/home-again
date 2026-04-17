"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDonationForm } from "@/app/donate/context/DonationFormContext";
import FurnitureItemCard from "@/app/donate/components/FurnitureItemCard";

export default function StepFurnitureDetails() {
  const { formState, deleteItem, updateItem } = useDonationForm();
  const { items } = formState;

  // Track which item id is expanded; default to the first item
  const [expandedId, setExpandedId] = useState<string | null>(
    items[0]?.id ?? null,
  );

  // Auto-collapse previous item and expand new one when an item is added
  const prevCountRef = React.useRef(items.length);
  useEffect(() => {
    if (items.length > prevCountRef.current) {
      // A new item was added — expand the last one (auto-collapse previous)
      const newItem = items[items.length - 1];
      setExpandedId(newItem.id);
    }
    prevCountRef.current = items.length;
  }, [items]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          What Are You Donating?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about the items you&apos;d like to donate so we can ensure
          they meet our acceptance guidelines.
        </p>
      </div>

      {/* Item cards */}
      {items.map((item, index) => (
        <FurnitureItemCard
          key={item.id}
          itemData={item}
          index={index}
          isExpanded={expandedId === item.id}
          onToggle={() => handleToggle(item.id)}
          onUpdate={(patch) => updateItem(item.id, patch)}
          onDelete={() => deleteItem(item.id)}
          isDeleteDisabled={items.length <= 1}
        />
      ))}
    </div>
  );
}
