
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Improved PDF generator with optimized processing
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    console.log('Starting PDF generation with optimized HTML capture...');
    
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
    const transactionCount = transactions.length;
    console.log(`Found ${transactionCount} transactions to process`);
    
    // Optimize processing for large reports - calculate transactions per batch
    const BATCH_SIZE = transactionCount > 50 ? 10 : (transactionCount > 20 ? 5 : 3);
    const batches = Math.ceil(transactionCount / BATCH_SIZE);
    console.log(`Will process in ${batches} batches, ${BATCH_SIZE} transactions per batch`);
    
    // If no transactions, process the entire report
    if (transactionCount === 0) {
      tempContainer.innerHTML = element.innerHTML;
      await processPageToPdf(tempContainer, pdf, 0, true);
    } else {
      // Prepare report header only once
      const reportHeader = element.querySelector('.text-center.mb-6');
      
      if (reportHeader) {
        const headerClone = reportHeader.cloneNode(true) as HTMLElement;
        
        // Process transactions in batches for better memory management
        for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
          const startIdx = batchIndex * BATCH_SIZE;
          const endIdx = Math.min(startIdx + BATCH_SIZE, transactionCount);
          
          console.log(`Processing batch ${batchIndex + 1}/${batches}, transactions ${startIdx + 1}-${endIdx}/${transactionCount}`);
          
          // Clear container for this batch
          tempContainer.innerHTML = '';
          
          // Add header
          tempContainer.appendChild(headerClone.cloneNode(true));
          
          // Add spacer
          const spacer = document.createElement('div');
          spacer.style.height = '20px';
          tempContainer.appendChild(spacer);
          
          // Add transactions for this batch
          for (let i = startIdx; i < endIdx; i++) {
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
            
            // Add page separator if not the last transaction in batch
            if (i < endIdx - 1) {
              const separator = document.createElement('div');
              separator.style.height = '20px';
              tempContainer.appendChild(separator);
            }
          }
          
          // Add batch to PDF (only add a new page if not the first batch)
          await processPageToPdf(tempContainer, pdf, batchIndex, batchIndex === 0);
          
          // Free up memory after each batch
          await new Promise(resolve => setTimeout(resolve, 100));
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
    // Brief pause to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Capture element as image with balanced quality/performance settings
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reduced scale for better performance while maintaining quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // Reduce console noise
      onclone: (doc, clone) => {
        console.log(`Preparing page ${pageIndex + 1} for rendering`);
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
    
    // Add image to PDF with FAST compression for better performance
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.8), // Slightly reduced quality for performance
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
