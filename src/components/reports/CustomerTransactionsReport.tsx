
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
      
      // Clear existing data first
      setTransactions([]);
      
      // Fetch new data
      const data = await fetchCustomerTransactionsData(customerId || undefined);
      console.log("Transactions loaded:", data.length);
      
      if (data.length === 0) {
        toast({
          title: "No transactions found",
          description: customerId 
            ? `No transactions found for customer ID: ${customerId}` 
            : "No transactions available",
        });
      }
      
      // Set data after fetching
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      
      // Set report ready after a longer delay to ensure rendering
      if (reportRef.current) {
        setTimeout(() => {
          setReportReady(true);
          console.log("Report marked as ready");
        }, 2000);
      }
    }
  };

  // When transactions change, update report ready state with a generous timeout
  useEffect(() => {
    setReportReady(false);
    
    if (transactions.length > 0) {
      console.log(`Setting up report ready timeout for ${transactions.length} transactions`);
      const timer = setTimeout(() => {
        setReportReady(true);
        console.log("Report marked as ready after transactions update");
      }, 3000); // Longer timeout to ensure all content renders
      
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  const printReport = async () => {
    if (!reportRef.current || !reportReady) {
      toast({
        title: "Warning",
        description: "Report is not ready for printing. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsPrinting(true);
      toast({
        title: "Processing",
        description: "Generating PDF, please wait...",
      });
      
      console.log("Starting PDF generation");
      
      // Force report content visibility
      if (reportRef.current) {
        const reportElement = reportRef.current;
        reportElement.style.display = 'block';
        reportElement.style.visibility = 'visible';
        reportElement.style.opacity = '1';
      }
      
      // Ensure report is fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate the PDF with a unique filename
      await generatePdfFromElement(
        reportRef.current, 
        `customer-transactions-${customerId || 'all'}-${getReportTimestamp()}`
      );
      
      toast({
        title: "Success",
        description: "PDF generated successfully! Check your downloads folder.",
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
            disabled={isLoading || isPrinting}
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
            disabled={isLoading || isPrinting}
          />
        </div>
        <Button onClick={loadReport} disabled={isLoading || isPrinting}>
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </div>

      <Card className="mt-4">
        <CardContent className="p-6 print:p-0">
          <div 
            ref={reportRef} 
            className="bg-white" 
            id="transaction-report"
            style={{ width: "100%", display: "block", visibility: "visible" }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Customer Transactions Report</h2>
              <p className="text-gray-600">
                {customerId ? `For Customer ID: ${customerId}` : 'All Customers'} - Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200 min-h-[400px] flex items-center justify-center">
                {isLoading 
                  ? "Loading transaction data..." 
                  : "No transactions to display. Use the search options to fetch transactions."}
              </div>
            ) : (
              <div className="space-y-8">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.transno} 
                    id={`transaction-${index}`}
                    className="mb-8 border border-gray-200 rounded-lg p-4"
                    style={{ pageBreakInside: 'avoid', display: 'block', visibility: 'visible' }}
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="mb-1"><span className="font-medium">Transaction #:</span> {transaction.transno}</p>
                        <p className="mb-1"><span className="font-medium">Date:</span> {formatReportDate(transaction.salesdate)}</p>
                      </div>
                      <div>
                        <p className="mb-1"><span className="font-medium">Customer:</span> {transaction.customer?.custname || 'N/A'} ({transaction.custno})</p>
                        <p className="mb-1"><span className="font-medium">Employee:</span> {transaction.employee ? `${transaction.employee.firstname || ''} ${transaction.employee.lastname || ''}` : 'N/A'}</p>
                      </div>
                    </div>

                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="overflow-visible">
                      <Table className="border border-gray-200 w-full" style={{ display: 'table', visibility: 'visible' }}>
                        <TableHeader style={{ display: 'table-header-group', visibility: 'visible' }}>
                          <TableRow style={{ display: 'table-row', visibility: 'visible' }}>
                            <TableHead className="border border-gray-200 bg-gray-50 font-bold" style={{ display: 'table-cell', visibility: 'visible' }}>Product Code</TableHead>
                            <TableHead className="border border-gray-200 bg-gray-50 font-bold" style={{ display: 'table-cell', visibility: 'visible' }}>Description</TableHead>
                            <TableHead className="border border-gray-200 bg-gray-50 font-bold" style={{ display: 'table-cell', visibility: 'visible' }}>Quantity</TableHead>
                            <TableHead className="border border-gray-200 bg-gray-50 font-bold" style={{ display: 'table-cell', visibility: 'visible' }}>Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody style={{ display: 'table-row-group', visibility: 'visible' }}>
                          {transaction.salesdetails?.length ? (
                            transaction.salesdetails.map((detail, detailIndex) => (
                              <TableRow key={`${transaction.transno}-${detail.prodcode}-${detailIndex}`} style={{ display: 'table-row', visibility: 'visible' }}>
                                <TableCell className="border border-gray-200" style={{ display: 'table-cell', visibility: 'visible' }}>{detail.prodcode}</TableCell>
                                <TableCell className="border border-gray-200" style={{ display: 'table-cell', visibility: 'visible' }}>{detail.product?.description || 'N/A'}</TableCell>
                                <TableCell className="border border-gray-200" style={{ display: 'table-cell', visibility: 'visible' }}>{detail.quantity}</TableCell>
                                <TableCell className="border border-gray-200" style={{ display: 'table-cell', visibility: 'visible' }}>{detail.product?.unit || 'N/A'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow style={{ display: 'table-row', visibility: 'visible' }}>
                              <TableCell colSpan={4} className="border border-gray-200 text-center" style={{ display: 'table-cell', visibility: 'visible' }}>No items in this transaction</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerTransactionsReport;
