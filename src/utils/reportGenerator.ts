
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Generate PDF from a React component - more robust approach
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Create a clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply necessary styles to the clone for better rendering
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = '1200px'; // Fixed width for better quality
    clone.style.backgroundColor = '#ffffff';
    clone.style.zIndex = '-9999'; // Keep it invisible
    
    // Ensure all content is visible
    clone.style.overflow = 'visible';
    clone.style.height = 'auto';
    
    // Style all tables for better PDF output
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
      table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin-bottom: 15px;');
      
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.border = '1px solid #ddd';
        (cell as HTMLElement).style.padding = '8px';
        (cell as HTMLElement).style.textAlign = 'left';
      });
      
      // Style headers specifically
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        (header as HTMLElement).style.backgroundColor = '#f2f2f2';
        (header as HTMLElement).style.fontWeight = 'bold';
      });
    });
    
    // Ensure all images are loaded before rendering
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
    
    // Append clone to body temporarily
    document.body.appendChild(clone);
    
    // Wait for DOM and styling to be fully applied
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Capture the clone with html2canvas at high resolution
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 1200,
      height: clone.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        // Additional styling can be applied to the cloned document if needed
        clonedElement.style.display = 'block';
      }
    });
    
    // Remove the clone from DOM
    document.body.removeChild(clone);
    
    // Calculate PDF dimensions (A4)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm (slightly less than 297 to avoid overflow)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // If content fits on a single page
    if (imgHeight <= pageHeight) {
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight
      );
    } else {
      // For multi-page content, split it across pages
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 0;
      
      while (heightLeft > 0) {
        if (pageCount > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        
        heightLeft -= pageHeight;
        position -= pageHeight;
        pageCount++;
      }
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
