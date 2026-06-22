"use client";

type FindChooseStepProps = {
  onFindExisting: () => void;
  onAddNew: () => void;
};

export default function FindChooseStep({
  onFindExisting,
  onAddNew,
}: FindChooseStepProps) {
  return (
    <div className="self-stretch flex flex-col items-start gap-6">
      <div className="self-stretch flex flex-col items-start gap-3">
        <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
          Client Referral Form
        </h2>
        <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
          Start a new referral by selecting an existing client or adding a new one.
        </p>
      </div>
      <div className="self-stretch flex gap-4">
        <button
          type="button"
          onClick={onFindExisting}
          className="flex h-37.5 flex-1 items-center justify-center rounded-xl border border-border bg-background px-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-neutral-50"
        >
          Find existing client
        </button>
        <button
          type="button"
          onClick={onAddNew}
          className="flex h-37.5 flex-1 items-center justify-center rounded-xl border border-border bg-background px-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-neutral-50"
        >
          Add new client
        </button>
      </div>
    </div>
  );
}
