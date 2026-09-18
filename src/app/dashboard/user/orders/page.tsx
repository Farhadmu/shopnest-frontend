import { OrderListView } from "@/components/orders/OrderListView";

export const metadata = {
  title: "Order History | Dashboard | ShopNest",
  description: "Manage your past purchases, track real-time delivery milestones, and view order receipts.",
};

export default function UserOrdersDashboardPage() {
  return (
    <OrderListView
      basePath="/dashboard/user/orders"
      showDashboardStats
      showAiBanner
      pageTitle="Order History"
      pageSubtitle="Track real-time delivery milestones, receipts, and order statuses."
    />
  );
}
