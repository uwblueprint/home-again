import { useDonationRequestStore } from "./donationRequestStore";

const store = () => useDonationRequestStore.getState();
const pickup = () => store().request.pickup;
const itemIds = () => store().request.furniture_items.map((item) => item.id);

beforeEach(() => {
  store().reset();
});

describe("item review", () => {
  it("approves an item and clears any previous rejection", () => {
    const [id] = itemIds();
    store().rejectItem(id, "other", "Too large for the van");
    store().approveItem(id);

    const item = store().request.furniture_items.find((i) => i.id === id)!;
    expect(item.status).toBe("APPROVED");
    expect(item.rejection_reason).toBeNull();
    expect(item.rejection_details).toBeNull();
  });

  it("records the reason and free-text details on rejection", () => {
    const [id] = itemIds();
    store().rejectItem(id, "other", "Too large for the van");

    const item = store().request.furniture_items.find((i) => i.id === id)!;
    expect(item.status).toBe("REJECTED");
    expect(item.rejection_reason).toBe("other");
    expect(item.rejection_details).toBe("Too large for the van");
  });

  it("leaves other items untouched", () => {
    const [first, second] = itemIds();
    store().approveItem(first);

    const other = store().request.furniture_items.find((i) => i.id === second)!;
    expect(other.status).toBe("PICKUP_PENDING");
  });
});

describe("pickup scheduling", () => {
  it("schedules an unconfirmed pickup", () => {
    store().schedulePickup("2026-03-26", "Ring the buzzer");

    expect(pickup()?.scheduled_date).toBe("2026-03-26");
    expect(pickup()?.note).toBe("Ring the buzzer");
    expect(pickup()?.confirmed_at).toBeNull();
  });

  it("confirms a scheduled pickup", () => {
    store().schedulePickup("2026-03-26");
    store().confirmPickup();

    expect(pickup()?.confirmed_at).not.toBeNull();
  });

  it("will not confirm when nothing is scheduled", () => {
    store().confirmPickup();
    expect(pickup()).toBeNull();
  });

  // The subtlest rule in the flow, and the one the Edit dialog warns about.
  it("clears the confirmation when a confirmed pickup moves to a new date", () => {
    store().schedulePickup("2026-03-26");
    store().confirmPickup();
    expect(pickup()?.confirmed_at).not.toBeNull();

    store().updatePickup("2026-03-27");

    expect(pickup()?.scheduled_date).toBe("2026-03-27");
    expect(pickup()?.confirmed_at).toBeNull();
  });

  it("keeps the confirmation when only the note changes", () => {
    store().schedulePickup("2026-03-26", "Ring the buzzer");
    store().confirmPickup();
    const confirmedAt = pickup()!.confirmed_at;

    store().updatePickup("2026-03-26", "Use the side door");

    expect(pickup()?.note).toBe("Use the side door");
    expect(pickup()?.confirmed_at).toBe(confirmedAt);
  });

  it("keeps the same pickup id across edits", () => {
    store().schedulePickup("2026-03-26");
    const id = pickup()!.id;

    store().updatePickup("2026-03-27");

    expect(pickup()?.id).toBe(id);
  });
});

describe("donor edits", () => {
  it("patches only the supplied fields", () => {
    const before = store().request.donor;
    store().updateDonor({ email: "new@example.com" });

    expect(store().request.donor.email).toBe("new@example.com");
    expect(store().request.donor.first_name).toBe(before.first_name);
  });
});
