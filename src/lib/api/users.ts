import { clientFetch, clientMutation } from "@/lib/core/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  avatarUrl?: string;
  phone?: string;
  image?: string;
}

export async function getUserProfile() {
  return clientFetch<UserProfile>("/users/profile");
}

export async function updateUserProfile(data: Partial<UserProfile>) {
  return clientMutation<UserProfile>("/users/profile", "PATCH", data);
}