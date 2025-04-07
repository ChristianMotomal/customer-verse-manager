
import DashboardLayout from "@/components/layout/DashboardLayout";
import SupabaseCustomerDetails from "@/components/customers/SupabaseCustomerDetails";

const CustomerDetailsPage = () => {
  return (
    <DashboardLayout>
      <SupabaseCustomerDetails />
    </DashboardLayout>
  );
};

export default CustomerDetailsPage;
