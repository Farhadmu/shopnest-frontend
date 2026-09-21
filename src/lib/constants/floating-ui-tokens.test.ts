import { describe, it, expect } from "vitest";
import {
  getAdvisorPositionClass,
  getVisualSearchPositionClass,
  FLOATING_UI_OFFSETS,
} from "./floating-ui-tokens";

describe("Floating UI Coordinate Tokens", () => {
  it("should return elevated advisor position on /products listing route", () => {
    const pos = getAdvisorPositionClass("/products");
    expect(pos).toBe(FLOATING_UI_OFFSETS.PRODUCTS_PAGE.AI_ADVISOR.combined);
    expect(pos).toContain("sm:bottom-[9.5rem]");
  });

  it("should return elevated advisor position on /products/[id] detail route", () => {
    const pos = getAdvisorPositionClass("/products/prod-123");
    expect(pos).toBe(FLOATING_UI_OFFSETS.PRODUCTS_PAGE.AI_ADVISOR.combined);
    expect(pos).toContain("sm:bottom-[9.5rem]");
  });

  it("should return default public advisor position on home route", () => {
    const pos = getAdvisorPositionClass("/");
    expect(pos).toBe(FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.AI_ADVISOR.combined);
    expect(pos).toContain("sm:bottom-[5.5rem]");
  });

  it("should return middle slot visual search position on /products", () => {
    const pos = getVisualSearchPositionClass("/products");
    expect(pos).toBe(FLOATING_UI_OFFSETS.PRODUCTS_PAGE.VISUAL_SEARCH.combined);
    expect(pos).toContain("sm:bottom-[5.5rem]");
  });

  it("should return lowest slot visual search position on home route", () => {
    const pos = getVisualSearchPositionClass("/");
    expect(pos).toBe(FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.VISUAL_SEARCH.combined);
    expect(pos).toContain("sm:bottom-6");
  });

  it("should clear MobileBottomNav (64px) with bottom-20 on mobile", () => {
    expect(FLOATING_UI_OFFSETS.PRODUCTS_PAGE.VISUAL_SEARCH.mobile).toBe("bottom-20 right-4");
    expect(FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.VISUAL_SEARCH.mobile).toBe("bottom-20 right-4");
  });
});
