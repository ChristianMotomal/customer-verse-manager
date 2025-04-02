
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentPayments, customers } from "@/utils/data";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const recentPayments = getRecentPayments(5);

  // Get customer names for payments
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "successful":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/payments">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Link
                        to={`/customers/${payment.customerId}`}
                        className="font-medium hover:underline text-primary"
                      >
                        {getCustomerName(payment.customerId)}
                      </Link>
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeColor(payment.status)}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${payment.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Top Customers</p>
              <div className="space-y-2">
                {customers
                  .sort((a, b) => b.totalSpent - a.totalSpent)
                  .slice(0, 3)
                  .map((customer) => (
                    <div
                      key={customer.id}
                      className="flex justify-between items-center"
                    >
                      <Link
                        to={`/customers/${customer.id}`}
                        className="hover:underline text-primary"
                      >
                        {customer.name}
                      </Link>
                      <span className="font-medium">
                        ${customer.totalSpent.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Recent Activity</p>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">4 new customers this month</p>
                  <p className="text-muted-foreground">+12.5% from last month</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">15 payments processed</p>
                  <p className="text-muted-foreground">$24,500 total revenue</p>
                </div>
              </div>
            </div>

            <Button className="w-full gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
