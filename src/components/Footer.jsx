const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gradient" />
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-1">
            <span className="gradient-text">Shop</span>Nest
          </h3>
          <p className="text-gray-400">Shop Smarter. Sell Better.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Customer</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Track Order</li>
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Returns & Refunds</li>
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Support</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Sell on ShopNest</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Become a Seller</li>
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Seller Dashboard</li>
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Seller Analytics</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-brand-400 transition-colors cursor-pointer">About</li>
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Careers</li>
            <li className="hover:text-brand-400 transition-colors cursor-pointer">Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopNest. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
