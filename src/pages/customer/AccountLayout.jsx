import DashboardLayout from "../../components/DashboardLayout";

const links = [
  { to: "/account/orders", label: "My Orders" },
  { to: "/account/wishlist", label: "Wishlist" },
];

const AccountLayout = ({ children }) => (
  <DashboardLayout title="My Account" links={links}>
    {children}
  </DashboardLayout>
);

export default AccountLayout;
