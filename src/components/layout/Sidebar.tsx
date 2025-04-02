
import { Link, useLocation } from "react-router-dom";
import { Users, CreditCard, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
    },
  ];

  return (
    <div className="hidden md:flex flex-col h-screen bg-sidebar border-r border-gray-200 w-64 fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">CustomerVerse</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer Manager</p>
      </div>

      <nav className="flex-1 px-4 pb-6 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
              location.pathname === item.href
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">CVM</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
