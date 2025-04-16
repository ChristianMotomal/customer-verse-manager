
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentPayments from "@/components/dashboard/RecentPayments";
import CustomerInsights from "@/components/dashboard/CustomerInsights";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your customer management dashboard.
          </p>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <RecentPayments />
        <CustomerInsights />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
