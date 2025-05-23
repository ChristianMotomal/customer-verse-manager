
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
    if (!reportRef.current || customers.length === 0) return;
    
    try {
      setIsPrinting(true);
      
      // Create the document in memory for PDF generation with jsPDF directly
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      
      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add title
      const title = 'Customer List Report';
      const dateText = `Generated on ${new Date().toLocaleDateString()}`;
      
      doc.setFontSize(16);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(dateText, doc.internal.pageSize.getWidth() / 2, 27, { align: 'center' });
      
      // Convert customers to table data format
      const tableData = customers.map(customer => [
        customer.custno,
        customer.custname || 'N/A',
        customer.address || 'N/A',
        customer.payterm || 'N/A'
      ]);
      
      // Add table to PDF using autotable plugin
      autoTable(doc, {
        head: [['Customer ID', 'Name', 'Address', 'Payment Terms']],
        body: tableData,
        startY: 35,
        headStyles: { fillColor: [242, 242, 242], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { 
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Customer ID
          1: { cellWidth: 40 }, // Name
          2: { cellWidth: 80 }, // Address
          3: { cellWidth: 30 }  // Payment Terms
        },
        margin: { top: 35 }
      });
      
      // Save the PDF
      doc.save(`customer-list-${getReportTimestamp()}.pdf`);
      
      toast({
        title: "Success",
        description: "Complete customer list PDF generated successfully",
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
          <div ref={reportRef} className="p-6 min-w-full">
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
