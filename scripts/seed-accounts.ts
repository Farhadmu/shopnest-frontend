import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import path from "node:path";
import fs from "node:fs";

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

async function main() {
  console.log("MONGODB_URI loaded:", process.env.MONGODB_URI ? "YES" : "NO");
  const { auth } = await import("../src/lib/auth");

  console.log("Seeding default accounts...");

  const accounts = [
    {
      name: "ShopNest Admin",
      email: "admin@shopnest.com",
      password: "admin123456",
      role: "admin",
    },
    {
      name: "ShopNest Seller",
      email: "seller@shopnest.com",
      password: "seller123456",
      role: "seller",
    },
    {
      name: "ShopNest Customer",
      email: "customer@shopnest.com",
      password: "customer123456",
      role: "customer",
    },
  ];

  for (const acc of accounts) {
    try {
      await auth.api.signUpEmail({
        body: {
          name: acc.name,
          email: acc.email,
          password: acc.password,
          role: acc.role,
        },
      });
      console.log(`Created account: ${acc.email} with role: ${acc.role}`);
    } catch (err: any) {
      console.log(`Account ${acc.email}:`, err?.body?.message || err?.message || err);
    }
  }

  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
