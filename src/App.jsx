import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AiAssistant from "./pages/AiAssistant";
import StorePage from "./pages/StorePage";
import NotFound from "./pages/NotFound";

import AccountLayout from "./pages/customer/AccountLayout";
import MyOrders from "./pages/customer/MyOrders";
import OrderDetail from "./pages/customer/OrderDetail";
import Wishlist from "./pages/customer/Wishlist";

import SellerLayout from "./pages/seller/SellerLayout";
import SellerOverview from "./pages/seller/SellerOverview";
import StoreSettings from "./pages/seller/StoreSettings";
import SellerProducts from "./pages/seller/SellerProducts";
import ProductForm from "./pages/seller/ProductForm";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerCoupons from "./pages/seller/SellerCoupons";
import SellerAnalytics from "./pages/seller/SellerAnalytics";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/store/:slug" element={<StorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />

          {/* Cart / Checkout (customer) */}
          <Route path="/cart" element={<PrivateRoute roles={["CUSTOMER"]}><CartPage /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute roles={["CUSTOMER"]}><CheckoutPage /></PrivateRoute>} />

          {/* Customer account */}
          <Route
            path="/account/orders"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <AccountLayout><MyOrders /></AccountLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/account/orders/:id"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <AccountLayout><OrderDetail /></AccountLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/account/wishlist"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <AccountLayout><Wishlist /></AccountLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <AccountLayout><MyOrders /></AccountLayout>
              </PrivateRoute>
            }
          />

          {/* Seller dashboard */}
          <Route path="/seller" element={<PrivateRoute roles={["SELLER"]}><SellerLayout><SellerOverview /></SellerLayout></PrivateRoute>} />
          <Route path="/seller/store" element={<PrivateRoute roles={["SELLER"]}><SellerLayout><StoreSettings /></SellerLayout></PrivateRoute>} />
          <Route path="/seller/products" element={<PrivateRoute roles={["SELLER"]}><SellerLayout><SellerProducts /></SellerLayout></PrivateRoute>} />
          <Route path="/seller/products/new" element={<PrivateRoute roles={["SELLER"]}><SellerLayout><ProductForm /></SellerLayout></PrivateRoute>} />
          <Route path="/seller/orders" element={<PrivateRoute roles={["SELLER"]}><SellerLayout><SellerOrders /></SellerLayout></PrivateRoute>} />
          <Route path="/seller/coupons" element={<PrivateRoute roles={["SELLER"]}><SellerLayout><SellerCoupons /></SellerLayout></PrivateRoute>} />
          <Route path="/seller/analytics" element={<PrivateRoute roles={["SELLER"]}><SellerLayout><SellerAnalytics /></SellerLayout></PrivateRoute>} />

          {/* Admin dashboard */}
          <Route path="/admin" element={<PrivateRoute roles={["ADMIN"]}><AdminLayout><AdminDashboard /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={["ADMIN"]}><AdminLayout><AdminUsers /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/sellers" element={<PrivateRoute roles={["ADMIN"]}><AdminLayout><AdminSellers /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/products" element={<PrivateRoute roles={["ADMIN"]}><AdminLayout><AdminProducts /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute roles={["ADMIN"]}><AdminLayout><AdminOrders /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/categories" element={<PrivateRoute roles={["ADMIN"]}><AdminLayout><AdminCategories /></AdminLayout></PrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
