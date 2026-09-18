import { OrderListView } from "@/components/orders/OrderListView";

export const metadata = {
  title: "My Orders | ShopNest",
  description: "View and track your ShopNest orders, delivery timeline, and invoices.",
};

export default function OrdersPage() {
  return <OrderListView basePath="/orders" />;
}
