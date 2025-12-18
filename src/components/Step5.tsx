import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import styles from './Step5.module.css';

type InvoiceRow = {
  id: string;
  description: string;
  unit: string;
  price: string;
};

interface InvoiceData {
  invoiceNumber: string;
  paymentMethod: string;
  paymentNumber: string;
  notes?: string;
  rows: InvoiceRow[];
}

interface Page5Props {
  isPDF?: boolean;
  currentInvoicePage?: number;
  invoiceData?: InvoiceData;
  updateInvoiceData?: (data: InvoiceData) => void;
}

const Page5: FunctionComponent<Page5Props> = ({ 
  isPDF = false, 
  currentInvoicePage = 1,
  invoiceData = {
    invoiceNumber: '',
    paymentMethod: '',
    paymentNumber: '',
    notes: '',
    rows: []
  },
  updateInvoiceData
}) => {
  const [localData, setLocalData] = useState<InvoiceData>(invoiceData);
  const tableRef = useRef<HTMLDivElement>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalData(invoiceData);
  }, [invoiceData]);
  
  // Smart pagination
  const calculateSmartPagination = () => {
    if (localData.rows.length === 0) return { totalPages: 1, currentPageRows: [] };
    const ROWS_PER_PAGE = 7;
    const actualCurrentPage = currentInvoicePage || 1;
    const startIndex = (actualCurrentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentPageRows = localData.rows.slice(startIndex, endIndex);
    const totalPages = Math.ceil(localData.rows.length / ROWS_PER_PAGE);
    return { totalPages, currentPageRows };
  };
  
  const { totalPages, currentPageRows } = calculateSmartPagination();

  // Calculate dynamic Total column width based on maximum total value
  const calculateTotalColumnWidth = () => {
    const minWidth = 60; // Minimum width for small numbers
    const charWidth = 8; // Approximate width per character (including decimal point)
    const padding = 16; // Total padding (8px on each side)
    
    // Find the maximum total value
    let maxTotal = 0;
    localData.rows.forEach(row => {
      const unitPrice = parseFloat(row.unit) || 0;
      const price = parseFloat(row.price) || 0;
      const total = unitPrice * price;
      if (total > maxTotal) maxTotal = total;
    });
    
    // Calculate grand total
    const grandTotal = localData.rows.reduce((sum, row) => {
      const unitPrice = parseFloat(row.unit) || 0;
      const price = parseFloat(row.price) || 0;
      return sum + (unitPrice * price);
    }, 0);
    
    // Use the larger of max row total or grand total
    const largestValue = Math.max(maxTotal, grandTotal);
    
    // Format the number and calculate width needed
    const formattedValue = largestValue.toFixed(2);
    const valueWidth = formattedValue.length * charWidth + padding;
    
    // Return the larger of calculated width or minimum width
    return Math.max(valueWidth, minWidth);
  };
  
  const totalColumnWidth = calculateTotalColumnWidth();
  const priceColumnWidth = Math.max(60, Math.ceil(totalColumnWidth / 2)); // Price column is half of total column width

  // Calculate table height dynamically
  const calculateTableHeight = () => {
    const HEADER_HEIGHT = 20; // Header row height
    const TOTAL_ROW_HEIGHT = 20; // Total row height (if shown)
    
    // Calculate height for each row based on content
    const calculateRowHeight = (row: InvoiceRow) => {
      const baseHeight = isPDF ? 14 : 14;
      const calculateRowsNeeded = (text: string, baseLength: number = 50) => {
        const lines = text.split('\n').length;
        const wordCount = text.split(' ').length;
        const charCount = text.length;
        
        let rowsNeeded = 1;
        if (lines > 1) {
          rowsNeeded = Math.max(rowsNeeded, lines);
        }
        const charRows = Math.ceil(charCount / baseLength);
        rowsNeeded = Math.max(rowsNeeded, charRows);
        const wordRows = Math.ceil(wordCount / 8);
        rowsNeeded = Math.max(rowsNeeded, wordRows);
        return Math.min(rowsNeeded, 4);
      };
      
      const descriptionRows = calculateRowsNeeded(row.description);
      const maxRows = descriptionRows;
      return isPDF ? (20 * maxRows) : (20 * maxRows);
    };
    
    // Sum up all row heights
    let totalRowHeight = 0;
    currentPageRows.forEach(row => {
      totalRowHeight += calculateRowHeight(row);
    });
    
    // Add total row height if on last page
    const totalRowHeightToAdd = (currentInvoicePage === totalPages && currentPageRows.length > 0) ? TOTAL_ROW_HEIGHT : 0;
    
    return HEADER_HEIGHT + totalRowHeight + totalRowHeightToAdd;
  };

  const tableHeight = calculateTableHeight();
  const TABLE_TOP = 180; // Table starts at 180px
  const tableBottom = TABLE_TOP + tableHeight;
  
  // Position notes directly below the table with a gap
  // Notes will move dynamically as rows are added/removed
  const GAP_AFTER_TABLE = 20; // 20px gap after table
  const notesTop = tableBottom + GAP_AFTER_TABLE;

  return (
    <div className={styles.page}>
      <div className={styles.overlapWrapper}>
        <div className={styles.overlap}>
          
          {/* Header */}
          <div className={styles.title}>
            <div className={styles.overlapGroup}>
              <div 
                className={styles.textWrapper2}
                style={{ top: isPDF ? '4px' : '8px' }}
              >
                Today's Invoice
              </div>
            </div>
            <img className={styles.logo} alt="Logo" src="/logo.webp" />
          </div>

          {/* Invoice Number */}
          <div className={styles.invoiceId}>
            Invoice: {localData.invoiceNumber || ''}
          </div>

          {/* Table Header */}
          <div style={{ 
            position: 'absolute', 
            top: '180px', 
            left: '29px', 
            right: '29px',    
            fontSize: '12px',
            fontFamily: 'Inter, Arial, sans-serif'
          }}>
            <div 
              ref={tableRef}
              style={{ 
                display: 'grid',
                gridTemplateColumns: `3fr 50px ${priceColumnWidth}px ${totalColumnWidth}px`,
                gap: '0px',
                backgroundColor:'#722420 ',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              {/* Header Row */}
              <div style={{ display: 'contents' }}>
                <div style={{
                  // margin: i .sPDF ? '8px 8px' : '8px 8px',
                  backgroundColor: '#722420',
                  color: 'white',
                  fontWeight: 'bold',
                  minHeight: isPDF ? '20px' : '20px',
                  padding: isPDF ? '0px 8px' : '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    height: '20px',
                    boxSizing: 'border-box',
                    lineHeight: '1.0'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  fontSize: '12px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }}>Description</div>
                <div style={{
                  // margin: isPDF ? '8px 8px' : '8px 8px',
                  backgroundColor: '#722420',
                  color: 'white',
                  fontWeight: 'bold',
                  minHeight: isPDF ? '20px' : '20px',
                  padding: isPDF ? '0px 8px' : '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    height: '20px',
                    boxSizing: 'border-box',
                    lineHeight: '1.0'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  fontSize: '12px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }}>Unit</div>
                <div style={{
                  // margin: isPDF ? '8px 8px' : '8px 8px',
                  backgroundColor: '#722420',
                  color: 'white',
                  fontWeight: 'bold',
                  minHeight: isPDF ? '20px' : '20px',
                  padding: isPDF ? '0px 8px' : '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    height: '20px',
                    boxSizing: 'border-box',
                    lineHeight: '1.0'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  fontSize: '12px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }}>Price</div>
                <div style={{
                  // margin: isPDF ? '8px 8px' : '8px 8px',
                  backgroundColor: '#722420',
                  color: 'white',
                  fontWeight: 'bold',
                  minHeight: isPDF ? '20px' : '20px',
                  padding: isPDF ? '0px 8px' : '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    height: '20px',
                    boxSizing: 'border-box',
                    lineHeight: '1.0'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  fontSize: '12px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }}>Total</div>
              </div>

              {/* Data Rows */}
              {currentPageRows.map((row, index) => {
                const unitPrice = parseFloat(row.unit) || 0;
                const price = parseFloat(row.price) || 0;
                const total = unitPrice * price;
                
                // Calculate how many rows are needed based on content length
                const calculateRowsNeeded = (text: string, baseLength: number = 50) => {
                  const lines = text.split('\n').length;
                  const wordCount = text.split(' ').length;
                  const charCount = text.length;
                  
                  // Calculate rows needed based on multiple factors
                  let rowsNeeded = 1;
                  
                  // Factor in line breaks
                  if (lines > 1) {
                    rowsNeeded = Math.max(rowsNeeded, lines);
                  }
                  
                  // Factor in character count (roughly 50 chars per row)
                  const charRows = Math.ceil(charCount / baseLength);
                  rowsNeeded = Math.max(rowsNeeded, charRows);
                  
                  // Factor in word count (roughly 8 words per row)
                  const wordRows = Math.ceil(wordCount / 8);
                  rowsNeeded = Math.max(rowsNeeded, wordRows);
                  
                  return Math.min(rowsNeeded, 4); // Cap at 4 rows maximum
                };
                
                const descriptionRows = calculateRowsNeeded(row.description);
                const unitRows = calculateRowsNeeded(row.unit, 10);
                const priceRows = calculateRowsNeeded(row.price, 10);
                
                const maxRowsNeeded = Math.max(descriptionRows, unitRows, priceRows);
                const isLongContent = maxRowsNeeded > 1;
                const rowSpan = maxRowsNeeded;
                
                // Calculate proper height for PDF rendering to prevent overlaps
                const baseRowHeight = isPDF ? 14 : 14; // Increased base height for PDF
                const calculatedHeight = baseRowHeight * rowSpan;
                
                // Special height calculation for description column (taller for better text display)
                const descriptionHeight = isPDF ? (20 * rowSpan) : (20 * rowSpan);

                return (
                  <div key={row.id} style={{ display: 'contents' }}>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: 'normal',
                      minHeight: `${descriptionHeight}px`,
                      padding: isPDF ? '0px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'top',
                        textAlign: 'left',
                        lineHeight: '1.0',
                        rowSpan: rowSpan,
                        height: `${descriptionHeight}px`,
                        boxSizing: 'border-box',
                        paddingTop: '2px'
                      } : {
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'left',
                        textAlign: 'left',
                        paddingTop: '2px'
                      }),
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      hyphens: 'auto',
                      wordBreak: 'normal'
                    }}>
                      {row.description}
                    </div>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: 'normal',
                      minHeight: `${descriptionHeight}px`,
                      padding: isPDF ? '0px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        height: `${descriptionHeight}px`,
                        lineHeight: '1.0',
                        boxSizing: 'border-box',
                        paddingTop: '2px',
                        rowSpan: rowSpan
                      } : {
                        display:  'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }),
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      hyphens: 'auto',
                      wordBreak: 'normal'
                    }}>
                      {row.unit}
                    </div>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: 'normal',
                      minHeight: `${calculatedHeight}px`,
                      padding: isPDF ? '8px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        lineHeight: '1.0',
                        height: `${descriptionHeight}px`,
                        boxSizing: 'border-box',
                        paddingTop: '2px',
                        rowSpan: rowSpan
                      } : {
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }),
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      hyphens: 'auto',
                      wordBreak: 'normal'
                    }}>
                      {row.price}
                    </div>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: '600',
                      minHeight: `${calculatedHeight}px`,
                      padding: isPDF ? '8px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        lineHeight: '1.0',
                        height: `${descriptionHeight}px`,
                        boxSizing: 'border-box',
                        paddingTop: '2px',
                        rowSpan: rowSpan
                      } : {
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }),
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      hyphens: 'auto',
                      wordBreak: 'normal'
                    }}>
                      {total.toFixed(2)}
                    </div>
                    {/* Add empty rows for merged cells */}
                    {isLongContent && Array.from({ length: rowSpan - 1 }, (_, i) => (
                      <div key={`empty-${i}`} style={{ display: 'contents' }}>
                        <div style={{ display: 'none' }}></div>
                        <div style={{ display: 'none' }}></div>
                        <div style={{ display: 'none' }}></div>
                        <div style={{ display: 'none' }}></div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Total Row (only on last page) */}
              {currentPageRows.length > 0 && currentInvoicePage === totalPages && (
                <div style={{ display: 'contents' }}>
                  <div style={{
                    backgroundColor: '#722420',
                    color: 'white',
                    fontWeight: 'bold',
                    minHeight: isPDF ? '20px' : '20px',
                    padding: '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      height: `${20}px`,
                      boxSizing: 'border-box',
                      paddingTop: '2px',
                    } : {
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }),
                    fontSize: '12px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}></div>
                  <div style={{
                    backgroundColor: '#722420',
                    color: 'white',
                    fontWeight: 'bold',
                      minHeight: isPDF ? '20px' : '20px',
                    padding: '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      height: `${20}px`,
                      boxSizing: 'border-box',
                      paddingTop: '2px',
                    } : {}),
                  }}></div>
                  <div style={{
                    backgroundColor: '#722420',
                    color: 'white',
                    fontWeight: 'bold',
                    minHeight: isPDF ? '20px' : '20px',
                    padding: isPDF ? '0px 8px' : '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      height: '20px',
                      boxSizing: 'border-box',
                      lineHeight: '1.0'
                    } : {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }),
                    fontSize: '12px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}>
                    TOTAL:
                  </div>
                  <div style={{
                    backgroundColor: '#722420',
                    color: 'white',
                    fontWeight: 'bold',
                    minHeight: isPDF ? '20px' : '20px',
                    padding: isPDF ? '0px 8px' : '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      height: '20px',
                      boxSizing: 'border-box',
                      lineHeight: '1.0'
                    } : {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }),
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}>
                    ${localData.rows.reduce((sum, row) => {
                      const unitPrice = parseFloat(row.unit) || 0;
                      const price = parseFloat(row.price) || 0;
                      return sum + (unitPrice * price);
                    }, 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className={styles.paymentMethod}>
            Payment Method: {localData.paymentMethod || ''}
            {localData.paymentNumber && ` - ${localData.paymentNumber}`}
          </div>

          {/* Notes Section - Positioned dynamically below table */}
          {localData.notes && (
            <div style={{
              position: 'absolute',
              top: `${notesTop}px`,
              left: '29px',
              right: '29px',
              fontSize: '12px',
              fontFamily: 'Inter, Arial, sans-serif',
              color: '#000000',
              lineHeight: '1.4'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#722420' }}>
                Notes:
              </div>
              <div style={{ paddingLeft: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {localData.notes}
              </div>
            </div>
          )}

          {/* Frame */}
          <div className={styles.frame}>
            <div className={styles.rectangle} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page5;
