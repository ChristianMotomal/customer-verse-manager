
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Mail, Building, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CustomerData {
  custno: string;
  custname: string | null;
  address: string | null;
  payterm: string | null;
}

interface SalesData {
  transno: string;
  salesdate: string | null;
  empno: string | null;
}

interface PaymentData {
  orno: string;
  transno: string | null;
  paydate: string | null;
  amount: number | null;
}

const SupabaseCustomerDetails = () => {
  const { customerId = "" } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [customerPayments, setCustomerPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Fetch customer
        const { data: customerData, error: customerError } = await supabase
          .from('customer')
          .select('*')
          .eq('custno', customerId)
          .single();
          
        if (customerError) throw customerError;
        
        setCustomer(customerData);
        
        // Fetch sales for this customer
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('custno', customerId);
          
        if (salesError) throw salesError;
        
        // Get transaction numbers for this customer
        const transactionIds = (salesData || []).map(sale => sale.transno);
        
        if (transactionIds.length > 0) {
          // Fetch payments for these transactions
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payment')
            .select('*')
            .in('transno', transactionIds);
            
          if (paymentsError) throw paymentsError;
          
          setCustomerPayments(paymentsData || []);
        }
      } catch (error: any) {
        console.error('Error fetching customer details:', error);
        toast({
          title: "Error",
          description: "Failed to load customer details. " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Customer Not Found</h2>
        <p className="mb-6">The customer you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  const handleSendEmail = () => {
    toast({
      title: "Email sent",
      description: `Email would be sent to ${customer.custname}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Customer Details</h1>
        </div>
        <Button onClick={handleSendEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Contact Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center pt-2 pb-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-medium text-primary">
                  {customer.custname
                    ? customer.custname.charAt(0).toUpperCase()
                    : customer.custno.charAt(0)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold">{customer.custname || "No Name"}</h3>
                  <div className="text-sm text-muted-foreground">
                    Customer No: {customer.custno}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Building className="h-4 w-4" />
                  {customer.address || "No address provided"}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Term: {customer.payterm || "Not specified"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {customerPayments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No payment history available.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OR Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction No</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayments.map((payment) => (
                    <TableRow key={payment.orno}>
                      <TableCell className="font-medium">
                        {payment.orno}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.paydate)}
                      </TableCell>
                      <TableCell>
                        {payment.transno || "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${payment.amount?.toLocaleString() || "0.00"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseCustomerDetails;
