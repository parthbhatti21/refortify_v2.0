import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import styles from './Page5.module.css';

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
  
  // Smart pagination: ensure no row is cut off
  const calculateSmartPagination = () => {
    if (localData.rows.length === 0) return { totalPages: 1, currentPageRows: [] };
    
    // Use 5 rows per page with line spacing
    const ROWS_PER_PAGE = 5;
    const actualCurrentPage = currentInvoicePage || 1;
    const startIndex = (actualCurrentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    
    // Get rows for current page
    const currentPageRows = localData.rows.slice(startIndex, endIndex);
    
    // Calculate total pages
    const totalPages = Math.ceil(localData.rows.length / ROWS_PER_PAGE);
    
    
    
    return { totalPages, currentPageRows };
  };
  
  const { totalPages, currentPageRows } = calculateSmartPagination();

  // Single return for both PDF and preview
  return (
    <div className={styles.page}>
      <div className={styles.overlapWrapper}>
        <div className={styles.overlap}>
          {/* Header Section */}
      <div className={styles.title}>
            <div className={styles.overlapGroup}>
              <div 
                className={styles.textWrapper2}
                style={{ 
                  top: isPDF ? '4px' : '8px' 
                }}
              >
                Today's Invoice
              </div>
            </div>
            <img className={styles.logo} alt="Logo" src="/logo.webp" />
        </div>

          {/* Invoice ID */}
          <div className={styles.invoiceId}>
          Invoice_id: {localData.invoiceNumber || ''}
        </div>

          {/* Invoice Table */}
          <div style={{ position: 'absolute', top: '180px', left: '29px', right: '29px' }}>
            <div 
              ref={tableRef}
              style={{ 
                width: '100%', 
                fontSize: '12px',
                fontFamily: 'Inter, Arial, sans-serif'
              }}
            >
              {/* Header Row */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: '#722420', 
                borderBottom: '2px solid #722420' 
              }}>
                <div style={{ 
                  flex: '1',
                  textAlign: 'center', 
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Description
                </div>
                <div style={{ 
                  width: '80px',
                  textAlign: 'center', 
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Unit
                </div>
                <div style={{ 
                  width: '100px',
                  height: '30px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Price
                </div>
                <div style={{ 
                  width: '100px',
                  textAlign: 'center',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Total
                </div>
              </div>

              {/* Data Rows */}
              {currentPageRows.map((row, index) => {
                const unitPrice = parseFloat(row.unit) || 0;
                const price = parseFloat(row.price) || 0;
                const total = unitPrice * price;
                return (
                  <div key={row.id} style={{ 
                    display: 'flex',
                    minHeight: '40px',
                    marginBottom: '4px',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}>
                    <div style={{ 
                      flex: '1',
                      padding: '12px 10px', 
                      minHeight: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: '1.4',
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '250px',
                      backgroundColor: 'inherit'
                    }}>
                      {row.description}
                    </div>
                    <div style={{ 
                      width: '80px',
                      padding: '12px 10px', 
                      textAlign: 'center',
                      minHeight: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'inherit'
                    }}>
                      {row.unit}
                    </div>
                    <div style={{ 
                      width: '100px',
                      padding: '12px 10px', 
                      textAlign: 'center', 
                      minHeight: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'inherit'
                    }}>
                      {row.price}
                    </div>
                    <div style={{ 
                      width: '100px',
                      padding: '12px 10px', 
                      textAlign: 'center', 
                      minHeight: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      backgroundColor: 'inherit'
                    }}>
                      {total.toFixed(2)}
                    </div>
                  </div>
                );
              })}

              {/* Total row - only show on last page */}
              {currentPageRows.length > 0 && currentInvoicePage === totalPages && (
                <div style={{ 
                  display: 'flex',
                  backgroundColor: '#722420', 
                  color: 'white',
                  borderTop: '2px solid #722420',
                  fontWeight: '700'
                }}>
                  <div style={{ display: 'flex' , width: '50px', flex: '1'}}></div>
                  <div style={{ display: 'flex' , width: '50px', flex: '1'}}></div>
                  <div style={{ 
                    flex: '1',
                    padding: '15px 12px', 
                    textAlign: 'right', 
                    minHeight: '40px',
                    letterSpacing: '0.42px',
                    display: 'flex',
                    alignItems: 'right',
                    justifyContent: 'right',
                    fontSize: '14px',
                    fontWeight: '700',
                    backgroundColor: '#722420',
                    color: '#ffffff'
                  }}>
                    TOTAL :
                  </div>
                  <div style={{ 
                    flex: '1',
                    width: '100px',
                    padding: '15px 16px', 
                    textAlign: 'center', 
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'right',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    backgroundColor: '#722420',
                    color: '#ffffff'
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

          {/* Payment Method */}
          <div className={styles.paymentMethod}>
            Payment Method: {localData.paymentMethod || ''}{localData.paymentNumber && ` - ${localData.paymentNumber}`}
              </div>

          {/* Frame Border */}
          <div className={styles.frame}>
            <div className={styles.rectangle} />
            </div>
        </div>
        </div>
      </div>
    );
};

export default Page5;
