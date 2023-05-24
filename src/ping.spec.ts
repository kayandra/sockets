import { describe, expect, it } from "vitest";
import { createTestPingClient } from "../tests/utils";

describe("Ping", () => {
  it("pings a url", async () => {
    await createTestPingClient((resolve) => ({
      onPing({ startMs, endMs, roundTripMs, pingMs }) {
        expect(roundTripMs).toEqual(endMs - startMs);
        expect(pingMs).toEqual(roundTripMs / 2);
        resolve();
      },
    }));
  });
});
