import { describe, expect, it } from "vitest";
import { isLocale, translate } from "@/lib/i18n/translations";

describe("i18n translations", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("translates shared navigation labels", () => {
    expect(translate("en", "nav.login")).toBe("Log in");
    expect(translate("de", "nav.login")).toBe("Einloggen");
    expect(translate("de", "nav.dayOverview")).toBe("Tagesübersicht");
  });

  it("interpolates values", () => {
    expect(translate("en", "portal.day", { dayNumber: 3 })).toBe("Day 3");
    expect(translate("de", "portal.day", { dayNumber: 3 })).toBe("Tag 3");
  });
});
