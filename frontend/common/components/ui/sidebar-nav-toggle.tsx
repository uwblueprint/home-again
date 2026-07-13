"use client";

import { useSidebar } from "@/common/components/ui/sidebar";
import {
  SidebarCollapseIcon,
  SidebarExpandIcon,
} from "@/common/components/ui/sidebar-icons";

function SidebarNavToggle() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <button
      type="button"
      className="flex size-8 items-center justify-center rounded-md hover:bg-sidebar-accent"
      aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      onClick={toggleSidebar}
    >
      {state === "expanded" ? (
        <SidebarCollapseIcon />
      ) : (
        <SidebarExpandIcon />
      )}
    </button>
  );
}

export { SidebarNavToggle };
