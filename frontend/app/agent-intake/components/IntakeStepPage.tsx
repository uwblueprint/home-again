import React from "react";

import { ServiceAreaNotice } from "@/common/components/feedback";

interface IntakeStepPageProps {
  title: string;
  description: string;
  showServiceAreaNotice?: boolean;
  children?: React.ReactNode;
}

export default function IntakeStepPage({
  title,
  description,
  showServiceAreaNotice = false,
  children,
}: IntakeStepPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[864px] flex-col">
      <div className="flex flex-col gap-3">
        <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-foreground">
          {title}
        </h2>
        <p className="text-lg leading-[27px] text-muted-foreground">
          {description}
        </p>
        {showServiceAreaNotice ? <ServiceAreaNotice /> : null}
      </div>

      {children ? <div className="mt-2xl">{children}</div> : null}
    </div>
  );
}
