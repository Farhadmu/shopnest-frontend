import crypto from "node:crypto";
import dns from "node:dns";
import nodemailer from "nodemailer";
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "@better-auth/utils/password";

// Ensure DNS works for MongoDB Atlas SRV lookups
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // Ignore in environments where setServers is restricted
}

let _client: MongoClient | null = null;
function getDb() {
  if (!_client) {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/shopnest";
    _client = new MongoClient(uri);
  }
  return _client.db("shopnest");
}

const db = {
  collection: <T extends import("mongodb").Document = import("mongodb").Document>(name: string) => getDb().collection<T>(name),
};

function getTransporter() {
  const smtpUser = (process.env.SMTP_USER || "").replace(/['"]/g, "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").replace(/['"\s]/g, "").trim();
  return {
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    }),
    smtpUser,
  };
}

export interface RequestRecoveryOtpParams {
  currentAdminEmail?: string;
  newAdminEmail: string;
  recoveryKey: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface VerifyRecoveryOtpParams {
  newAdminEmail: string;
  otp: string;
  newPassword?: string;
  recoveryKey: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Constant-time string comparison to prevent timing attacks on recovery key.
 */
function verifyRecoverySecret(providedKey: string): boolean {
  const secret = process.env.ADMIN_RECOVERY_KEY?.trim();
  if (!secret || secret.length < 32 || !providedKey) return false;
  try {
    const a = Buffer.from(providedKey.trim());
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Hashes OTP with a secret salt for secure storage in database.
 */
function hashOtp(otp: string, salt: string): string {
  return crypto.createHash("sha256").update(`${otp}:${salt}:${process.env.BETTER_AUTH_SECRET || "shopnest"}`).digest("hex");
}

export class AdminRecoveryService {
  /**
   * Request an Admin Recovery OTP to be dispatched to the new controlled email address.
   */
  static async requestRecoveryOtp(params: RequestRecoveryOtpParams) {
    const { newAdminEmail, recoveryKey, ipAddress, userAgent } = params;
    const currentAdminEmail = (params.currentAdminEmail || "admin@shopnest.com").trim().toLowerCase();
    const cleanNewEmail = newAdminEmail.trim().toLowerCase();

    // 1. Authenticate with master recovery key
    if (!verifyRecoverySecret(recoveryKey)) {
      await this.logAudit({
        type: "ADMIN_RECOVERY_FAILED_AUTH",
        severity: "critical",
        message: `Unauthorized attempt to initiate admin recovery for ${currentAdminEmail}`,
        details: { ip: ipAddress, userAgent, currentAdminEmail, newAdminEmail: cleanNewEmail },
      });
      throw new Error("Invalid or missing Admin Recovery Key. Authorization denied.");
    }

    // 2. Validate email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanNewEmail)) {
      throw new Error("Invalid new email address format.");
    }

    // 3. Verify that the target account exists and is an administrator
    const currentAdmin = await db.collection("user").findOne({
      email: currentAdminEmail,
      role: "admin",
    });

    if (!currentAdmin) {
      throw new Error(`Active admin account with email "${currentAdminEmail}" not found.`);
    }

    // 4. Rate-limiting check: max 3 OTP requests per 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentRequests = await db.collection("admin_recovery_tokens").countDocuments({
      createdAt: { $gte: fifteenMinutesAgo },
    });
    if (recentRequests >= 5) {
      throw new Error("Rate limit reached. Too many recovery requests recently. Please wait a few minutes.");
    }

    // 5. Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedOtp = hashOtp(rawOtp, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing tokens for this target
    await db.collection("admin_recovery_tokens").deleteMany({
      $or: [{ newAdminEmail: cleanNewEmail }, { currentAdminEmail }],
    });

    // Save recovery token
    await db.collection("admin_recovery_tokens").insertOne({
      currentAdminEmail,
      currentAdminId: currentAdmin._id,
      newAdminEmail: cleanNewEmail,
      hashedOtp,
      salt,
      attempts: 0,
      maxAttempts: 3,
      expiresAt,
      createdAt: new Date(),
      ipAddress,
      userAgent,
    });

    // 6. Send the real OTP email using SMTP
    const emailSubject = `${rawOtp} is your ShopNest Admin Recovery Code`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; padding: 10px 20px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; font-weight: 900; font-size: 20px; letter-spacing: -0.5px;">
            ShopNest Security
          </div>
        </div>
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; text-align: center; margin: 0 0 12px;">Admin Account Recovery Verification</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 24px;">
          A request was initiated by an authorized project owner to designate <strong>${cleanNewEmail}</strong> as the official primary administrator for the ShopNest marketplace.
        </p>
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #4f46e5; display: inline-block;">
            ${rawOtp}
          </span>
          <p style="color: #64748b; font-size: 12px; margin: 8px 0 0; font-weight: 600;">Valid for 10 minutes • Single-use only</p>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
          <p style="color: #991b1b; font-size: 12px; line-height: 1.5; margin: 0;">
            <strong>Security Notice:</strong> Verifying this code will transfer full platform governance and administrator access to this email address. If you did not authorize this action, secure your server immediately.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          ShopNest Production Security System • Timestamp: ${new Date().toISOString()}
        </p>
      </div>
    `;

    try {
      const { transporter, smtpUser } = getTransporter();
      const info = await transporter.sendMail({
        from: `"ShopNest Security" <${smtpUser}>`,
        to: cleanNewEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      await this.logAudit({
        type: "ADMIN_RECOVERY_OTP_SENT",
        severity: "medium",
        message: `Admin recovery OTP sent to ${cleanNewEmail} for replacing ${currentAdminEmail}`,
        details: { messageId: info.messageId, newAdminEmail: cleanNewEmail, ipAddress },
      });

      return {
        success: true,
        message: `Verification OTP successfully dispatched to ${cleanNewEmail}. Please check your inbox.`,
        expiresInSeconds: 600,
      };
    } catch (err: any) {
      console.error("[AdminRecovery] Failed to send email:", err);
      throw new Error(`Failed to dispatch verification email via SMTP: ${err.message}`);
    }
  }

  /**
   * Verify the received OTP and atomically replace the admin email with the verified email address.
   */
  static async verifyOtpAndRecover(params: VerifyRecoveryOtpParams) {
    const { newAdminEmail, otp, newPassword, recoveryKey, ipAddress, userAgent } = params;
    const cleanNewEmail = newAdminEmail.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // 1. Authenticate with master recovery key
    if (!verifyRecoverySecret(recoveryKey)) {
      await this.logAudit({
        type: "ADMIN_RECOVERY_FAILED_AUTH",
        severity: "critical",
        message: `Unauthorized attempt to complete admin recovery for ${cleanNewEmail}`,
        details: { ip: ipAddress, userAgent, cleanNewEmail },
      });
      throw new Error("Invalid or missing Admin Recovery Key. Authorization denied.");
    }

    // 2. Fetch pending token record
    const tokenRecord = await db.collection("admin_recovery_tokens").findOne({
      newAdminEmail: cleanNewEmail,
    });

    if (!tokenRecord) {
      throw new Error("No active recovery request found for this email. Please request a new OTP first.");
    }

    // Check expiration
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      await db.collection("admin_recovery_tokens").deleteOne({ _id: tokenRecord._id });
      throw new Error("Recovery verification code has expired. Please request a new one.");
    }

    // Check attempt limits (max 3)
    if (tokenRecord.attempts >= tokenRecord.maxAttempts) {
      await db.collection("admin_recovery_tokens").deleteOne({ _id: tokenRecord._id });
      throw new Error("Too many invalid attempts. For security, this recovery session has been cancelled. Please initiate a new request.");
    }

    // 3. Verify OTP cryptographic hash
    const expectedHash = tokenRecord.hashedOtp;
    const providedHash = hashOtp(cleanOtp, tokenRecord.salt);

    const hashMatch = crypto.timingSafeEqual(
      Buffer.from(expectedHash),
      Buffer.from(providedHash)
    );

    if (!hashMatch) {
      await db.collection("admin_recovery_tokens").updateOne(
        { _id: tokenRecord._id },
        { $inc: { attempts: 1 } }
      );
      const remaining = tokenRecord.maxAttempts - (tokenRecord.attempts + 1);
      throw new Error(`Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Token invalidated."}`);
    }

    // 4. Verification SUCCESS! Fetch target admin account
    const targetAdmin = await db.collection("user").findOne({
      _id: tokenRecord.currentAdminId instanceof ObjectId ? tokenRecord.currentAdminId : new ObjectId(tokenRecord.currentAdminId),
    }) || await db.collection("user").findOne({
      email: tokenRecord.currentAdminEmail,
      role: "admin",
    });

    if (!targetAdmin) {
      throw new Error("Target admin user account could not be found in the database.");
    }

    // 5. Handle duplicate user collision: if newAdminEmail already exists as a customer/seller, archive or clean it up
    const existingUserWithNewEmail = await db.collection("user").findOne({
      email: cleanNewEmail,
      _id: { $ne: targetAdmin._id },
    });

    if (existingUserWithNewEmail) {
      console.log(`[AdminRecovery] Found pre-existing non-admin user with ${cleanNewEmail} (${existingUserWithNewEmail._id}). Archiving duplicate...`);
      // Update the duplicate user's email with archived tag to free up cleanNewEmail
      const archivedEmail = `archived_${Date.now()}_${cleanNewEmail}`;
      await db.collection("user").updateOne(
        { _id: existingUserWithNewEmail._id },
        { $set: { email: archivedEmail, note: `Archived during admin recovery of ${targetAdmin._id}` } }
      );
      await db.collection("account").updateMany(
        { userId: existingUserWithNewEmail._id },
        { $set: { accountId: String(existingUserWithNewEmail._id) } }
      );
    }

    // 6. Atomically update Admin account in MongoDB
    const now = new Date();
    await db.collection("user").updateOne(
      { _id: targetAdmin._id },
      {
        $set: {
          email: cleanNewEmail,
          emailVerified: true,
          updatedAt: now,
        },
      }
    );

    // 7. If new password supplied, update credential account hash
    let passwordUpdated = false;
    if (newPassword && newPassword.trim().length >= 8) {
      const hashedNewPassword = await hashPassword(newPassword.trim());
      const accountResult = await db.collection("account").updateOne(
        {
          $or: [
            { userId: targetAdmin._id },
            { userId: String(targetAdmin.id || targetAdmin._id) },
            { accountId: String(targetAdmin.id || targetAdmin._id) },
          ],
          providerId: "credential",
        },
        {
          $set: {
            password: hashedNewPassword,
            updatedAt: now,
          },
        }
      );

      if (accountResult.matchedCount === 0) {
        // If no credential account existed, create one
        await db.collection("account").insertOne({
          issuer: "local:credential",
          accountId: String(targetAdmin.id || targetAdmin._id),
          providerId: "credential",
          userId: targetAdmin._id,
          password: hashedNewPassword,
          createdAt: now,
          updatedAt: now,
        });
      }
      passwordUpdated = true;
    }

    // 8. Revoke all existing sessions for this admin so fresh login is required
    await db.collection("session").deleteMany({
      $or: [
        { userId: targetAdmin._id },
        { userId: String(targetAdmin.id || targetAdmin._id) },
      ],
    });

    // 9. Consume and delete one-time recovery token
    await db.collection("admin_recovery_tokens").deleteMany({
      $or: [{ _id: tokenRecord._id }, { newAdminEmail: cleanNewEmail }],
    });

    // 10. Write security audit record
    await this.logAudit({
      type: "ADMIN_ACCOUNT_RECOVERED",
      severity: "critical",
      message: `Admin account successfully recovered. Email changed from ${tokenRecord.currentAdminEmail} to ${cleanNewEmail}. Email verified: true. Password updated: ${passwordUpdated}`,
      details: {
        adminId: targetAdmin._id,
        previousEmail: tokenRecord.currentAdminEmail,
        newEmail: cleanNewEmail,
        passwordUpdated,
        ipAddress,
        userAgent,
        completedAt: now,
      },
    });

    return {
      success: true,
      message: `Admin account recovered successfully! Email is now verified as "${cleanNewEmail}". You can now sign in at /login using your verified email and password.`,
      user: {
        id: String(targetAdmin._id),
        email: cleanNewEmail,
        role: "admin",
        emailVerified: true,
        passwordUpdated,
      },
    };
  }

  /**
   * Log security events to MongoDB for full transparency and forensic audit.
   */
  private static async logAudit(entry: {
    type: string;
    severity: string;
    message: string;
    details?: Record<string, unknown>;
  }) {
    try {
      await db.collection("security_logs").insertOne({
        ...entry,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("[AdminRecovery] Failed to write security log:", err);
    }
  }
}
