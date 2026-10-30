import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import readline from "node:readline";
import { AdminRecoveryService } from "../src/lib/admin-recovery.service";
import { MongoClient } from "mongodb";

function ask(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  console.log("\n=======================================================");
  console.log("   ShopNest Authorized Admin Account Recovery Tool   ");
  console.log("=======================================================\n");

  const recoveryKey = process.env.ADMIN_RECOVERY_KEY;
  if (!recoveryKey) {
    console.error("❌ ERROR: ADMIN_RECOVERY_KEY is not defined in your environment (.env).");
    console.error("Please add a 64-char ADMIN_RECOVERY_KEY to your .env file before running recovery.");
    process.exit(1);
  }

  // 1. Connect to MongoDB to inspect current admin account
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/shopnest");
  await client.connect();
  const db = client.db("shopnest");

  const currentAdmin = await db.collection("user").findOne({ role: "admin" });
  if (!currentAdmin) {
    console.error("❌ ERROR: No account with role 'admin' found in MongoDB database.");
    await client.close();
    process.exit(1);
  }

  console.log(`Current Target Admin Account:`);
  console.log(`  - User ID: ${currentAdmin._id}`);
  console.log(`  - Name:    ${currentAdmin.name || "N/A"}`);
  console.log(`  - Email:   ${currentAdmin.email}`);
  console.log(`  - Role:    ${currentAdmin.role}`);
  console.log(`  - Verified: ${currentAdmin.emailVerified ? "YES" : "NO"}\n`);

  await client.close();

  // 2. Prompt for new real email
  const newEmail = await ask("Enter the NEW real, controlled email address for this Admin: ");
  if (!newEmail || !newEmail.includes("@")) {
    console.error("❌ ERROR: A valid email address is required.");
    process.exit(1);
  }

  // 3. Prompt for optional new password
  const newPassword = await ask("Enter NEW password for Admin login (press Enter to keep current): ");
  if (newPassword && newPassword.length < 8) {
    console.error("❌ ERROR: Password must be at least 8 characters.");
    process.exit(1);
  }

  console.log(`\n⏳ Dispatching real verification OTP via SMTP to "${newEmail}"...`);

  // 4. Request OTP
  try {
    const reqResult = await AdminRecoveryService.requestRecoveryOtp({
      currentAdminEmail: currentAdmin.email,
      newAdminEmail: newEmail,
      recoveryKey,
      ipAddress: "127.0.0.1 (CLI Local Admin Console)",
      userAgent: "ShopNest Admin Recovery CLI v1.0",
    });

    console.log(`\n✅ ${reqResult.message}\n`);
  } catch (err: any) {
    console.error(`\n❌ Failed to dispatch OTP:`, err.message);
    process.exit(1);
  }

  // 5. Prompt for OTP from email
  console.log(`👉 Please open the inbox for "${newEmail}" and copy the 6-digit verification code.`);
  const otpInput = await ask("\nEnter the 6-digit verification code: ");

  if (!otpInput || otpInput.length !== 6) {
    console.error("❌ ERROR: Verification code must be exactly 6 digits.");
    process.exit(1);
  }

  console.log(`\n⏳ Verifying OTP and atomically updating administrator account...`);

  // 6. Complete verification and update
  try {
    const verifyResult = await AdminRecoveryService.verifyOtpAndRecover({
      newAdminEmail: newEmail,
      otp: otpInput,
      newPassword: newPassword || undefined,
      recoveryKey,
      ipAddress: "127.0.0.1 (CLI Local Admin Console)",
      userAgent: "ShopNest Admin Recovery CLI v1.0",
    });

    console.log(`\n=======================================================`);
    console.log(`🎉 SUCCESS: Admin Account Recovery Complete!`);
    console.log(`=======================================================`);
    console.log(`  - Admin User ID:  ${verifyResult.user.id}`);
    console.log(`  - Verified Email: ${verifyResult.user.email}`);
    console.log(`  - Role Preserved: ${verifyResult.user.role}`);
    console.log(`  - Email Verified: ${verifyResult.user.emailVerified}`);
    console.log(`  - Password Set:   ${verifyResult.user.passwordUpdated ? "Updated" : "Preserved"}`);
    console.log(`\nYou can now sign in at http://localhost:3000/login or production`);
    console.log(`using "${newEmail}" and your password!\n`);
  } catch (err: any) {
    console.error(`\n❌ Verification failed:`, err.message);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
