import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getDeviceId } from "./device-id.ts";

const COOKIE_NAME = "shopnest_device_id";
/** Mirrors the backend's accepted device-id shape (utils/device.ts). */
const BACKEND_DEVICE_ID_PATTERN = /^[A-Za-z0-9._-]{16,128}$/;

/**
 * Minimal browser stand-in: a cookie jar plus `window.location.protocol`, which
 * is all `device-id.ts` touches. Reusing the same jar across calls models the
 * same browser; a fresh jar models a different browser/device.
 */
function installFakeBrowser(cookieJar = new Map<string, string>(), protocol = "http:") {
  const documentStub = {
    get cookie() {
      return [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(raw: string) {
      const [pair, ...attributes] = raw.split(";").map((part) => part.trim());
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      const maxAge = Number(
        (attributes.find((a) => a.toLowerCase().startsWith("max-age=")) ?? "").split("=")[1]
      );
      if (Number.isFinite(maxAge) && maxAge <= 0) cookieJar.delete(name);
      else cookieJar.set(name, value);
      documentStub.lastWrite = raw;
    },
    lastWrite: "",
  };

  (globalThis as Record<string, unknown>).document = documentStub;
  (globalThis as Record<string, unknown>).window = { location: { protocol } };
  return { cookieJar, documentStub };
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).document;
  delete (globalThis as Record<string, unknown>).window;
});

describe("getDeviceId", () => {
  it("returns the same id on every call from the same browser", () => {
    const { cookieJar } = installFakeBrowser();

    const first = getDeviceId();
    const second = getDeviceId();

    assert.ok(first, "expected an id to be generated");
    assert.equal(second, first, "the same browser must not get a new id");
    assert.equal(cookieJar.size, 1, "only one device cookie should exist");
  });

  it("keeps the id across page loads (cookie is reused, never regenerated)", () => {
    const { cookieJar } = installFakeBrowser();
    const original = getDeviceId();

    // A new page load: same cookie jar, fresh module-level state.
    installFakeBrowser(cookieJar, "https:");

    assert.equal(getDeviceId(), original);
  });

  it("gives a different id to a different browser/device", () => {
    const browserA = installFakeBrowser();
    const idA = getDeviceId();

    const browserB = installFakeBrowser();
    const idB = getDeviceId();

    assert.ok(idA && idB);
    assert.notEqual(idA, idB, "separate cookie jars are separate devices");
    assert.equal(browserA.cookieJar.get(COOKIE_NAME), idA);
    assert.equal(browserB.cookieJar.get(COOKIE_NAME), idB);
  });

  it("generates an id the backend will accept", () => {
    installFakeBrowser();
    const id = getDeviceId();

    assert.ok(id);
    assert.match(id, BACKEND_DEVICE_ID_PATTERN);
    assert.ok(id.length >= 16, "short ids would be rejected by the backend");
  });

  it("replaces a corrupt cookie value instead of trusting it", () => {
    const { cookieJar } = installFakeBrowser(new Map([[COOKIE_NAME, "not valid!../etc"]]));

    const id = getDeviceId();

    assert.ok(id);
    assert.notEqual(id, "not valid!../etc");
    assert.match(id, BACKEND_DEVICE_ID_PATTERN);
    assert.equal(cookieJar.get(COOKIE_NAME), id, "the bad value must be overwritten");
  });

  it("is a long-lived, first-party, lax cookie", () => {
    const { documentStub } = installFakeBrowser();
    getDeviceId();

    assert.match(documentStub.lastWrite, /Path=\//);
    assert.match(documentStub.lastWrite, /SameSite=Lax/);
    const maxAge = Number(/Max-Age=(\d+)/.exec(documentStub.lastWrite)?.[1]);
    assert.ok(maxAge >= 60 * 60 * 24 * 365, `expected a multi-month cookie, got ${maxAge}s`);
    assert.ok(!/Secure/.test(documentStub.lastWrite), "Secure must be omitted on plain http");
  });

  it("adds Secure on https", () => {
    const { documentStub } = installFakeBrowser(new Map(), "https:");
    getDeviceId();

    assert.match(documentStub.lastWrite, /Secure/);
  });

  it("returns undefined (no throw) when there is no browser", () => {
    delete (globalThis as Record<string, unknown>).document;
    delete (globalThis as Record<string, unknown>).window;

    assert.equal(getDeviceId(), undefined);
  });
});
