import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAdvisorPositionClass,
  getVisualSearchPositionClass,
  FLOATING_UI_OFFSETS,
} from "./floating-ui-tokens.ts";

describe("Floating UI Coordinate Tokens", () => {
  it("should return elevated advisor position on /products listing route", () => {
    const pos = getAdvisorPositionClass("/products");
    assert.equal(pos, FLOATING_UI_OFFSETS.PRODUCTS_PAGE.AI_ADVISOR.combined);
    assert.ok(pos.includes("sm:bottom-[9.5rem]"));
  });

  it("should return elevated advisor position on /products/[id] detail route", () => {
    const pos = getAdvisorPositionClass("/products/prod-123");
    assert.equal(pos, FLOATING_UI_OFFSETS.PRODUCTS_PAGE.AI_ADVISOR.combined);
    assert.ok(pos.includes("sm:bottom-[9.5rem]"));
  });

  it("should return default public advisor position on home route", () => {
    const pos = getAdvisorPositionClass("/");
    assert.equal(pos, FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.AI_ADVISOR.combined);
    assert.ok(pos.includes("sm:bottom-[5.5rem]"));
  });

  it("should return middle slot visual search position on /products", () => {
    const pos = getVisualSearchPositionClass("/products");
    assert.equal(pos, FLOATING_UI_OFFSETS.PRODUCTS_PAGE.VISUAL_SEARCH.combined);
    assert.ok(pos.includes("sm:bottom-[5.5rem]"));
  });

  it("should return lowest slot visual search position on home route", () => {
    const pos = getVisualSearchPositionClass("/");
    assert.equal(pos, FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.VISUAL_SEARCH.combined);
    assert.ok(pos.includes("sm:bottom-6"));
  });

  it("should clear MobileBottomNav (64px) with bottom-20 on mobile", () => {
    assert.equal(FLOATING_UI_OFFSETS.PRODUCTS_PAGE.VISUAL_SEARCH.mobile, "bottom-20 right-4");
    assert.equal(FLOATING_UI_OFFSETS.DEFAULT_PUBLIC.VISUAL_SEARCH.mobile, "bottom-20 right-4");
  });
});
