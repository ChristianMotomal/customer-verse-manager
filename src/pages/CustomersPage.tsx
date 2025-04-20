
import DashboardLayout from "@/components/layout/DashboardLayout";
import SupabaseCustomersTable from "@/components/customers/SupabaseCustomersTable";
import { Toaster } from "@/components/ui/toaster";

const CustomersPage = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer information and view customer details.
        </p>
      </div>
      <SupabaseCustomersTable />
      <Toaster />
    </DashboardLayout>
  );
};

export default CustomersPage;
