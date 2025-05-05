import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Generate PDF from a React component - more robust approach
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Create a clone of the element
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply necessary styles to the clone
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = '1200px'; // Increased width for better quality
    clone.style.backgroundColor = '#ffffff';
    clone.style.zIndex = '-9999'; // Keep it invisible
    clone.style.transform = 'scale(1)'; // Ensure no scaling issues
    
    // Style all tables for better PDF output
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
      table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin-bottom: 15px;');
      
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.border = '1px solid #ddd';
        (cell as HTMLElement).style.padding = '8px';
      });
    });
    
    // Append clone to body
    document.body.appendChild(clone);
    
    // Wait for DOM to update
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Capture the clone with html2canvas
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      windowHeight: clone.scrollHeight
    });
    
    // Remove the clone from DOM
    document.body.removeChild(clone);
    
    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    let firstPage = true;
    
    // Add image to PDF with potentially multiple pages if needed
    while (heightLeft > 0) {
      // Add new page if not the first page
      if (!firstPage) {
        pdf.addPage();
      } else {
        firstPage = false;
      }
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      
      // Update remaining height and position
      heightLeft -= pageHeight;
      position -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Fetch customer list data for report
export const fetchCustomerListData = async () => {
  try {
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .order('custno', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customer list:', error);
    throw error;
  }
};

// Fetch customer transactions for report
export const fetchCustomerTransactionsData = async (customerId?: string) => {
  try {
    let query = supabase
      .from('sales')
      .select(`
        transno,
        salesdate,
        custno,
        customer:customer(custname),
        empno,
        employee:employee(firstname, lastname),
        salesdetails:salesdetail(quantity, prodcode, product:product(description, unit))
      `)
      .order('salesdate', { ascending: false });
      
    if (customerId) {
      query = query.eq('custno', customerId);
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customer transactions:', error);
    throw error;
  }
};

// Format date for reports
export const formatReportDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Generate a timestamp for report filenames
export const getReportTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
};
