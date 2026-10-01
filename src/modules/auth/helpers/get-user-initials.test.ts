import { describe, expect, it } from "vitest";

import { getUserInitials } from "./get-user-initials";

describe("getUserInitials", () => {
  it("uses the first two words of the display name", () => {
    expect(
      getUserInitials({ display_name: "Kevin CX", email: "k@x.com" }),
    ).toBe("KC");
  });

  it("uses one letter for a single-word name", () => {
    expect(getUserInitials({ display_name: "aurita", email: "a@x.com" })).toBe(
      "A",
    );
  });

  it("falls back to the email without a display name", () => {
    expect(getUserInitials({ display_name: null, email: "kevin@x.com" })).toBe(
      "K",
    );
    expect(getUserInitials({ display_name: "  ", email: "kevin@x.com" })).toBe(
      "K",
    );
  });
});
