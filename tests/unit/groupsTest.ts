import { describe, expect, it } from "vitest";
import { countByGroup, groupOf } from "@/src/groups";

describe("groups", () => {
  it("puts each field type in its group", () => {
    expect(groupOf("barangay")).toBe("address");
    expect(groupOf("phone")).toBe("contact");
    expect(groupOf("password")).toBe("secret");
    expect(groupOf("unknown")).toBe("unknown");
  });

  it("counts fields per group in a fixed order", () => {
    expect(
      countByGroup(["unknown", "email", "firstName", "lastName", "zip"]),
    ).toEqual([
      { group: "person", count: 2 },
      { group: "contact", count: 1 },
      { group: "address", count: 1 },
      { group: "unknown", count: 1 },
    ]);
  });
});
