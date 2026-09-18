"use client";

import { useParams } from "next/navigation";
import { OrderDetailView } from "@/components/orders/OrderDetailView";

export default function UserOrderDetailPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  return (
    <OrderDetailView
      orderId={id}
      backHref="/dashboard/user/orders"
      variant="dashboard"
    />
  );
}
