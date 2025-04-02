
import DashboardLayout from "@/components/layout/DashboardLayout";
import PaymentsTable from "@/components/payments/PaymentsTable";

const PaymentsPage = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Track all payment transactions and their statuses.
        </p>
      </div>
      <PaymentsTable />
    </DashboardLayout>
  );
};

export default PaymentsPage;
