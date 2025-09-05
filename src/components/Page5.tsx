import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import styles from './Page5.module.css';

interface Page5Props {
  isPDF?: boolean;
  currentInvoicePage?: number;
  invoiceData?: {
    invoiceNumber: string;
    paymentMethod: string;
    paymentNumber: string;
    rows: Array<{
      id: string;
      description: string;
      unit: string;
      price: string;
    }>;
  };
  updateInvoiceData?: (data: any) => void;
}

const Page5: FunctionComponent<Page5Props> = ({ 
  isPDF = false, 
  currentInvoicePage = 1,
  invoiceData = {
    invoiceNumber: '',
    paymentMethod: '',
    paymentNumber: '',
    rows: []
  },
  updateInvoiceData
}) => {
  const [localData, setLocalData] = useState(invoiceData);
  const tableRef = useRef<HTMLDivElement>(null);
  const [actualRowHeight, setActualRowHeight] = useState(50);
  const [tableHeight, setTableHeight] = useState(0);

  // Calculate estimated height based on text content
  const calculateEstimatedHeight = () => {
    if (currentPageRows.length === 0) return 0;
    
    let totalEstimatedHeight = 0;
    currentPageRows.forEach(row => {
      const description = row.description || '';
      const textLength = description.length;
      const wordsPerLine = 20; // Approximate words per line
      const linesPerRow = Math.ceil(textLength / wordsPerLine);
      const estimatedRowHeight = Math.max(30, linesPerRow * 20); // 20px per line
      totalEstimatedHeight += estimatedRowHeight;
    });
    
    return totalEstimatedHeight;
  };

  // Sync local state with prop changes
  React.useEffect(() => {
    setLocalData(invoiceData);
  }, [invoiceData]);

  // Table container max height
  const MAX_TABLE_HEIGHT = 400; // Max height for table container
  const ROW_HEIGHT = 50; // Estimated row height
  
  // Calculate how many complete rows can fit in the table container
  const maxRowsPerPage = Math.floor(MAX_TABLE_HEIGHT / ROW_HEIGHT);
  const ITEMS_PER_PAGE = Math.max(1, maxRowsPerPage); // At least 1 row per page
  
  // Smart pagination: ensure no row is cut off
  const calculateSmartPagination = () => {
    if (localData.rows.length === 0) return { totalPages: 1, currentPageRows: [] };
    
    let currentPageRows = [];
    let totalPages = 1;
    let currentPage = currentInvoicePage;
    
    // Use 5 rows per page to ensure no cut-offs
    const ROWS_PER_PAGE = 5;
    const actualCurrentPage = currentPage || 1; // Fallback to 1 if undefined
    const startIndex = (actualCurrentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    
    // Get rows for current page
    currentPageRows = localData.rows.slice(startIndex, endIndex);
    
    // Calculate total pages
    totalPages = Math.ceil(localData.rows.length / ROWS_PER_PAGE);
    
    // In PDF mode, don't log debug info
    if (!isPDF) {
      console.log('Pagination Debug:', {
        totalRows: localData.rows.length,
        currentPage: actualCurrentPage,
        startIndex,
        endIndex,
        currentPageRows: currentPageRows.length,
        totalPages,
        rowsPerPage: ROWS_PER_PAGE
      });
    }
    
    return { totalPages, currentPageRows };
  };
  
  const { totalPages, currentPageRows } = calculateSmartPagination();
  const remainingRows = localData.rows.slice(ITEMS_PER_PAGE);

  // Measure actual row height and table height after render
  useEffect(() => {
    const measureTableHeight = () => {
      if (tableRef.current && currentPageRows.length > 0) {
        const tableElement = tableRef.current;
        const rows = tableElement.querySelectorAll('.tableRow');
        if (rows.length > 0) {
          const totalHeight = Array.from(rows).reduce((sum, row) => {
            return sum + (row as HTMLElement).offsetHeight;
          }, 0);
          const avgRowHeight = totalHeight / rows.length;
          setActualRowHeight(Math.max(30, avgRowHeight)); // Minimum 30px
          setTableHeight(totalHeight);
        }
      } else {
        setTableHeight(0);
      }
    };

    // Measure immediately
    measureTableHeight();

    // Also measure after a short delay to catch any content changes
    const timeoutId = setTimeout(measureTableHeight, 100);

    return () => clearTimeout(timeoutId);
  }, [currentPageRows, localData.rows]);

  // Additional effect to re-measure when content changes
  useEffect(() => {
    const measureTableHeight = () => {
      if (tableRef.current && currentPageRows.length > 0) {
        const tableElement = tableRef.current;
        const rows = tableElement.querySelectorAll('.tableRow');
        if (rows.length > 0) {
          const totalHeight = Array.from(rows).reduce((sum, row) => {
            return sum + (row as HTMLElement).offsetHeight;
          }, 0);
          setTableHeight(totalHeight);
        }
      }
    };

    // Re-measure when localData changes (content updates)
    const timeoutId = setTimeout(measureTableHeight, 50);

    return () => clearTimeout(timeoutId);
  }, [localData]);

  // Use ResizeObserver to detect content size changes
  useEffect(() => {
    if (!tableRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (tableRef.current && currentPageRows.length > 0) {
          const tableElement = tableRef.current;
          const rows = tableElement.querySelectorAll('.tableRow');
          if (rows.length > 0) {
            const totalHeight = Array.from(rows).reduce((sum, row) => {
              return sum + (row as HTMLElement).offsetHeight;
            }, 0);
            setTableHeight(totalHeight);
          }
        }
      }
    });

    resizeObserver.observe(tableRef.current);

    // Also observe individual rows for more granular detection
    const rows = tableRef.current.querySelectorAll('.tableRow');
    rows.forEach(row => {
      resizeObserver.observe(row);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentPageRows]);

  // Additional effect to force re-measurement after content changes
  useEffect(() => {
    const forceMeasurement = () => {
      if (tableRef.current && currentPageRows.length > 0) {
        const tableElement = tableRef.current;
        const rows = tableElement.querySelectorAll('.tableRow');
        if (rows.length > 0) {
          // Force a reflow to ensure accurate measurements
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          tableElement.offsetHeight;
          
          const totalHeight = Array.from(rows).reduce((sum, row) => {
            return sum + (row as HTMLElement).offsetHeight;
          }, 0);
          console.log('Force measurement - Table height:', totalHeight, 'Rows:', rows.length);
          setTableHeight(totalHeight);
        }
      }
    };

    // More aggressive timeouts to catch text wrapping and layout changes
    const timeouts = [
      setTimeout(forceMeasurement, 0),
      setTimeout(forceMeasurement, 10),
      setTimeout(forceMeasurement, 50),
      setTimeout(forceMeasurement, 100),
      setTimeout(forceMeasurement, 200),
      setTimeout(forceMeasurement, 500),
      setTimeout(forceMeasurement, 1000)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [localData, currentPageRows]);

  // Use MutationObserver to detect content changes
  useEffect(() => {
    if (!tableRef.current) return;

    const mutationObserver = new MutationObserver(() => {
      if (tableRef.current && currentPageRows.length > 0) {
        const tableElement = tableRef.current;
        const rows = tableElement.querySelectorAll('.tableRow');
        if (rows.length > 0) {
          const totalHeight = Array.from(rows).reduce((sum, row) => {
            return sum + (row as HTMLElement).offsetHeight;
          }, 0);
          console.log('MutationObserver - Table height:', totalHeight);
          setTableHeight(totalHeight);
        }
      }
    });

    mutationObserver.observe(tableRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [currentPageRows]);

  // Simple measurement for debugging
  useEffect(() => {
    if (tableRef.current && currentPageRows.length > 0) {
      const tableElement = tableRef.current;
      const rows = tableElement.querySelectorAll('.tableRow');
      if (rows.length > 0) {
        const totalHeight = Array.from(rows).reduce((sum, row) => {
          return sum + (row as HTMLElement).offsetHeight;
        }, 0);
        console.log('Table height:', totalHeight, 'Rows:', currentPageRows.length);
        setTableHeight(totalHeight);
      }
    }
  }, [currentPageRows]);


  const addRow = () => {
    const newRow = {
      id: Date.now().toString(),
      description: '',
      unit: '',
      price: ''
    };
    const updatedData = {
      ...localData,
      rows: [...localData.rows, newRow]
    };
    setLocalData(updatedData);
    updateInvoiceData?.(updatedData);
  };

  const deleteRow = (id: string) => {
    const updatedData = {
      ...localData,
      rows: localData.rows.filter(row => row.id !== id)
    };
    setLocalData(updatedData);
    updateInvoiceData?.(updatedData);
  };

  // Render additional pages for items 13+
  const renderAdditionalPages = () => {
    if (remainingRows.length === 0) return null;

    const additionalPages = [];
    for (let page = 1; page < totalPages; page++) {
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, localData.rows.length);
      const pageRows = localData.rows.slice(startIndex, endIndex);

      additionalPages.push(
        <div key={`page-${page + 1}`} className={styles.page5} data-pdf={isPDF ? 'true' : 'false'}>
          <div className={styles.title}>
            <div className={styles.titleChild} />
            <img className={styles.logoIcon} alt="" src="/logo.webp" />
          </div>
          <b className={styles.todaysInovice}>Today's Invoice (Page {page + 1})</b>
          <div className={styles.frame}>
            <div className={styles.frameChild} />
            <div className={styles.rectangle} />
          </div>
          <div className={styles.invoiceId}>
            Invoice_id: {localData.invoiceNumber || 'INV-001'}
          </div>
          <div 
            className={styles.paymentMethod}
            style={{ 
              top: `${245 + 42 + (pageRows.length * 30) + (pageRows.length > 0 ? 40 : 0) + 10}px` 
            }}
          >
            Payment Method: {localData.paymentMethod || ''} {localData.paymentNumber && `- ${localData.paymentNumber}`}
          </div>
         
           
          <div className={styles.rectangleParent}>
            <div className={styles.groupChild} />
            <div className={styles.groupItem} />
            <div className={styles.groupInner} />
            <div className={styles.groupPrice} />
            <b className={styles.description}>Description</b>
            <b className={styles.unit}>Unit</b>
            <b className={styles.price}>Price</b>
            <b className={styles.total}>Total</b>
          </div>
          <div className={styles.tableRowsContainer}>
            {pageRows.map((row, index) => {
              const unitPrice = parseFloat(row.unit) || 0;
              const price = parseFloat(row.price) || 0;
              const total = unitPrice * price;
              return (
                <div key={row.id} className={styles.tableRow}>
                  <div className={styles.rowDescription}>{row.description}</div>
                  <div className={styles.rowUnit}>{row.unit}</div>
                  <div className={styles.rowPrice}>{row.price}</div>
                  <div className={styles.rowTotal}>{total.toFixed(2)}</div>
                </div>
              );
            })}
            {pageRows.length > 0 && (
              <div className={styles.totalRow}>
                <div className={styles.totalLabel}>TOTAL:</div>
                <div className={styles.totalValue}>
                  {pageRows.reduce((sum, row) => {
                    const unitPrice = parseFloat(row.unit) || 0;
                    const price = parseFloat(row.price) || 0;
                    return sum + (unitPrice * price);
                  }, 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return additionalPages;
  };

  const updateRow = (id: string, field: string, value: string) => {
    const updatedData = {
      ...localData,
      rows: localData.rows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    };
    setLocalData(updatedData);
    updateInvoiceData?.(updatedData);
  };

  const updateField = (field: string, value: string) => {
    const updatedData = {
      ...localData,
      [field]: value
    };
    setLocalData(updatedData);
    updateInvoiceData?.(updatedData);
  };

  if (isPDF) {
    return (
      <div className={styles.page5} data-pdf={isPDF ? 'true' : 'false'}>
        <div className={styles.title}>
          <div className={styles.titleChild} />
          <img className={styles.logoIcon} alt="Logo" src="/logo.webp" />
        </div>
        <b className={styles.todaysInovice}>Today's Invoice</b>
        <div className={styles.frame}>
          <div className={styles.frameChild} />
          <div className={styles.rectangle} />
        </div>
        <div className={styles.invoiceId}>
          Invoice_id: {localData.invoiceNumber || ''}
        </div>
        <div className={styles.paymentMethod}>
          Payment Method: {localData.paymentMethod || ''}
        </div>
        {localData.paymentNumber && (
          <div className={styles.paymentNumber}>
            {localData.paymentMethod}-Payment_id
          </div>
        )}
        <div className={styles.rectangleParent}>
          <div className={styles.groupChild} />
          <div className={styles.groupItem} />
          <div className={styles.groupInner} />
          <b className={styles.price}>Price</b>
          <b className={styles.unit}>Unit</b>
          <b className={styles.description}>Description</b>
        </div>
        {/* Render table rows for PDF */}
        {localData.rows.map((row, index) => (
          <div key={row.id} className={styles.tableRow} style={{ top: `${250 + (index * 30)}px` }}>
            <div className={styles.rowDescription}>{row.description}</div>
            <div className={styles.rowUnit}>{row.unit}</div>
            <div className={styles.rowPrice}>{row.price}</div>
          </div>
        ))}
      </div>
    );
  }

  // Render the current invoice page
  return (
    <div className={styles.page5} data-pdf={isPDF ? 'true' : 'false'}>
      <div className={styles.title}>
        <div className={styles.titleChild} />
        <img className={styles.logoIcon} alt="Logo" src="/logo.webp" />
      </div>
      <b className={styles.todaysInovice} style={{ top: isPDF ? '180px' : '117px' }}>
        Today's Invoice
      </b>
        <div className={styles.frame} style={{ top: isPDF ? '200px' : '26px' }}>
          <div className={styles.frameChild} />
          <div className={styles.rectangle} />
        </div>
        <div className={styles.invoiceId} style={{ top: isPDF ? '220px' : '171px' }}>
          Invoice_id: {localData.invoiceNumber || ''}
        </div>
        <div 
          className={styles.paymentMethod}
          style={{ 
            top: isPDF ? `${292 + MAX_TABLE_HEIGHT + 20}px` : `${245 + 42 + MAX_TABLE_HEIGHT + 20}px`
          }}
        >
          Payment Method: {localData.paymentMethod || ''}{localData.paymentNumber && `-${localData.paymentNumber}`}
        </div>
       
         
        <div className={styles.rectangleParent} style={{ top: isPDF ? '250px' : '203px' }}>
          <div className={styles.groupChild} />
          <div className={styles.groupItem} />
          <div className={styles.groupInner} />
          <div className={styles.groupPrice} />
          <b className={styles.description}>Description</b>
          <b className={styles.unit}>Unit</b>
          <b className={styles.price}>Price</b>
          <b className={styles.total}>Total</b>
        </div>
        <div className={styles.tableRowsContainer} ref={tableRef} style={{ top: isPDF ? '292px' : '245px' }}>
          {currentPageRows.map((row, index) => {
            const unitPrice = parseFloat(row.unit) || 0;
            const price = parseFloat(row.price) || 0;
            const total = unitPrice * price;
            if (!isPDF) {
              console.log('Rendering row:', index, row);
            }
            return (
              <div key={row.id} className={styles.tableRow}>
                <div className={styles.rowDescription}>{row.description || `Row ${index + 1}`}</div>
                <div className={styles.rowUnit}>{row.unit || ''}</div>
                <div className={styles.rowPrice}>{row.price || ''}</div>
                <div className={styles.rowTotal}>{total.toFixed(2)}</div>
              </div>
            );
          })}
          {/* Only show total on the last invoice page */}
          {currentPageRows.length > 0 && currentInvoicePage === totalPages && (
            <div className={styles.totalRow}>
              <div className={styles.totalLabel}>TOTAL:</div>
              <div className={styles.totalValue}>
                {localData.rows.reduce((sum, row) => {
                  const unitPrice = parseFloat(row.unit) || 0;
                  const price = parseFloat(row.price) || 0;
                  return sum + (unitPrice * price);
                }, 0).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default Page5;