import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Icons are imported from Remix Icon (ri) via CDN in the index.html

const navItems = [
  { href: "/", icon: "ri-dashboard-line", label: "Dashboard" },
  { href: "/guests", icon: "ri-user-line", label: "Guests" },
  { href: "/rooms", icon: "ri-door-lock-line", label: "Rooms" },
  { href: "/staff", icon: "ri-team-line", label: "Staff" },
  { href: "/bookings", icon: "ri-calendar-check-line", label: "Bookings" },
  { href: "/payments", icon: "ri-bank-card-line", label: "Payments" },
];

const secondaryNavItems = [
  { href: "/settings", icon: "ri-settings-3-line", label: "Settings" },
  { href: "/help", icon: "ri-question-line", label: "Help & Support" },
];

const Sidebar = () => {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 overflow-y-auto scrollbar-hide">
      <div className="p-4 border-b">
        <div className="flex items-center justify-center">
          <i className="ri-hotel-line text-2xl text-primary-600 mr-2"></i>
          <h1 className="text-xl font-semibold text-gray-800">Hotel Manager</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-lg font-medium",
                location === item.href
                  ? "text-primary-700 bg-primary-50"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <i className={`${item.icon} mr-3 text-lg`}></i>
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
        
        <div className="pt-4 border-t mt-4">
          {secondaryNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-lg font-medium",
                  location === item.href
                    ? "text-primary-700 bg-primary-50"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <i className={`${item.icon} mr-3 text-lg`}></i>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
            JD
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-700">John Doe</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <i className="ri-arrow-down-s-line ml-auto"></i>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
