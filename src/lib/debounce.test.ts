import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounceLatest } from "./debounce";

describe("debounceLatest", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs once with the last arguments and resolves every caller with it", async () => {
    const fn = vi.fn(async (query: string) => query.toUpperCase());
    const search = debounceLatest(fn, 200);
    const first = search("a");
    const second = search("ab");
    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await first).toBe("AB");
    expect(await second).toBe("AB");
  });

  it("never resolves an old call with a slower, older response", async () => {
    let release: (value: string) => void = () => {};
    const fn = vi
      .fn<(query: string) => Promise<string>>()
      .mockImplementationOnce(() => new Promise((resolve) => (release = resolve)))
      .mockImplementationOnce(async () => "new");
    const search = debounceLatest(fn, 200);
    const old = search("old");
    await vi.advanceTimersByTimeAsync(200);
    const fresh = search("new");
    await vi.advanceTimersByTimeAsync(200);
    release("old");
    expect(await fresh).toBe("new");
    // The superseded call follows the newest answer, not its own.
    expect(await old).toBe("new");
  });
});
