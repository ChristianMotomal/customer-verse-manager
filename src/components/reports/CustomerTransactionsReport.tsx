
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import { 
  generatePdfFromElement, 
  fetchCustomerTransactionsData, 
  getReportTimestamp,
  formatReportDate 
} from '@/utils/reportGenerator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TransactionDetails = {
  quantity: number;
  prodcode: string;
  product: {
    description: string;
    unit: string;
  };
};

type Transaction = {
  transno: string;
  salesdate: string;
  custno: string;
  customer: {
    custname: string;
  };
  empno: string;
  employee: {
    firstname: string;
    lastname: string;
  };
  salesdetails: TransactionDetails[];
};

const CustomerTransactionsReport = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [reportReady, setReportReady] = useState(false);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setReportReady(false);
      const data = await fetchCustomerTransactionsData(customerId || undefined);
      setTransactions(data);
      // Set report ready after data is loaded
      setTimeout(() => setReportReady(true), 1000);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // When transactions change, update report ready state
  useEffect(() => {
    if (transactions.length > 0) {
      setTimeout(() => setReportReady(true), 1000);
    }
  }, [transactions]);

  const printReport = async () => {
    if (!reportRef.current || !reportReady) {
      toast({
        title: "Error",
        description: "Report is not ready for printing. Please wait for it to fully load.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsPrinting(true);
      
      // Make sure styles are fully applied before capturing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await generatePdfFromElement(
        reportRef.current, 
        `customer-transactions-${customerId || 'all'}-${getReportTimestamp()}`
      );
      
      toast({
        title: "Success",
        description: "Customer transactions PDF generated successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Customer Transactions Report</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={loadReport} 
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load Data"}
          </Button>
          <Button
            onClick={printReport}
            disabled={transactions.length === 0 || isLoading || isPrinting || !reportReady}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? "Generating PDF..." : "Print to PDF"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="customerId">Customer ID (Optional)</Label>
          <Input 
            id="customerId" 
            value={customerId} 
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Leave empty for all customers"
          />
        </div>
        <Button onClick={loadReport} disabled={isLoading}>
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div ref={reportRef} className="p-6" id="transaction-report">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Customer Transactions Report</h2>
              <p className="text-muted-foreground">
                {customerId ? `For Customer ID: ${customerId}` : 'All Customers'} - Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-6">
                {isLoading ? "Loading transaction data..." : "No transactions to display. Use the search options to fetch transactions."}
              </div>
            ) : (
              <>
                {transactions.map((transaction) => (
                  <div key={transaction.transno} className="mb-8 border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p><span className="font-medium">Transaction #:</span> {transaction.transno}</p>
                        <p><span className="font-medium">Date:</span> {formatReportDate(transaction.salesdate)}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Customer:</span> {transaction.customer?.custname || 'N/A'} ({transaction.custno})</p>
                        <p><span className="font-medium">Employee:</span> {transaction.employee ? `${transaction.employee.firstname || ''} ${transaction.employee.lastname || ''}` : 'N/A'}</p>
                      </div>
                    </div>

                    <h4 className="font-medium mb-2">Items:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transaction.salesdetails?.length ? (
                          transaction.salesdetails.map((detail, index) => (
                            <TableRow key={`${transaction.transno}-${detail.prodcode}-${index}`}>
                              <TableCell>{detail.prodcode}</TableCell>
                              <TableCell>{detail.product?.description || 'N/A'}</TableCell>
                              <TableCell>{detail.quantity}</TableCell>
                              <TableCell>{detail.product?.unit || 'N/A'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">No items in this transaction</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerTransactionsReport;
