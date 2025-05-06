
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Generate PDF from a React component - completely revised for reliable PDF generation
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    console.log('Starting PDF generation process with direct content capture...');
    
    // Create a deep clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Set explicit dimensions and styling for the clone
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.width = '800px'; // Fixed width for consistency
    clone.style.backgroundColor = '#ffffff';
    clone.style.overflow = 'visible';
    clone.style.height = 'auto';
    
    // Apply print-specific styles
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      * { visibility: visible !important; display: block !important; }
      table { display: table !important; width: 100% !important; border-collapse: collapse !important; margin-bottom: 10px !important; }
      tr { display: table-row !important; page-break-inside: avoid !important; }
      td, th { display: table-cell !important; border: 1px solid #ddd !important; padding: 8px !important; text-align: left !important; }
      th { background-color: #f2f2f2 !important; font-weight: bold !important; }
      thead { display: table-header-group !important; }
      tbody { display: table-row-group !important; }
      h1, h2, h3, h4, h5, h6 { page-break-after: avoid !important; margin-bottom: 10px !important; }
      div { display: block !important; page-break-inside: avoid !important; }
      [id^="transaction-"] { margin-bottom: 20px !important; border: 1px solid #ddd !important; padding: 15px !important; page-break-inside: avoid !important; }
    `;
    clone.appendChild(printStyle);
    
    // Add to document to calculate sizes correctly
    document.body.appendChild(clone);
    
    // Wait for clone to render completely
    console.log('Waiting for clone to render...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false
    });
    
    // Get all transactions elements to process them individually
    const transactions = clone.querySelectorAll('[id^="transaction-"]');
    console.log(`Found ${transactions.length} transaction elements to process`);
    
    if (transactions.length === 0) {
      // If no transaction elements, capture the whole report
      console.log('No transactions found, capturing entire report');
      await captureElementToPdf(clone, pdf, 0);
    } else {
      // Process each transaction individually for better reliability
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i] as HTMLElement;
        console.log(`Processing transaction ${i+1}/${transactions.length}`);
        
        // Add a new page for each transaction except the first one
        if (i > 0) {
          pdf.addPage();
        }
        
        // Style and ensure visibility of each transaction
        transaction.style.position = 'relative';
        transaction.style.display = 'block';
        transaction.style.visibility = 'visible';
        transaction.style.backgroundColor = '#ffffff';
        transaction.style.padding = '15px';
        transaction.style.border = '1px solid #ddd';
        transaction.style.marginBottom = '20px';
        
        // Ensure all child elements are visible
        const allElements = transaction.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          if (el instanceof HTMLElement) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            
            // Special handling for table elements
            if (el.tagName.toLowerCase() === 'table') {
              el.style.display = 'table';
            } else if (el.tagName.toLowerCase() === 'tr') {
              el.style.display = 'table-row';
            } else if (el.tagName.toLowerCase() === 'td' || el.tagName.toLowerCase() === 'th') {
              el.style.display = 'table-cell';
            }
          }
        });
        
        // Wait for styling to be applied
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Capture this transaction to the PDF
        await captureElementToPdf(transaction, pdf, i);
      }
    }
    
    // Clean up - remove the clone
    document.body.removeChild(clone);
    
    // Save the PDF file
    console.log(`Saving PDF with filename: ${filename}.pdf`);
    pdf.save(`${filename}.pdf`);
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${String(error)}`);
  }
};

// Helper function to capture an element to PDF
const captureElementToPdf = async (
  element: HTMLElement,
  pdf: jsPDF,
  index: number
): Promise<void> => {
  try {
    console.log(`Capturing element to canvas (index: ${index})...`);
    
    // Use high quality settings for canvas capture
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff',
      onclone: (doc, clone) => {
        console.log('HTML2Canvas cloning document...');
        
        if (clone instanceof HTMLElement) {
          // Force display of all elements in clone
          clone.style.display = 'block';
          clone.style.visibility = 'visible';
          
          const allElements = clone.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            if (el instanceof HTMLElement) {
              // Special handling for table elements
              if (el.tagName.toLowerCase() === 'table') {
                el.style.display = 'table';
              } else if (el.tagName.toLowerCase() === 'tr') {
                el.style.display = 'table-row';
              } else if (el.tagName.toLowerCase() === 'td' || 
                         el.tagName.toLowerCase() === 'th') {
                el.style.display = 'table-cell';
              } else {
                el.style.display = 'block';
              }
              el.style.visibility = 'visible';
            }
          });
        }
      }
    });
    
    console.log(`Canvas generated: ${canvas.width}x${canvas.height}`);
    
    // Calculate dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // If not first element, add new page
    if (index > 0) {
      pdf.addPage();
    }
    
    // Add image to PDF with high quality setting
    console.log(`Adding image to PDF at index ${index}`);
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    
    console.log(`Element ${index} added to PDF successfully`);
  } catch (error) {
    console.error(`Error capturing element ${index}:`, error);
    throw error;
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
