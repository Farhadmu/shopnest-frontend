import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

/**
 * Server-side Better Auth Instance
 * Configures authentication provider, database adapter, and server credentials.
 */
const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/shopnest");
const db = client.db();

const rawBaseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "https://shopnest-frontend-six.vercel.app";

const baseURL = rawBaseURL.replace(/\/$/, "");

const smtpUser = (process.env.SMTP_USER || "").replace(/['"]/g, "").trim();
const smtpPass = (process.env.SMTP_PASS || "").replace(/['"\s]/g, "").trim();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [
    "https://shopnest-frontend-six.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    baseURL,
  ].filter((v): v is string => Boolean(v)),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      try {
        console.log(`[Auth] Sending password reset email to: ${user.email}`);
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"ShopNest" <${smtpUser}>`,
          to: user.email,
          subject: "Reset your ShopNest password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #4f46e5; margin-bottom: 16px;">Reset Your Password</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.5;">Hello ${user.name || "there"},</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.5;">We received a request to reset your password. Click the button below to set a new password:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${url}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #4f46e5; font-size: 12px; word-break: break-all;">${url}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          `,
        });
        console.log(`[Auth] Password reset email sent successfully. ID: ${info.messageId}`);
      } catch (error) {
        console.error(`[Auth] Failed to send password reset email:`, error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      shopName: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});