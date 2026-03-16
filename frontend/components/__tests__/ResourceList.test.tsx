import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResourceList from "../ResourceList";
import type { ColumnConfig, RowActionConfig } from "@/types";

type Dummy = { id: string; name: string; value?: number; status?: string };

const columns: ColumnConfig<Dummy>[] = [
  { key: "name", label: "Name" },
  { key: "value", label: "Value", type: "text" },
  { key: "status", label: "Status", type: "status" },
];

const data: Dummy[] = [
  { id: "1", name: "A", value: 100, status: "active" },
  { id: "2", name: "B", value: 200, status: "inactive" },
];

describe("ResourceList", () => {
  it("renders rows according to data", () => {
    render(
      <ResourceList<Dummy>
        columns={columns}
        data={data}
        loading={false}
        rowActions={[]}
      />
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("shows loading skeleton when loading is true", () => {
    render(
      <ResourceList<Dummy>
        columns={columns}
        data={[]}
        loading={true}
        rowActions={[]}
      />
    );

    const skeleton = screen.getByRole("table");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("divide-y");
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("displays empty state message when no data", () => {
    render(
      <ResourceList<Dummy>
        columns={columns}
        data={[]}
        loading={false}
        rowActions={[]}
        emptyStateMessage="nothing here"
      />
    );

    expect(screen.getByText("nothing here")).toBeInTheDocument();
  });

  it("renders error alert when error prop is provided", () => {
    render(
      <ResourceList<Dummy>
        columns={columns}
        data={[]}
        loading={false}
        error={new Error("oops")}
        rowActions={[]}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Error loading data");
  });

  it("calls action callback when button clicked", () => {
    const onClick = jest.fn();
    const actions: RowActionConfig<Dummy>[] = [
      { id: "edit", label: "Edit", onClick },
    ];

    render(
      <ResourceList<Dummy>
        columns={columns}
        data={data}
        loading={false}
        rowActions={actions}
      />
    );

    const btn = screen.getByTestId("action-edit-1");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });

  it("uses custom render function if provided", () => {
    const customCols: ColumnConfig<Dummy>[] = [
      {
        key: "name",
        label: "Name",
        render: (value, row) => <span data-testid="custom">{row.name}-foo</span>,
      },
    ];

    render(
      <ResourceList<Dummy>
        columns={customCols}
        data={data}
        loading={false}
        rowActions={[]}
      />
    );

    const elements = screen.getAllByTestId("custom");
    expect(elements[0]).toHaveTextContent("A-foo");
    expect(elements[1]).toHaveTextContent("B-foo");
  });
});
