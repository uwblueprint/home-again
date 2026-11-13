import { validateDonorContact } from "./validators";

const VALID = {
  first_name: "Katie",
  last_name: "Sun",
  email: "katiesun@uwblueprint.org",
  phone: "647-909-9581",
};

describe("validateDonorContact", () => {
  it("returns no errors for valid contact details", () => {
    expect(validateDonorContact(VALID)).toEqual({});
  });

  it("requires every field it is given", () => {
    expect(
      validateDonorContact({
        first_name: " ",
        last_name: "",
        email: "",
        phone: "",
      })
    ).toEqual({
      first_name: "Enter a first name.",
      last_name: "Enter a last name.",
      email: "Enter an email address.",
      phone: "Enter a phone number.",
    });
  });

  it("rejects a malformed email or phone", () => {
    expect(
      validateDonorContact({ ...VALID, email: "katie@", phone: "12" })
    ).toEqual({
      email: "Enter a valid email address.",
      phone: "Enter a valid phone number.",
    });
  });

  it("skips fields that are not passed in", () => {
    expect(validateDonorContact({ first_name: "Katie" })).toEqual({});
  });
});
