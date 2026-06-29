import { describe, expect, it } from "vitest";
import { createDayBuckets, isDayNumber, parseDayNumber } from "@/lib/domain/days";
import { generateTemporaryPassword, passwordMeetsTemporaryPolicy } from "@/lib/domain/passwords";
import { assertUserRole, isUserRole } from "@/lib/domain/roles";
import { DAY_NUMBERS, USER_ROLES, type DayUpload } from "@/lib/domain/types";

describe("domain rules", () => {
  it("defines exactly the admin and participant roles", () => {
    expect(USER_ROLES).toEqual(["admin", "participant"]);
    expect(isUserRole("admin")).toBe(true);
    expect(isUserRole("participant")).toBe(true);
    expect(isUserRole("parent")).toBe(false);
    expect(isUserRole("child")).toBe(false);
    expect(isUserRole("student")).toBe(false);
    expect(() => assertUserRole("family")).toThrow("Unsupported account role.");
  });

  it("accepts only Day 1 through Day 5", () => {
    expect(DAY_NUMBERS).toEqual([1, 2, 3, 4, 5]);
    expect(isDayNumber(1)).toBe(true);
    expect(isDayNumber(5)).toBe(true);
    expect(isDayNumber(0)).toBe(false);
    expect(isDayNumber(6)).toBe(false);
    expect(parseDayNumber("3")).toBe(3);
    expect(parseDayNumber("6")).toBeNull();
  });

  it("creates exactly five fixed day buckets", () => {
    const upload: DayUpload = {
      id: "upload-1",
      accountId: "account-1",
      dayNumber: 2,
      title: "Robot story",
      fileType: "html",
      storagePath: "accounts/account-1/day-2/upload-1-index.html",
      originalFilename: "index.html",
      contentType: "text/html",
      fileSizeBytes: 500,
      createdAt: "2026-06-29T12:00:00.000Z",
    };

    const buckets = createDayBuckets([upload]);

    expect(buckets).toHaveLength(5);
    expect(buckets.map((bucket) => bucket.dayNumber)).toEqual([1, 2, 3, 4, 5]);
    expect(buckets[1].uploads).toEqual([upload]);
  });

  it("generates temporary passwords that meet the local policy", () => {
    const password = generateTemporaryPassword();

    expect(passwordMeetsTemporaryPolicy(password)).toBe(true);
  });
});
