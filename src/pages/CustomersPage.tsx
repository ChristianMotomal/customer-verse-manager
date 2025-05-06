
import DashboardLayout from "@/components/layout/DashboardLayout";
import SupabaseCustomersTable from "@/components/customers/SupabaseCustomersTable";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";

type UserRole = "admin" | "user" | "blocked";

const CustomersPage = () => {
  const { profile } = useAuth();
  const userRole = profile?.role as UserRole || "user";

  // If the user is blocked, show an access denied message
  if (userRole === "blocked") {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-8">
          <ShieldX className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view customer data. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer information and view customer details.
          {userRole === "user" && (
            <span className="block text-yellow-600 mt-1 text-sm">
              Note: As a regular user, you can view and edit customers but cannot delete them.
            </span>
          )}
        </p>
      </div>
      <SupabaseCustomersTable />
      <Toaster />
    </DashboardLayout>
  );
};

export default CustomersPage;
