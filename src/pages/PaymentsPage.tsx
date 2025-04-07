
import DashboardLayout from "@/components/layout/DashboardLayout";
import SupabasePaymentsTable from "@/components/payments/SupabasePaymentsTable";

const PaymentsPage = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Track all payment transactions and their statuses.
        </p>
      </div>
      <SupabasePaymentsTable />
    </DashboardLayout>
  );
};

export default PaymentsPage;
