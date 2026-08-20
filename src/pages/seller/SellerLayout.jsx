import DashboardLayout from "../../components/DashboardLayout";

const links = [
  { to: "/seller", label: "Overview" },
  { to: "/seller/store", label: "Store Settings" },
  { to: "/seller/products", label: "Products" },
  { to: "/seller/products/new", label: "Add Product" },
  { to: "/seller/orders", label: "Orders" },
  { to: "/seller/coupons", label: "Coupons" },
  { to: "/seller/analytics", label: "Analytics" },
];

const SellerLayout = ({ children }) => (
  <DashboardLayout title="Seller Dashboard" links={links}>
    {children}
  </DashboardLayout>
);

export default SellerLayout;
