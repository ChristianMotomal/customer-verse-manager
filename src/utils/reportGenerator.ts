import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Generate PDF from a React component - enhanced for complex reports
export const generatePdfFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    console.log('Starting PDF generation process...');
    
    // Create a clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply enhanced styling to the clone for better rendering
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = '1000px'; // Fixed width for better quality
    clone.style.backgroundColor = '#ffffff';
    clone.style.zIndex = '-9999'; // Keep it invisible
    
    // Ensure all content is visible
    clone.style.overflow = 'visible';
    clone.style.height = 'auto';
    clone.style.display = 'block'; // Force display to ensure visibility
    
    // Enhanced table styling for PDF
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
      table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin-bottom: 15px; display: table !important;');
      
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.border = '1px solid #ddd';
        (cell as HTMLElement).style.padding = '8px';
        (cell as HTMLElement).style.textAlign = 'left';
        (cell as HTMLElement).style.visibility = 'visible';
        (cell as HTMLElement).style.display = 'table-cell';
      });
      
      // Style headers specifically
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        (header as HTMLElement).style.backgroundColor = '#f2f2f2';
        (header as HTMLElement).style.fontWeight = 'bold';
      });
      
      // Style rows
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        (row as HTMLElement).style.display = 'table-row';
      });
      
      // Style table headers and bodies
      const theads = table.querySelectorAll('thead');
      theads.forEach(thead => {
        (thead as HTMLElement).style.display = 'table-header-group';
      });
      
      const tbodies = table.querySelectorAll('tbody');
      tbodies.forEach(tbody => {
        (tbody as HTMLElement).style.display = 'table-row-group';
      });
    });

    // Force transaction cards to be visible with proper styling
    const transactionCards = clone.querySelectorAll('[id^="transaction-"]');
    transactionCards.forEach((card, index) => {
      console.log(`Styling transaction card ${index}`);
      (card as HTMLElement).style.pageBreakInside = 'avoid';
      (card as HTMLElement).style.marginBottom = '20px';
      (card as HTMLElement).style.border = '1px solid #ddd';
      (card as HTMLElement).style.padding = '15px';
      (card as HTMLElement).style.borderRadius = '4px';
      (card as HTMLElement).style.display = 'block';
      (card as HTMLElement).style.visibility = 'visible';
      
      // Make sure all child elements in cards are visible
      const cardChildren = card.querySelectorAll('*');
      cardChildren.forEach(child => {
        if (child instanceof HTMLElement) {
          child.style.visibility = 'visible';
          if (child.tagName.toLowerCase() === 'table') {
            child.style.display = 'table';
          } else if (child.tagName.toLowerCase() === 'tr') {
            child.style.display = 'table-row';
          } else if (child.tagName.toLowerCase() === 'td' || child.tagName.toLowerCase() === 'th') {
            child.style.display = 'table-cell';
          } else {
            child.style.display = 'block';
          }
        }
      });
    });
    
    // Ensure all divs are properly displayed
    const contentDivs = clone.querySelectorAll('div');
    contentDivs.forEach(div => {
      (div as HTMLElement).style.display = 'block';
      (div as HTMLElement).style.visibility = 'visible';
    });
    
    // Handle heading styles
    const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      (heading as HTMLElement).style.display = 'block';
      (heading as HTMLElement).style.visibility = 'visible';
      (heading as HTMLElement).style.marginBottom = '10px';
      (heading as HTMLElement).style.pageBreakAfter = 'avoid';
    });
    
    // Wait for all images to load
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        console.log(`Processing image: ${img.src}`);
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          // Set a timeout just in case
          setTimeout(resolve, 2000);
        });
      })
    );
    
    // Append clone to body temporarily but make it much more visible for debugging
    document.body.appendChild(clone);
    console.log('Clone appended to document body');
    
    // Extremely increased waiting time for DOM and styling to be fully applied
    console.log('Waiting for rendering...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Proceeding with canvas capture...');
    
    // Use higher scale and robust options for html2canvas
    const canvas = await html2canvas(clone, {
      scale: 3, // Even higher scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff',
      width: 1000,
      height: clone.scrollHeight,
      windowWidth: 1000,
      windowHeight: clone.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        console.log('HTML2Canvas cloning document...');
        // Apply additional styling to ensure visibility in the canvas
        clonedElement.style.display = 'block';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        
        // Force all elements to be visible in the clone
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach((el: any) => {
          if (el.style) {
            if (el.tagName.toLowerCase() === 'table') {
              el.style.display = 'table';
            } else if (el.tagName.toLowerCase() === 'tr') {
              el.style.display = 'table-row';
            } else if (el.tagName.toLowerCase() === 'td' || el.tagName.toLowerCase() === 'th') {
              el.style.display = 'table-cell';
            } else {
              el.style.display = 'block';
            }
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          }
        });
      }
    });
    
    console.log('Canvas generated with dimensions:', canvas.width, 'x', canvas.height);
    
    // Add a delay before PDF generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up - remove the clone
    document.body.removeChild(clone);
    
    // Calculate PDF dimensions (A4)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm (slightly less than 297 to avoid overflow)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    console.log('PDF dimensions:', imgWidth, 'x', imgHeight);
    
    // Create PDF with better settings for complex content
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false
    });
    
    let heightLeft = imgHeight;
    let position = 0;
    let pageCount = 0;
    
    // Use multi-page approach for all PDFs
    while (heightLeft > 0) {
      if (pageCount > 0) {
        pdf.addPage();
      }
      
      console.log(`Adding page ${pageCount + 1}, position: ${position}, heightLeft: ${heightLeft}`);
      
      // Use higher quality image
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      
      heightLeft -= pageHeight;
      position -= pageHeight;
      pageCount++;
    }
    
    console.log(`PDF generated with ${pageCount} pages`);
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${String(error)}`);
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
