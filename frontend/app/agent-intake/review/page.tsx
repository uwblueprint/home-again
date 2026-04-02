"use client";

export default function ReviewStep() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-foreground">
          Review
        </h2>
        <p className="text-lg text-muted-foreground leading-[27px]">
          Review your agency and contact details before submitting.
        </p>
      </div>
    </div>
  );
}
