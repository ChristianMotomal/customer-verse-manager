
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import { generatePdfFromElement, fetchCustomerListData, getReportTimestamp } from '@/utils/reportGenerator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

export type Customer = {
  custno: string;
  custname: string;
  address: string;
  payterm: string;
};

const CustomerListReport = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCustomerListData();
      setCustomers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const printReport = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsPrinting(true);
      
      // Ensure the report container has proper styles for PDF generation
      const reportContainer = reportRef.current;
      const originalWidth = reportContainer.style.width;
      
      // Set explicit width to ensure all content is captured
      reportContainer.style.width = '794px'; // A4 width in pixels
      
      // Give the browser a moment to adjust the layout
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await generatePdfFromElement(
        reportContainer, 
        `customer-list-${getReportTimestamp()}`
      );
      
      // Restore original styles
      reportContainer.style.width = originalWidth;
      
      toast({
        title: "Success",
        description: "Customer list PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
      console.error("PDF generation error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Customer List Report</h3>
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
            disabled={customers.length === 0 || isLoading || isPrinting}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? "Generating PDF..." : "Print to PDF"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div ref={reportRef} className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Customer List Report</h2>
              <p className="text-muted-foreground">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold p-2">Customer ID</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold p-2">Name</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold p-2">Address</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold p-2">Payment Terms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      {isLoading ? "Loading customer data..." : "No customers to display. Click 'Load Data' to fetch customers."}
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.custno} className="border-b">
                      <TableCell className="border border-gray-300 p-2">{customer.custno}</TableCell>
                      <TableCell className="border border-gray-300 p-2">{customer.custname || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 p-2">{customer.address || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 p-2">{customer.payterm || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerListReport;
