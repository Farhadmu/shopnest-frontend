import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  bdMobileSchema,
  getBdMobileError,
  isValidBdMobile,
  normalizeBdMobile,
} from "./phone.ts";

const REJECTED = [
  "",
  "   ",
  "000000",
  "0000000000",
  "111111",
  "1111111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "123456",
  "1234567890",
  "abcdef",
  "017123",
  "017123456789012345",
  "01112345678",
  "01212345678",
  "0171234567a",
  "+88017123456789",
  "1",
  "1712345678",
];

const ACCEPTED = [
  "01712345678",
  "01812345678",
  "01912345678",
  "01612345678",
  "01312345678",
  "01412345678",
  "01512345678",
  "+8801712345678",
  "8801712345678",
  "017-1234-5678",
  " 01712345678 ",
  "018 1234 5678",
];

describe("bdMobileSchema", () => {
  for (const value of REJECTED) {
    it(`rejects ${JSON.stringify(value)}`, () => {
      const result = bdMobileSchema.safeParse(value);
      assert.equal(result.success, false, `expected ${value} to be rejected`);
      assert.ok(getBdMobileError(value), "expected a user-facing message");
    });
  }

  for (const value of ACCEPTED) {
    it(`accepts ${JSON.stringify(value)}`, () => {
      const result = bdMobileSchema.safeParse(value);
      assert.equal(result.success, true, `expected ${value} to be accepted`);
      assert.equal(getBdMobileError(value), null);
      assert.ok(isValidBdMobile(value));
    });
  }
});

describe("normalizeBdMobile", () => {
  it("normalises international and separated formats", () => {
    assert.equal(normalizeBdMobile("+8801712345678"), "01712345678");
    assert.equal(normalizeBdMobile("8801712345678"), "01712345678");
    assert.equal(normalizeBdMobile("017-1234-5678"), "01712345678");
    assert.equal(normalizeBdMobile(" 01712345678 "), "01712345678");
  });

  it("returns null for invalid numbers", () => {
    assert.equal(normalizeBdMobile("000000"), null);
    assert.equal(normalizeBdMobile("1234567890"), null);
  });
});

describe("error messages", () => {
  it("reports a required message for empty input", () => {
    assert.equal(getBdMobileError(""), "Please enter your phone number.");
    assert.equal(getBdMobileError("   "), "Please enter your phone number.");
  });

  it("reports an invalid message for malformed input", () => {
    assert.equal(
      getBdMobileError("000000"),
      "Please enter a valid Bangladeshi phone number.",
    );
  });
});
