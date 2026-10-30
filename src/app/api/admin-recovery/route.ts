import { NextRequest, NextResponse } from "next/server";
import { AdminRecoveryService } from "@/lib/admin-recovery.service";

/**
 * Administrative Recovery Route Handler
 * 
 * SECURITY MEASURES:
 * - NOT a public endpoint: strictly guarded by the server's ADMIN_RECOVERY_KEY.
 * - Cannot be accessed by customers, sellers, or unauthorized actors.
 * - Requires cryptographically verified OTP sent to the real recipient's inbox.
 * - Rate-limited and audited in security_logs.
 */
export async function POST(req: NextRequest) {
  try {
    const recoveryKey =
      req.headers.get("x-admin-recovery-key") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    const body = await req.json().catch(() => ({}));
    const keyToUse = recoveryKey || body.recoveryKey || "";

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const { action } = body;

    if (action === "request-otp") {
      const { newAdminEmail, currentAdminEmail } = body;
      if (!newAdminEmail) {
        return NextResponse.json(
          { error: "newAdminEmail is required." },
          { status: 400 }
        );
      }

      const result = await AdminRecoveryService.requestRecoveryOtp({
        currentAdminEmail,
        newAdminEmail,
        recoveryKey: keyToUse,
        ipAddress,
        userAgent,
      });

      return NextResponse.json(result);
    }

    if (action === "verify-otp") {
      const { newAdminEmail, otp, newPassword } = body;
      if (!newAdminEmail || !otp) {
        return NextResponse.json(
          { error: "newAdminEmail and otp are required." },
          { status: 400 }
        );
      }

      const result = await AdminRecoveryService.verifyOtpAndRecover({
        newAdminEmail,
        otp,
        newPassword,
        recoveryKey: keyToUse,
        ipAddress,
        userAgent,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'request-otp', 'verify-otp'." },
      { status: 400 }
    );
  } catch (err: any) {
    const isAuthError = err.message?.toLowerCase().includes("authorization denied") ||
      err.message?.toLowerCase().includes("invalid or missing admin recovery key");

    return NextResponse.json(
      { error: err.message || "An error occurred during admin recovery." },
      { status: isAuthError ? 403 : 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Admin recovery requires authenticated POST." },
    { status: 405 }
  );
}
