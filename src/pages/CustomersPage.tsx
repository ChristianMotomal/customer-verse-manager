
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomersTable from "@/components/customers/CustomersTable";

const CustomersPage = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer information and view customer details.
        </p>
      </div>
      <CustomersTable />
    </DashboardLayout>
  );
};

export default CustomersPage;
