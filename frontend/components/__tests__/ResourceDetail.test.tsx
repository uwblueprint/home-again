import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResourceDetail from "@/components/ResourceDetail";
import type { ResourceDetailField } from "@/types";

type TestResource = {
  id: string;
  name: string;
  active: boolean;
  notes?: string | null;
};

const fields: ResourceDetailField<TestResource>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "active", label: "Active" },
  { key: "notes", label: "Notes", emptyValue: "None" },
];

describe("ResourceDetail", () => {
  it("renders fields with default display values", () => {
    render(
      <ResourceDetail<TestResource>
        title="Resource"
        fields={fields}
        data={{ id: "1", name: "Item", active: true, notes: null }}
      />
    );

    expect(screen.getByText("Resource")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Item")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("opens the confirm modal and calls onDelete", async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);

    render(
      <ResourceDetail<TestResource>
        title="Resource"
        fields={fields}
        data={{ id: "1", name: "Item", active: true, notes: "" }}
        onDelete={onDelete}
        deleteTitle="Delete item"
        deleteMessage="Confirm delete"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  });

  it("shows an error message when onDelete fails", async () => {
    const onDelete = jest.fn().mockRejectedValue(new Error("Boom"));

    render(
      <ResourceDetail<TestResource>
        title="Resource"
        fields={fields}
        data={{ id: "1", name: "Item", active: true, notes: "" }}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(await screen.findByText("Boom")).toBeInTheDocument();
  });
});
