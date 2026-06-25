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
    <div className="w-[585px] flex flex-col items-center justify-center gap-8">
      <div className="self-stretch flex flex-col items-start gap-3">
        <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
          Client Referral Form
        </h2>
        <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
          Start a new referral by selecting an existing client or adding a new one.
        </p>
      </div>
      <div className="h-36 w-[585px] flex gap-4 rounded-[10px] bg-background">
        <button
          type="button"
          onClick={onFindExisting}
          className="flex h-full flex-1 items-center justify-center rounded-[10px] border border-border bg-background px-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-neutral-50"
        >
          Find existing client
        </button>
        <button
          type="button"
          onClick={onAddNew}
          className="flex h-full flex-1 items-center justify-center rounded-[10px] border border-border bg-background px-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-neutral-50"
        >
          Add new client
        </button>
      </div>
    </div>
  );
}
