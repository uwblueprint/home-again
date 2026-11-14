import {
  toDonationSubmission,
  validateSummary,
  type DonationFormState,
} from "@/app/donate/context/DonationFormContext";

const STATE: DonationFormState = {
  donorId: "donor-1",
  pickupDate: null,
  pickupAddress: {
    streetAddress: " 210 Drake Ave ",
    apartment: "",
    city: "St. John's",
    province: "Newfoundland and Labrador",
    country: "Canada",
    postalCode: "A2V 1K5",
  },
  smokingInHousehold: false,
  petsInHousehold: true,
  feeAgreement: true,
  pickupSubmitAttempted: false,
  items: [
    {
      id: "a",
      furnitureType: "Mattress",
      hasStains: false,
      photos: [],
      mattressSize: "Queen",
      chairCount: null,
      otherDescription: null,
    },
    {
      id: "b",
      furnitureType: "Dining table & chairs /sets",
      hasStains: true,
      photos: [],
      mattressSize: "Twin",
      chairCount: 4,
      otherDescription: "ignored",
    },
    {
      id: "c",
      furnitureType: "Other",
      hasStains: false,
      photos: [],
      mattressSize: null,
      chairCount: null,
      otherDescription: "Rocking horse",
    },
  ],
};

describe("toDonationSubmission", () => {
  it("maps the form to the submission payload", () => {
    expect(toDonationSubmission(STATE)).toEqual({
      donor_id: "donor-1",
      address_line_1: "210 Drake Ave",
      address_line_2: null,
      city: "St. John's",
      postal_code: "A2V 1K5",
      smoking_household: false,
      has_pets: true,
      items: [
        {
          furniture_type: "Mattress",
          size: "Queen",
          has_stains: false,
          chair_count: null,
          other_description: null,
        },
        {
          // Size and description only go with the types that use them.
          furniture_type: "Dining table & chairs /sets",
          size: null,
          has_stains: true,
          chair_count: 4,
          other_description: null,
        },
        {
          furniture_type: "Other",
          size: null,
          has_stains: false,
          chair_count: null,
          other_description: "Rocking horse",
        },
      ],
    });
  });
});

describe("validateSummary", () => {
  it("needs both household answers and the fee agreement", () => {
    expect(validateSummary(STATE)).toBe(true);
    expect(validateSummary({ ...STATE, smokingInHousehold: null })).toBe(false);
    expect(validateSummary({ ...STATE, petsInHousehold: null })).toBe(false);
    expect(validateSummary({ ...STATE, feeAgreement: false })).toBe(false);
  });
});
