
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Generate PDF from a React component - more robust approach
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Ensure element rendering is complete with longer delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clone the element to avoid modifying the displayed one
    const clone = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    
    // Apply proper styling to ensure content is visible in PDF
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '1000px';  // Fixed width for better rendering
    clone.style.height = 'auto';
    clone.style.backgroundColor = '#ffffff';
    clone.style.padding = '20px';
    clone.style.margin = '0';
    clone.style.overflow = 'visible';
    
    // Style all tables and content for better PDF output
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
      table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin-bottom: 15px;');
      
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.border = '1px solid #ddd';
        (cell as HTMLElement).style.padding = '8px';
      });
    });

    // Force any images to load completely
    const images = clone.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));
    }

    // Wait again for all styling to apply
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Improved html2canvas settings for reliability
    const canvas = await html2canvas(clone, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        const el = clonedDoc.querySelector('#transaction-report') as HTMLElement;
        if (el) {
          el.style.height = 'auto';
          el.style.overflow = 'visible';
        }
      }
    });

    // Remove the clone from the document
    document.body.removeChild(clone);
    
    // Create PDF with proper dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add image to PDF with better quality
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      0,
      0,
      imgWidth,
      imgHeight
    );
    
    // Save PDF
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
