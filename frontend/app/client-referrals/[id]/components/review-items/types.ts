/** Another referral that has units of this item approved but not yet delivered. */
export type HeldByReferral = {
  referralId: string;
  clientName: string;
  /** Units of this item approved for that referral and not yet confirmed. */
  units: number;
};

/**
 * One item type in the referral, e.g. "Nightstand", with its units split by
 * status. Pass one entry per item type: group the referral's items by
 * `inventory_id` (or name + size when there is none).
 *
 * The item shows in the pending list when it has pending units, and in
 * "Approved items" when it has approved units. Leave out rejected, scheduled
 * and delivered units: they aren't shown and can't be changed here.
 */
export type ReviewItem = {
  /** Identifies the item. Any stable value, e.g. its `inventory_id`. */
  id: string;
  /** Display name, e.g. "Mattress Only / Twin". */
  name: string;
  /** Referral item ids (one per unit) with status `PENDING_REVIEW`. */
  pendingUnitIds: string[];
  /** Referral item ids (one per unit) with status `APPROVED`. */
  approvedUnitIds: string[];
  /**
   * `InventoryRecord.available`, as-is. When approved units are unapproved,
   * the component adds them back.
   */
  stock: number;
  /**
   * Referrals holding units of this item. The held chip shows the total of
   * their `units` and lists them when clicked.
   */
  heldBy?: HeldByReferral[];
  /**
   * Units held by other referrals, for when only the count is known. Ignored
   * if `heldBy` is given. The chip then shows but can't be opened.
   */
  held?: number;
};

/**
 * The unit ids to change, one list per backend action. Units in none of the
 * lists are unchanged. Order doesn't matter.
 */
export type ReviewPendingItemsResult = {
  /** Pending units to approve. */
  approve: string[];
  /** Pending or approved units to reject. */
  reject: string[];
  /** Approved units to move back to pending. */
  unapprove: string[];
};
