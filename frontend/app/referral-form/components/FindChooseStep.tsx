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
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-foreground">
        Client Referral Form
      </h2>
      <p className="text-sm text-muted-foreground">
        Start a new referral by selecting an existing client or adding a new
        one.
      </p>

      <div className="mt-4 flex justify-center gap-4">
        <button
          type="button"
          onClick={onFindExisting}
          className="flex h-[140px] w-full max-w-xs items-center justify-center rounded-xl border border-border bg-background px-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-neutral-50"
        >
          Find existing client
        </button>
        <button
          type="button"
          onClick={onAddNew}
          className="flex h-[140px] w-full max-w-xs items-center justify-center rounded-xl border border-border bg-background px-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-neutral-50"
        >
          Add new client
        </button>
      </div>
    </div>
  );
}
