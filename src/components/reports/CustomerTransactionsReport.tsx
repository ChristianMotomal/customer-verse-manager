
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Loader2 } from 'lucide-react';
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
  const [batchSize, setBatchSize] = useState(10); // Process transactions in smaller batches
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
      
      // Set report ready after a reasonable delay
      setTimeout(() => {
        setReportReady(true);
        console.log("Report marked as ready");
      }, 1000);
    }
  };

  // When transactions change, update report ready state
  useEffect(() => {
    setReportReady(false);
    
    if (transactions.length > 0) {
      console.log(`Setting up report ready timeout for ${transactions.length} transactions`);
      const timer = setTimeout(() => {
        setReportReady(true);
        console.log("Report marked as ready after transactions update");
      }, 1000); 
      
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
        description: `Generating PDF with ${transactions.length} transactions. This may take a moment...`,
      });
      
      // Provide more immediate feedback for large reports
      if (transactions.length > 20) {
        toast({
          title: "Large Report",
          description: "You're generating a large report. This may take several minutes to complete.",
        });
      }
      
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
        description: "Failed to generate PDF. Try with fewer transactions or filter by customer ID.",
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
            {isPrinting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                Print to PDF
              </>
            )}
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

      {isPrinting && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm">
          <p className="font-medium">PDF Generation In Progress</p>
          <p>Please don't close this window. Large reports may take several minutes to complete.</p>
        </div>
      )}

      <Card className="mt-4">
        <CardContent className="p-6">
          {/* The report content that will be converted to PDF */}
          <div 
            ref={reportRef} 
            className="bg-white print-container" 
            id="transaction-report"
          >
            {/* Report header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Customer Transactions Report</h2>
              <p className="text-gray-600">
                {customerId ? `For Customer ID: ${customerId}` : 'All Customers'} - Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
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
                    className="mb-8 border border-gray-200 rounded-lg p-4 print-transaction"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="mb-1">
                          <span className="font-medium">Transaction #:</span> {transaction.transno}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Date:</span> {formatReportDate(transaction.salesdate)}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1">
                          <span className="font-medium">Customer:</span> {transaction.customer?.custname || 'N/A'} ({transaction.custno})
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Employee:</span> {transaction.employee ? `${transaction.employee.firstname || ''} ${transaction.employee.lastname || ''}` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 text-left">Product Code</th>
                            <th className="border border-gray-300 p-2 text-left">Description</th>
                            <th className="border border-gray-300 p-2 text-left">Quantity</th>
                            <th className="border border-gray-300 p-2 text-left">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transaction.salesdetails?.length ? (
                            transaction.salesdetails.map((detail, detailIndex) => (
                              <tr key={`${transaction.transno}-${detail.prodcode}-${detailIndex}`}>
                                <td className="border border-gray-300 p-2">{detail.prodcode}</td>
                                <td className="border border-gray-300 p-2">{detail.product?.description || 'N/A'}</td>
                                <td className="border border-gray-300 p-2">{detail.quantity}</td>
                                <td className="border border-gray-300 p-2">{detail.product?.unit || 'N/A'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="border border-gray-300 p-2 text-center">No items in this transaction</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add a global print stylesheet */}
      <style>
        {`
        @media print {
          .print-container * {
            visibility: visible !important;
          }
          .print-transaction {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px !important;
          }
          table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }
          thead {
            display: table-header-group !important;
          }
          tbody {
            display: table-row-group !important;
          }
          tr {
            display: table-row !important;
            page-break-inside: avoid !important;
          }
          td, th {
            display: table-cell !important;
            border: 1px solid #ddd !important;
            padding: 8px !important;
            text-align: left !important;
          }
        }
        `}
      </style>
    </div>
  );
};

export default CustomerTransactionsReport;
