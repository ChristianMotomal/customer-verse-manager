
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface CustomerData {
  custno: string;
  custname: string | null;
  totalSpent?: number;
}

interface PaymentData {
  orno: string;
  transno: string | null;
  paydate: string | null;
  amount: number | null;
  customer?: {
    custno: string;
    custname: string | null;
  };
}

const Dashboard = () => {
  const [recentCustomers, setRecentCustomers] = useState<CustomerData[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent customers
        const { data: customersData, error: customersError } = await supabase
          .from('customer')
          .select('*')
          .order('custno', { ascending: false })
          .limit(3);

        if (customersError) throw customersError;

        // Fetch recent payments with customer details
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payment')
          .select(`
            *,
            sales (
              custno,
              customer:customer (
                custno,
                custname
              )
            )
          `)
          .order('paydate', { ascending: false })
          .limit(5);

        if (paymentsError) throw paymentsError;

        // Process payments data to flatten structure
        const processedPayments = paymentsData.map(payment => ({
          ...payment,
          customer: payment.sales?.customer || null
        }));

        setRecentCustomers(customersData || []);
        setRecentPayments(processedPayments || []);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>OR Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentPayments.map((payment) => (
                      <TableRow key={payment.orno}>
                        <TableCell>
                          {payment.customer ? (
                            <Link
                              to={`/customers/${payment.customer.custno}`}
                              className="font-medium hover:underline text-primary"
                            >
                              {payment.customer.custname || payment.customer.custno}
                            </Link>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>{payment.orno}</TableCell>
                        <TableCell>{formatDate(payment.paydate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${payment.amount?.toLocaleString() || "0.00"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recent Customers</p>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : recentCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No customers found.</p>
                ) : (
                  recentCustomers.map((customer) => (
                    <div
                      key={customer.custno}
                      className="flex justify-between items-center"
                    >
                      <Link
                        to={`/customers/${customer.custno}`}
                        className="hover:underline text-primary"
                      >
                        {customer.custname || customer.custno}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button asChild className="w-full gap-2">
              <Link to="/customers">
                <PlusCircle className="h-4 w-4" />
                View All Customers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
