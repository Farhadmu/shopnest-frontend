import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";

describe("Better Auth Email OTP Verification Architecture", () => {
  let capturedOtps: { email: string; otp: string; type: string }[] = [];

  // Initialize Better Auth with the exact configuration used in auth.ts
  const testAuth = betterAuth({
    secret: "test-secret-at-least-32-characters-long-12345",
    baseURL: "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      autoSignInAfterVerification: true,
    },
    plugins: [
      emailOTP({
        overrideDefaultEmailVerification: true,
        sendVerificationOnSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          capturedOtps.push({ email, otp, type });
        },
      }),
    ],
  });

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "Password123!Secure";
  const testName = "Test User";

  it("1. Registration sends OTP with type 'email-verification' and does not issue session", async () => {
    capturedOtps = [];
    const res = await testAuth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: testName,
      },
    });

    assert.ok(res.user, "User should be created in the database");
    assert.equal(res.user.email, testEmail);
    assert.equal(res.user.emailVerified, false, "Account must be unverified initially");
    assert.equal(res.token, null, "Unverified user should not receive an authenticated session token");

    assert.equal(capturedOtps.length, 1, "Expected exactly 1 OTP to be dispatched on registration");
    assert.equal(capturedOtps[0].email, testEmail);
    assert.equal(capturedOtps[0].type, "email-verification", "OTP type must be email-verification");
    assert.equal(typeof capturedOtps[0].otp, "string");
    assert.equal(capturedOtps[0].otp.length, 6, "Default OTP length should be 6 digits");
  });

  it("2. Login protection: Unverified user cannot sign in with email/password", async () => {
    let errorCaught: any = null;
    try {
      await testAuth.api.signInEmail({
        body: {
          email: testEmail,
          password: testPassword,
        },
      });
    } catch (err: any) {
      errorCaught = err;
    }

    assert.ok(errorCaught, "Sign-in must fail for unverified user");
    assert.ok(
      errorCaught.status === 403 || errorCaught.status === "FORBIDDEN",
      "Must return 403 / FORBIDDEN",
    );
    assert.equal(errorCaught.body?.code, "EMAIL_NOT_VERIFIED", "Error code must be EMAIL_NOT_VERIFIED");
  });

  it("3. Invalid OTP is rejected and does not verify the email", async () => {
    let errorCaught: any = null;
    try {
      await testAuth.api.verifyEmailOTP({
        body: {
          email: testEmail,
          otp: "000000", // Incorrect OTP
        },
      });
    } catch (err: any) {
      errorCaught = err;
    }

    assert.ok(errorCaught, "Invalid OTP must be rejected");
    assert.equal(errorCaught.body?.code, "INVALID_OTP", "Error code must be INVALID_OTP");

    // Verify user is still unverified
    let loginError: any = null;
    try {
      await testAuth.api.signInEmail({
        body: {
          email: testEmail,
          password: testPassword,
        },
      });
    } catch (err: any) {
      loginError = err;
    }
    assert.equal(loginError?.body?.code, "EMAIL_NOT_VERIFIED", "User must remain unverified");
  });

  it("4. Attempt limits: Exceeding allowed attempts invalidates the OTP", async () => {
    // Attempt 2 (first was in test 3)
    try {
      await testAuth.api.verifyEmailOTP({
        body: { email: testEmail, otp: "111111" },
      });
    } catch {}

    // Attempt 3
    let errorCaught: any = null;
    try {
      await testAuth.api.verifyEmailOTP({
        body: { email: testEmail, otp: "222222" },
      });
    } catch (err: any) {
      errorCaught = err;
    }

    // Now reaching/exceeding 3 allowed attempts triggers TOO_MANY_ATTEMPTS
    try {
      await testAuth.api.verifyEmailOTP({
        body: { email: testEmail, otp: "333333" },
      });
    } catch (err: any) {
      errorCaught = err;
    }

    assert.ok(errorCaught, "Exceeding attempts must error");
    assert.equal(errorCaught.body?.code, "TOO_MANY_ATTEMPTS", "Error code must be TOO_MANY_ATTEMPTS");
  });

  it("5. Resend: Generates and delivers a new valid OTP", async () => {
    capturedOtps = [];
    const res = await testAuth.api.sendVerificationOTP({
      body: {
        email: testEmail,
        type: "email-verification",
      },
    });

    assert.equal(res.success, true, "Resend request must succeed");
    assert.equal(capturedOtps.length, 1, "Must capture the newly sent OTP");
    assert.equal(capturedOtps[0].type, "email-verification");
    assert.equal(capturedOtps[0].email, testEmail);
    assert.equal(capturedOtps[0].otp.length, 6);
  });

  it("6. Successful verification: Correct OTP marks email verified and sets session", async () => {
    const validOtp = capturedOtps[capturedOtps.length - 1].otp;

    const res = await testAuth.api.verifyEmailOTP({
      body: {
        email: testEmail,
        otp: validOtp,
      },
    });

    assert.equal(res.status, true, "Verification must return status: true");
    assert.equal(res.user.emailVerified, true, "User emailVerified state must now be true");
    assert.ok(res.token, "Session token should be returned when autoSignInAfterVerification is true");
  });

  it("7. Verified user can now log in normally with email/password", async () => {
    const res = await testAuth.api.signInEmail({
      body: {
        email: testEmail,
        password: testPassword,
      },
    });

    assert.ok(res.user, "Login must succeed");
    assert.equal(res.user.email, testEmail);
    assert.equal(res.user.emailVerified, true);
    assert.ok(res.token, "Session token must be issued");
  });
});
