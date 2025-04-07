
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FilterX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PaymentData {
  orno: string;
  transno: string | null;
  paydate: string | null;
  amount: number | null;
}

interface SalesData {
  transno: string;
  custno: string | null;
  empno: string | null;
  salesdate: string | null;
}

interface CustomerData {
  custno: string;
  custname: string | null;
}

const SupabasePaymentsTable = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [sales, setSales] = useState<SalesData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payment')
          .select('*');
        
        if (paymentsError) throw paymentsError;
        
        // Fetch sales for joining with payments
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*');
          
        if (salesError) throw salesError;
        
        // Fetch customers for names
        const { data: customersData, error: customersError } = await supabase
          .from('customer')
          .select('custno, custname');
          
        if (customersError) throw customersError;
        
        setPayments(paymentsData || []);
        setSales(salesData || []);
        setCustomers(customersData || []);
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

    fetchData();
  }, [toast]);

  const getCustomerName = (transno: string | null): string => {
    if (!transno) return "N/A";
    
    const sale = sales.find(s => s.transno === transno);
    if (!sale) return "N/A";
    
    const customer = customers.find(c => c.custno === sale.custno);
    return customer?.custname || sale.custno || "N/A";
  };

  const getCustomerId = (transno: string | null): string | null => {
    if (!transno) return null;
    
    const sale = sales.find(s => s.transno === transno);
    if (!sale) return null;
    
    return sale.custno;
  };

  const filteredPayments = payments.filter((payment) => {
    // Apply search filter
    return searchQuery === "" ||
      payment.orno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.transno && payment.transno.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getCustomerName(payment.transno).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSearchQuery("")}>
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OR Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Transaction No</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.orno}>
                    <TableCell className="font-medium">
                      {payment.orno}
                    </TableCell>
                    <TableCell>
                      {payment.transno ? (
                        <Link
                          to={`/customers/${getCustomerId(payment.transno)}`}
                          className="hover:underline text-primary"
                        >
                          {getCustomerName(payment.transno)}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(payment.paydate)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {payment.transno || "N/A"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${payment.amount?.toLocaleString() || "0.00"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SupabasePaymentsTable;
