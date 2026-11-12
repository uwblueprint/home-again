import { RequestedItemCard } from "@/common/components/data-display";
import { Alert, Button } from "@/common/components/ui";
import type { ReferralRequestPreview } from "@/app/referral-requests/[id]/types";

export function RequestedItemsSection({
  items,
  onReview,
  isNew = false,
}: {
  items: ReferralRequestPreview["items"];
  onReview?: () => void;
  isNew?: boolean;
}) {
  return (
    <section
      aria-labelledby="requested-items-heading"
      className="flex flex-col gap-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h2
          id="requested-items-heading"
          className="text-heading-4 font-semibold text-foreground"
        >
          Requested Items
        </h2>
        {!isNew && (
          <Button
            type="button"
            variant="secondary"
            className="disabled:opacity-100"
            onClick={onReview}
            disabled={!onReview}
            title={!onReview ? "Item review is not available yet" : undefined}
          >
            Review items
          </Button>
        )}
      </div>
      {isNew && items.some((item) => item.stock < item.quantity) && (
        <Alert variant="destructive">
          This request has items that can&apos;t be fully fulfilled right now.
        </Alert>
      )}
      {items.length ? (
        <div className="grid grid-cols-1 gap-md md:grid-cols-2">
          {items.map(({ id, ...item }) => (
            <RequestedItemCard
              key={id}
              {...item}
              className="px-lg py-xl shadow-none"
            />
          ))}
        </div>
      ) : (
        <p className="text-paragraph-regular text-muted-foreground">
          No items requested.
        </p>
      )}
    </section>
  );
}
