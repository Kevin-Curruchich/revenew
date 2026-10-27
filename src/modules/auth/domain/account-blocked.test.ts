import { describe, expect, it } from "vitest";
import { getAccountBlockedMessage } from "./account-blocked";

describe("getAccountBlockedMessage", () => {
  it("recognizes both blocked-account answers", () => {
    expect(getAccountBlockedMessage(403, "Tu cuenta esta desactivada")).toMatch(
      /desactivada/,
    );
    expect(
      getAccountBlockedMessage(403, "Tu cuenta no pertenece a ningun comercio"),
    ).toMatch(/ningún comercio/);
  });

  it("ignores other 403s and other statuses", () => {
    expect(getAccountBlockedMessage(403, "Solo administradores")).toBeNull();
    expect(
      getAccountBlockedMessage(404, "Tu cuenta esta desactivada"),
    ).toBeNull();
    expect(getAccountBlockedMessage(403, undefined)).toBeNull();
  });
});
