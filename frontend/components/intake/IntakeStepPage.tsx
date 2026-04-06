import React from "react";

interface IntakeStepPageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function IntakeStepPage({
  title,
  description,
  children,
}: IntakeStepPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-foreground">
          {title}
        </h2>
        <p className="text-lg leading-[27px] text-muted-foreground">
          {description}
        </p>
      </div>

      {children ? <div>{children}</div> : null}
    </div>
  );
}
