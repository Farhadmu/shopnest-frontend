import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import path from "node:path";
import fs from "node:fs";

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }

  const { auth } = await import("../src/lib/auth");

  console.log("Seeding fresh default user accounts...");

  const accounts = [
    {
      name: "ShopNest Admin",
      email: "admin@shopnest.com",
      password: "admin123456",
      role: "admin",
    },
    {
      name: "ShopNest Official Store",
      email: "seller@shopnest.com",
      password: "seller123456",
      role: "seller",
    },
    {
      name: "Farhad (Customer)",
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

  // Connect directly with MongoClient to configure seller store and product ownership
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const sellerUser = await db.collection("user").findOne({ email: "seller@shopnest.com" });
  if (sellerUser) {
    // Create / ensure Store exists for this seller
    const existingStore = await db.collection("stores").findOne({ userId: sellerUser._id.toString() });
    let storeId = existingStore?._id?.toString();

    if (!existingStore) {
      const storeRes = await db.collection("stores").insertOne({
        name: "ShopNest Official Store",
        slug: "shopnest-official-store",
        description: "Official verified merchant storefront for premium electronics and lifestyle goods.",
        userId: sellerUser._id.toString(),
        logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
        banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
        phone: "+8801700000000",
        status: "approved",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      storeId = storeRes.insertedId.toString();
      console.log(`Created Store '${storeId}' for seller`);
    }

    // Link all 6 preserved products to this seller & store
    const updateResult = await db.collection("products").updateMany(
      {},
      {
        $set: {
          sellerId: sellerUser._id.toString(),
          storeId: storeId,
          status: "approved",
          isDeleted: false,
        },
      }
    );
    console.log(`Linked ${updateResult.modifiedCount} products to fresh seller store.`);
  }

  await client.close();
  console.log("Clean setup complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
