
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Completely redesigned PDF generator with direct HTML-to-PDF approach
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    console.log('Starting PDF generation with improved HTML capture...');
    
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Deep clone the element to avoid modifying the original
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
    tempContainer.style.backgroundColor = '#ffffff';
    document.body.appendChild(tempContainer);
    
    // Apply required styles globally to ensure content is visible in PDF
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      * { box-sizing: border-box !important; }
      table { display: table !important; width: 100% !important; margin-bottom: 10px !important; border-collapse: collapse !important; }
      thead { display: table-header-group !important; }
      tbody { display: table-row-group !important; }
      tr { display: table-row !important; page-break-inside: avoid !important; }
      th, td { display: table-cell !important; border: 1px solid #ddd !important; padding: 8px !important; text-align: left !important; }
      th { background-color: #f2f2f2 !important; font-weight: bold !important; }
      .transaction-item { margin-bottom: 20px !important; page-break-inside: avoid !important; border: 1px solid #ddd !important; padding: 15px !important; background-color: #fff !important; }
      h1, h2, h3, h4 { margin-bottom: 10px !important; page-break-after: avoid !important; }
    `;
    tempContainer.appendChild(printStyle);
    
    // Get transactions from the element
    const transactions = Array.from(element.querySelectorAll('[id^="transaction-"]'));
    console.log(`Found ${transactions.length} transactions to process`);
    
    // If no transactions, process the entire report
    if (transactions.length === 0) {
      tempContainer.innerHTML = element.innerHTML;
      await processPageToPdf(tempContainer, pdf, 0, true);
    } else {
      // Prepare report header only once
      const reportHeader = element.querySelector('.text-center.mb-6');
      if (reportHeader) {
        const headerClone = reportHeader.cloneNode(true) as HTMLElement;
        
        // Process each transaction as a separate page
        for (let i = 0; i < transactions.length; i++) {
          console.log(`Processing transaction ${i + 1}/${transactions.length}`);
          
          // Clear container
          tempContainer.innerHTML = '';
          
          // Add header to each page
          tempContainer.appendChild(headerClone.cloneNode(true));
          
          // Add a spacer
          const spacer = document.createElement('div');
          spacer.style.height = '20px';
          tempContainer.appendChild(spacer);
          
          // Add this transaction with enhanced styling
          const transaction = transactions[i].cloneNode(true) as HTMLElement;
          transaction.style.pageBreakInside = 'avoid';
          transaction.style.border = '1px solid #ddd';
          transaction.style.padding = '15px';
          transaction.style.marginBottom = '20px';
          transaction.style.backgroundColor = '#ffffff';
          transaction.className = 'transaction-item';
          
          // Ensure all table elements have proper display properties
          const tables = transaction.querySelectorAll('table');
          tables.forEach(table => {
            if (table instanceof HTMLElement) {
              table.style.display = 'table';
              table.style.width = '100%';
              table.style.borderCollapse = 'collapse';
              table.style.marginBottom = '10px';
              
              const rows = table.querySelectorAll('tr');
              rows.forEach(row => {
                if (row instanceof HTMLElement) {
                  row.style.display = 'table-row';
                  
                  const cells = row.querySelectorAll('th, td');
                  cells.forEach(cell => {
                    if (cell instanceof HTMLElement) {
                      cell.style.display = 'table-cell';
                      cell.style.border = '1px solid #ddd';
                      cell.style.padding = '8px';
                      cell.style.textAlign = 'left';
                    }
                  });
                }
              });
            }
          });
          
          tempContainer.appendChild(transaction);
          
          // Add to PDF (add new page if not the first transaction)
          await processPageToPdf(tempContainer, pdf, i, i === 0);
        }
      }
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    console.log('PDF saved successfully');
    
    // Clean up
    document.body.removeChild(tempContainer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${String(error)}`);
  }
};

// Process a single page/element to PDF
async function processPageToPdf(
  element: HTMLElement,
  pdf: jsPDF,
  pageIndex: number,
  isFirstPage: boolean
): Promise<void> {
  try {
    // Wait to ensure any rendering/styling is complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Capture element as image with high quality settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      onclone: (doc, clone) => {
        console.log('Cloning document for canvas rendering');
        if (clone instanceof HTMLElement) {
          // Make sure every element is visible
          const allElements = clone.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = computeProperDisplay(el);
              el.style.visibility = 'visible';
            }
          });
        }
      }
    });
    
    console.log(`Canvas generated with dimensions: ${canvas.width} x ${canvas.height}`);
    
    // Calculate dimensions (A4 page)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add new page if not the first one
    if (!isFirstPage) {
      pdf.addPage();
    }
    
    // Add image to PDF
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
    
    console.log(`Page ${pageIndex + 1} processed successfully`);
    
  } catch (error) {
    console.error(`Error processing page ${pageIndex}:`, error);
    throw error;
  }
}

// Helper function to compute the proper display value for an element
function computeProperDisplay(el: HTMLElement): string {
  const tagName = el.tagName.toLowerCase();
  
  // Special handling for table elements
  if (tagName === 'table') return 'table';
  if (tagName === 'thead') return 'table-header-group';
  if (tagName === 'tbody') return 'table-row-group';
  if (tagName === 'tr') return 'table-row';
  if (tagName === 'td' || tagName === 'th') return 'table-cell';
  
  // Default to block for most elements
  return 'block';
}

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
