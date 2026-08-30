import { clientFetch, clientMutation } from "@/lib/core/client";

export interface Address {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  fullName: string;
  phone: string;
  division: string;
  city: string;
  streetAddress: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAddresses(): Promise<Address[]> {
  return clientFetch<Address[]>("/customer/addresses");
}

export async function createAddress(data: {
  title?: string;
  fullName: string;
  phone: string;
  division: string;
  city?: string;
  streetAddress: string;
  isDefault?: boolean;
}): Promise<Address> {
  return clientMutation<Address>("/customer/addresses", "POST", data);
}

export async function deleteAddress(id: string): Promise<{ id: string }> {
  return clientMutation<{ id: string }>(`/customer/addresses/${id}`, "DELETE");
}

export async function updateAddress(
  id: string,
  data: Partial<{
    title: string;
    fullName: string;
    phone: string;
    division: string;
    city: string;
    streetAddress: string;
    isDefault: boolean;
  }>
): Promise<Address> {
  return clientMutation<Address>(`/customer/addresses/${id}`, "PATCH", data);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  return clientMutation<Address>(`/customer/addresses/${id}/default`, "PATCH");
}
