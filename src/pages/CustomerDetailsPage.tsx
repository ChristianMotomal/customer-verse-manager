
import DashboardLayout from "@/components/layout/DashboardLayout";
import SupabaseCustomerDetails from "@/components/customers/SupabaseCustomerDetails";
import { useParams } from "react-router-dom";

const CustomerDetailsPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Customer Details</h1>
        <p className="text-muted-foreground">
          View detailed information about this customer.
        </p>
      </div>
      <SupabaseCustomerDetails />
    </DashboardLayout>
  );
};

export default CustomerDetailsPage;
