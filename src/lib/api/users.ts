import { protectedFetch, protectedMutation } from "@/lib/core/server";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  avatarUrl?: string;
}

export async function getUserProfile() {
  return protectedFetch<UserProfile>("/users/profile");
}

export async function updateUserProfile(data: Partial<UserProfile>) {
  return protectedMutation<UserProfile>("/users/profile", "PATCH", data);
}
