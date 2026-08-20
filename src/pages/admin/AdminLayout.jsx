import DashboardLayout from "../../components/DashboardLayout";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/sellers", label: "Seller Verification" },
  { to: "/admin/products", label: "Product Moderation" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/categories", label: "Categories" },
];

const AdminLayout = ({ children }) => (
  <DashboardLayout title="Admin Panel" links={links}>
    {children}
  </DashboardLayout>
);

export default AdminLayout;
