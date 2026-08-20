import { Link, useLocation } from "react-router-dom";

const DashboardLayout = ({ title, links, children }) => {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      <aside className="w-56 shrink-0 hidden md:block">
        <h2 className="font-bold text-lg mb-4">{title}</h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 rounded-lg text-sm ${
                location.pathname === link.to
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};

export default DashboardLayout;
