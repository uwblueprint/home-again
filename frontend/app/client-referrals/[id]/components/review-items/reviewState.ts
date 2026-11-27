import type { ReviewItem, ReviewPendingItemsResult } from "./types";

/** One line in the pending list: an item's units that are up for review. */
export type ReviewRow = Pick<ReviewItem, "id" | "name" | "heldBy" | "held"> & {
  unitIds: string[];
  stock: number;
};

export type ItemReviewState = {
  approve: number;
  reject: number;
  rejectOpen: boolean;
  heldOpen: boolean;
};

export type ReviewState = {
  /** Keyed by item id. */
  items: Record<string, ItemReviewState>;
  /** Ids of items whose approved units the reviewer unapproved. */
  unapprovedIds: string[];
};

export const EMPTY_REVIEW_STATE: ReviewState = { items: {}, unapprovedIds: [] };

const NOTHING_DECIDED: ItemReviewState = {
  approve: 0,
  reject: 0,
  rejectOpen: false,
  heldOpen: false,
};

/**
 * The item's line in the pending list. Once unapproved, its approved units
 * join the line (first, so the approve count covers them first: units of one
 * item are interchangeable, and re-approving them is then no change). They
 * stop being held, so they count as available again.
 */
export function toPendingRow(item: ReviewItem, unapproved: boolean): ReviewRow {
  const released = unapproved ? item.approvedUnitIds : [];
  return {
    id: item.id,
    name: item.name,
    heldBy: item.heldBy,
    held: item.held,
    unitIds: [...released, ...item.pendingUnitIds],
    stock: item.stock + released.length,
  };
}

/** The pending list: every item with pending or unapproved units. */
export function buildPendingRows(
  items: ReviewItem[],
  unapprovedIds: string[]
): ReviewRow[] {
  return items
    .map((item) => toPendingRow(item, unapprovedIds.includes(item.id)))
    .filter((row) => row.unitIds.length > 0);
}

/** The "Approved items" list: items with approved units not unapproved. */
export function approvedItemsOf(items: ReviewItem[], unapprovedIds: string[]) {
  return items.filter(
    (item) =>
      item.approvedUnitIds.length > 0 && !unapprovedIds.includes(item.id)
  );
}

/** How many units a line has. */
export function quantityOf(row: ReviewRow) {
  return row.unitIds.length;
}

/** Units held by other referrals: the total of `heldBy`, else `held`. */
export function heldCount(row: ReviewRow) {
  return row.heldBy
    ? row.heldBy.reduce((total, referral) => total + referral.units, 0)
    : (row.held ?? 0);
}

/** Can't approve more than is in stock, or more than isn't being rejected. */
export function approveMax(row: ReviewRow, state: ItemReviewState) {
  return Math.max(0, Math.min(row.stock, quantityOf(row) - state.reject));
}

/** Every unit can be rejected: rejecting more takes units from approve. */
export function rejectMax(row: ReviewRow) {
  return quantityOf(row);
}

/** Sets the reject count, lowering approve if the two would exceed quantity. */
export function setReject(
  row: ReviewRow,
  state: ItemReviewState,
  reject: number
): ItemReviewState {
  return {
    ...state,
    reject,
    approve: Math.max(0, Math.min(state.approve, quantityOf(row) - reject)),
  };
}

/** Each line starts approving as many units as stock allows. */
export function defaultItemState(row: ReviewRow): ItemReviewState {
  return {
    ...NOTHING_DECIDED,
    approve: Math.max(0, Math.min(row.stock, quantityOf(row))),
  };
}

/** The line's current state, or its default if it hasn't been touched. */
export function getItemState(
  row: ReviewRow,
  state: ReviewState
): ItemReviewState {
  return state.items[row.id] ?? defaultItemState(row);
}

/**
 * Opening the reject panel starts at 1 unit, taking it from the approve count
 * if every unit was approved.
 */
export function openReject(
  row: ReviewRow,
  state: ItemReviewState
): ItemReviewState {
  return {
    ...state,
    rejectOpen: true,
    reject: 1,
    approve: Math.max(0, Math.min(state.approve, quantityOf(row) - 1)),
  };
}

/** Cancelling the reject panel clears the reject count. */
export function closeReject(state: ItemReviewState): ItemReviewState {
  return { ...state, rejectOpen: false, reject: 0 };
}

/**
 * Moves an item's approved units back to the pending list, without
 * approving any of them (otherwise it would look like the click did nothing).
 *
 * If the item already had a pending line, that line's current state is saved
 * as-is, so its default doesn't recalculate with the larger quantity and
 * re-approve the units that were just unapproved.
 */
export function unapproveItem(
  state: ReviewState,
  item: ReviewItem
): ReviewState {
  if (state.unapprovedIds.includes(item.id)) return state;
  const before = toPendingRow(item, false);
  return {
    items: {
      ...state.items,
      [item.id]:
        before.unitIds.length > 0
          ? getItemState(before, state)
          : NOTHING_DECIDED,
    },
    unapprovedIds: [...state.unapprovedIds, item.id],
  };
}

/**
 * Turns the counts on each line into unit ids. In each line, the first
 * `approve` units end up approved, the next `reject` units rejected, and the
 * rest pending. Each unit is then compared with where it started:
 *
 * - pending → approved: approve
 * - anything → rejected: reject
 * - approved → pending: unapprove
 * - unchanged: left out
 */
export function toResult(
  rows: ReviewRow[],
  state: ReviewState,
  items: ReviewItem[]
): ReviewPendingItemsResult {
  const wasApproved = new Set(items.flatMap((item) => item.approvedUnitIds));
  const result: ReviewPendingItemsResult = {
    approve: [],
    reject: [],
    unapprove: [],
  };

  for (const row of rows) {
    const { approve, reject } = getItemState(row, state);
    row.unitIds.forEach((unitId, index) => {
      if (index < approve) {
        if (!wasApproved.has(unitId)) result.approve.push(unitId);
      } else if (index < approve + reject) {
        result.reject.push(unitId);
      } else if (wasApproved.has(unitId)) {
        result.unapprove.push(unitId);
      }
    });
  }

  return result;
}

export function hasDecisions(result: ReviewPendingItemsResult) {
  return (
    result.approve.length > 0 ||
    result.reject.length > 0 ||
    result.unapprove.length > 0
  );
}
