
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

const RecentPayments = () => {
  const [recentPayments, setRecentPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
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

        const processedPayments = paymentsData.map(payment => ({
          ...payment,
          customer: payment.sales?.customer || null
        }));

        setRecentPayments(processedPayments || []);
      } catch (error: any) {
        console.error('Error fetching payment data:', error);
        toast({
          title: "Error",
          description: "Failed to load payment data. " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
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
  );
};

export default RecentPayments;
