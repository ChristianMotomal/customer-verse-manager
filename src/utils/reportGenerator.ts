
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Generate PDF from a React component - revised approach
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Longer delay to ensure complete rendering
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Apply styles directly to the element before capturing
    const originalStyles = element.getAttribute('style') || '';
    element.style.backgroundColor = '#ffffff';
    element.style.padding = '20px';
    element.style.width = '100%';
    
    // Apply table styles
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '15px';
    });

    // Better html2canvas options for reliability
    const canvas = await html2canvas(element, {
      scale: 1.5, // Lower scale to prevent memory issues
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 15000, // Longer timeout
      removeContainer: false, // Don't remove the cloned container
    });
    
    // Create PDF with more reliable settings
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    
    try {
      // Add image with error handling
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95), // Use JPEG instead of PNG with 0.95 quality
        'JPEG', 
        0, 
        0, 
        imgWidth, 
        imgHeight
      );
      
      // Restore original styles
      element.setAttribute('style', originalStyles);
      
      // Save PDF
      pdf.save(`${filename}.pdf`);
    } catch (imageError) {
      console.error('Error adding image to PDF:', imageError);
      throw new Error('Failed to process report image');
    }
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
