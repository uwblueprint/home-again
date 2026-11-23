import { DONATION_REQUEST_FIXTURE } from "@/app/donation-request/components/fixture";
import { DONATION_REQUEST_SAMPLES } from "@/app/donation-request/components/listFixture";
import { useDonationRequestStore } from "./donationRequestStore";

const ID = DONATION_REQUEST_FIXTURE.id;
const store = () => useDonationRequestStore.getState();
const request = () => store().requests[ID];
const pickup = () => request().pickup;
const itemIds = () => request().furniture_items.map((item) => item.id);

beforeEach(() => {
  store().reset();
});

describe("item review", () => {
  it("approves an item and clears any previous rejection", () => {
    const [id] = itemIds();
    store().rejectItem(ID, id, "other", "Too large for the van");
    store().approveItem(ID, id);

    const item = request().furniture_items.find((i) => i.id === id)!;
    expect(item.status).toBe("APPROVED");
    expect(item.rejection_reason).toBeNull();
    expect(item.rejection_details).toBeNull();
  });

  it("records the reason and free-text details on rejection", () => {
    const [id] = itemIds();
    store().rejectItem(ID, id, "other", "Too large for the van");

    const item = request().furniture_items.find((i) => i.id === id)!;
    expect(item.status).toBe("REJECTED");
    expect(item.rejection_reason).toBe("other");
    expect(item.rejection_details).toBe("Too large for the van");
  });

  it("leaves other items untouched", () => {
    const [first, second] = itemIds();
    store().approveItem(ID, first);

    const other = request().furniture_items.find((i) => i.id === second)!;
    expect(other.status).toBe("PICKUP_PENDING");
  });
});

describe("pickup scheduling", () => {
  it("schedules an unconfirmed pickup", () => {
    store().schedulePickup(ID, "2026-03-26", "Ring the buzzer");

    expect(pickup()?.scheduled_date).toBe("2026-03-26");
    expect(pickup()?.note).toBe("Ring the buzzer");
    expect(pickup()?.confirmed_at).toBeNull();
  });

  it("confirms a scheduled pickup", () => {
    store().schedulePickup(ID, "2026-03-26");
    store().confirmPickup(ID);

    expect(pickup()?.confirmed_at).not.toBeNull();
  });

  it("will not confirm when nothing is scheduled", () => {
    store().confirmPickup(ID);
    expect(pickup()).toBeNull();
  });

  // The subtlest rule in the flow, and the one the Edit dialog warns about.
  it("clears the confirmation when a confirmed pickup moves to a new date", () => {
    store().schedulePickup(ID, "2026-03-26");
    store().confirmPickup(ID);
    expect(pickup()?.confirmed_at).not.toBeNull();

    store().updatePickup(ID, "2026-03-27");

    expect(pickup()?.scheduled_date).toBe("2026-03-27");
    expect(pickup()?.confirmed_at).toBeNull();
  });

  it("keeps the confirmation when only the note changes", () => {
    store().schedulePickup(ID, "2026-03-26", "Ring the buzzer");
    store().confirmPickup(ID);
    const confirmedAt = pickup()!.confirmed_at;

    store().updatePickup(ID, "2026-03-26", "Use the side door");

    expect(pickup()?.note).toBe("Use the side door");
    expect(pickup()?.confirmed_at).toBe(confirmedAt);
  });

  it("keeps the same pickup id across edits", () => {
    store().schedulePickup(ID, "2026-03-26");
    const id = pickup()!.id;

    store().updatePickup(ID, "2026-03-27");

    expect(pickup()?.id).toBe(id);
  });
});

describe("pickup after review changes", () => {
  it("drops the pickup once no item is approved", () => {
    const [first, second] = itemIds();
    store().approveItem(ID, first);
    store().rejectItem(ID, second, "other");
    store().schedulePickup(ID, "2026-03-26");
    store().confirmPickup(ID);

    store().rejectItem(ID, first, "other");

    expect(pickup()).toBeNull();
  });

  it("keeps the pickup while an item is still approved", () => {
    const [first, second] = itemIds();
    store().approveItem(ID, first);
    store().approveItem(ID, second);
    store().schedulePickup(ID, "2026-03-26");

    store().rejectItem(ID, second, "other");

    expect(pickup()?.scheduled_date).toBe("2026-03-26");
  });
});

describe("donor edits", () => {
  it("patches only the supplied fields", () => {
    const before = request().donor;
    store().updateDonor(ID, { email: "new@example.com" });

    expect(request().donor.email).toBe("new@example.com");
    expect(request().donor.first_name).toBe(before.first_name);
  });
});

describe("multiple requests", () => {
  it("seeds every sample request by id", () => {
    expect(Object.keys(store().requests)).toEqual(
      DONATION_REQUEST_SAMPLES.map((sample) => sample.id)
    );
  });

  it("only changes the request it is given", () => {
    const otherId = DONATION_REQUEST_SAMPLES[1].id;
    const before = store().requests[otherId];
    store().approveItem(ID, itemIds()[0]);

    expect(store().requests[otherId]).toBe(before);
  });

  it("ignores an unknown request id", () => {
    const before = store().requests;
    store().approveItem("missing", "item");

    expect(store().requests).toBe(before);
  });
});
