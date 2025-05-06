
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
        }, 3000);
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
      }, 5000); // Even longer timeout to ensure all content renders
      
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
      
      // Insert additional delay before PDF generation to ensure complete rendering
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
        <CardContent className="p-6">
          {/* The report content that will be converted to PDF */}
          <div 
            ref={reportRef} 
            className="bg-white" 
            id="transaction-report"
            style={{ 
              width: "100%", 
              display: "block", 
              visibility: "visible"
            }}
          >
            {/* Report header with explicit styling for PDF generation */}
            <div className="text-center mb-6" style={{ display: "block", visibility: "visible" }}>
              <h2 className="text-2xl font-bold" style={{ display: "block", visibility: "visible" }}>Customer Transactions Report</h2>
              <p className="text-gray-600" style={{ display: "block", visibility: "visible" }}>
                {customerId ? `For Customer ID: ${customerId}` : 'All Customers'} - Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200" 
                   style={{ display: "block", visibility: "visible", minHeight: "400px" }}>
                {isLoading 
                  ? "Loading transaction data..." 
                  : "No transactions to display. Use the search options to fetch transactions."}
              </div>
            ) : (
              <div className="space-y-8" style={{ display: "block", visibility: "visible" }}>
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.transno} 
                    id={`transaction-${index}`}
                    className="mb-8 border border-gray-200 rounded-lg p-4 print-transaction"
                    style={{ 
                      marginBottom: "20px", 
                      border: "1px solid #ddd", 
                      padding: "15px", 
                      borderRadius: "4px",
                      pageBreakInside: "avoid", 
                      display: "block", 
                      visibility: "visible",
                      backgroundColor: "#ffffff"
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4" style={{ display: "grid", visibility: "visible" }}>
                      <div style={{ display: "block", visibility: "visible" }}>
                        <p className="mb-1" style={{ display: "block", visibility: "visible", marginBottom: "4px" }}>
                          <span className="font-medium" style={{ fontWeight: "500", display: "inline", visibility: "visible" }}>Transaction #:</span> 
                          <span style={{ display: "inline", visibility: "visible" }}>{transaction.transno}</span>
                        </p>
                        <p className="mb-1" style={{ display: "block", visibility: "visible", marginBottom: "4px" }}>
                          <span className="font-medium" style={{ fontWeight: "500", display: "inline", visibility: "visible" }}>Date:</span> 
                          <span style={{ display: "inline", visibility: "visible" }}>{formatReportDate(transaction.salesdate)}</span>
                        </p>
                      </div>
                      <div style={{ display: "block", visibility: "visible" }}>
                        <p className="mb-1" style={{ display: "block", visibility: "visible", marginBottom: "4px" }}>
                          <span className="font-medium" style={{ fontWeight: "500", display: "inline", visibility: "visible" }}>Customer:</span> 
                          <span style={{ display: "inline", visibility: "visible" }}>{transaction.customer?.custname || 'N/A'} ({transaction.custno})</span>
                        </p>
                        <p className="mb-1" style={{ display: "block", visibility: "visible", marginBottom: "4px" }}>
                          <span className="font-medium" style={{ fontWeight: "500", display: "inline", visibility: "visible" }}>Employee:</span> 
                          <span style={{ display: "inline", visibility: "visible" }}>
                            {transaction.employee ? `${transaction.employee.firstname || ''} ${transaction.employee.lastname || ''}` : 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <h4 className="font-medium mb-2" style={{ display: "block", visibility: "visible", marginBottom: "8px", fontWeight: "500" }}>Items:</h4>
                    <div style={{ display: "block", visibility: "visible", overflow: "visible" }}>
                      <table className="w-full border-collapse" style={{ 
                        display: "table", 
                        visibility: "visible", 
                        width: "100%", 
                        borderCollapse: "collapse",
                        border: "1px solid #ddd",
                        marginBottom: "10px"
                      }}>
                        <thead style={{ display: "table-header-group", visibility: "visible" }}>
                          <tr style={{ display: "table-row", visibility: "visible" }}>
                            <th style={{ 
                              display: "table-cell", 
                              visibility: "visible",
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "left",
                              backgroundColor: "#f2f2f2",
                              fontWeight: "bold"
                            }}>Product Code</th>
                            <th style={{ 
                              display: "table-cell", 
                              visibility: "visible",
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "left",
                              backgroundColor: "#f2f2f2",
                              fontWeight: "bold"
                            }}>Description</th>
                            <th style={{ 
                              display: "table-cell", 
                              visibility: "visible",
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "left",
                              backgroundColor: "#f2f2f2",
                              fontWeight: "bold"
                            }}>Quantity</th>
                            <th style={{ 
                              display: "table-cell", 
                              visibility: "visible",
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "left",
                              backgroundColor: "#f2f2f2",
                              fontWeight: "bold"
                            }}>Unit</th>
                          </tr>
                        </thead>
                        <tbody style={{ display: "table-row-group", visibility: "visible" }}>
                          {transaction.salesdetails?.length ? (
                            transaction.salesdetails.map((detail, detailIndex) => (
                              <tr key={`${transaction.transno}-${detail.prodcode}-${detailIndex}`} 
                                  style={{ display: "table-row", visibility: "visible" }}>
                                <td style={{ 
                                  display: "table-cell", 
                                  visibility: "visible",
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  textAlign: "left"
                                }}>{detail.prodcode}</td>
                                <td style={{ 
                                  display: "table-cell", 
                                  visibility: "visible",
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  textAlign: "left"
                                }}>{detail.product?.description || 'N/A'}</td>
                                <td style={{ 
                                  display: "table-cell", 
                                  visibility: "visible",
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  textAlign: "left"
                                }}>{detail.quantity}</td>
                                <td style={{ 
                                  display: "table-cell", 
                                  visibility: "visible",
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                  textAlign: "left"
                                }}>{detail.product?.unit || 'N/A'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr style={{ display: "table-row", visibility: "visible" }}>
                              <td colSpan={4} 
                                  style={{ 
                                    display: "table-cell", 
                                    visibility: "visible",
                                    border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "center" 
                                  }}>No items in this transaction</td>
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
    </div>
  );
};

export default CustomerTransactionsReport;
