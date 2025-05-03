
import { Link, useLocation } from "react-router-dom";
import { Users, LayoutDashboard, User, LogOut, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Sidebar = () => {
  const location = useLocation();
  const { user, profile, logout } = useAuth();

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
      name: "Reports",
      href: "/reports",
      icon: FileText,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="hidden md:flex flex-col h-screen bg-sidebar border-r border-gray-200 w-64 fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary truncate">CustomerVerse</h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">Customer Manager</p>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-4 pb-6 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-md transition-colors truncate",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="px-4 py-6 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <Avatar className="h-8 w-8 flex-shrink-0">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile?.name || ''} />
            ) : (
              <AvatarFallback className="bg-primary/10">
                {profile?.name?.charAt(0) || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email || user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link 
            to="/profile" 
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-md w-full transition-colors truncate",
              location.pathname === "/profile"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <User className="mr-3 h-4 w-4 flex-shrink-0" />
            My Profile
          </Link>
          
          <Button 
            variant="outline" 
            className="flex items-center w-full justify-start text-left" 
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
