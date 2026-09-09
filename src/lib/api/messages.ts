import { clientMutation } from "@/lib/core/client";

export async function sendSellerMessage(input: {
  receiverId: string;
  subject: string;
  message: string;
}) {
  return clientMutation("/customer/features/messages", "POST", input);
}

import { clientFetch } from "@/lib/core/client";

export async function getStoreFollowStatus(storeId: string) {
  return clientFetch<{ followed: boolean }>(`/sellers/stores/${encodeURIComponent(storeId)}/follow`);
}

export async function followStore(storeId: string) {
  return clientMutation<{ followed: boolean }>(`/sellers/stores/${encodeURIComponent(storeId)}/follow`, "POST");
}

export async function unfollowStore(storeId: string) {
  return clientMutation<{ followed: boolean }>(`/sellers/stores/${encodeURIComponent(storeId)}/follow`, "DELETE");
}
