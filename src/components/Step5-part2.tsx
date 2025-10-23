import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import styles from './Step5.module.css';

type RepairEstimateRow = {
  id: string;
  description: string;
  unit: string;
  price: string;
};

interface RepairEstimateData {
  estimateNumber: string;
  paymentMethod: string;
  paymentNumber: string;
  rows: RepairEstimateRow[];
}

interface Step5Part2Props {
  isPDF?: boolean;
  currentEstimatePage?: number;
  repairEstimateData?: RepairEstimateData;
  updateRepairEstimateData?: (data: RepairEstimateData) => void;
}

const Step5Part2: FunctionComponent<Step5Part2Props> = ({ 
  isPDF = false, 
  currentEstimatePage = 1,
  repairEstimateData = {
    estimateNumber: '',
    paymentMethod: '',
    paymentNumber: '',
    rows: []
  },
  updateRepairEstimateData
}) => {
  const [localData, setLocalData] = useState<RepairEstimateData>(repairEstimateData);
  const tableRef = useRef<HTMLDivElement>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalData(repairEstimateData);
  }, [repairEstimateData]);
  
  // Smart pagination: ensure no row is cut off
  const calculateSmartPagination = () => {
    if (localData.rows.length === 0) return { totalPages: 1, currentPageRows: [] };
    
    // Use 15 rows per page with line spacing
    const ROWS_PER_PAGE = 15;
    const actualCurrentPage = currentEstimatePage || 1;
    const startIndex = (actualCurrentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    
    // Get rows for current page
    const currentPageRows = localData.rows.slice(startIndex, endIndex);
    
    // Calculate total pages
    const totalPages = Math.ceil(localData.rows.length / ROWS_PER_PAGE);
    
    return { totalPages, currentPageRows };
  };
  
  const { totalPages, currentPageRows } = calculateSmartPagination();

  // Helper to sync local and parent data
  const updateLocalData = (newData: RepairEstimateData) => {
    setLocalData(newData);
    if (updateRepairEstimateData) {
      updateRepairEstimateData(newData);
    }
  };

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
                 Repair Estimate
               </div>
             </div>
             <img className={styles.logo} alt="Logo" src="/logo.webp" />
         </div> 

      
    

          {/* Invoice Table */}
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
                gridTemplateColumns: '1fr 80px 100px 100px',
                gap: '0px',
                border: '1px solid #722420',
                backgroundColor:'#722420 ',
                //  /backgroundColor: '#ffffff'
              }}
            >
              {/* Header Row */}
              
              <div style={{ display: 'contents' }}>
                <div style={{
                  // margin: i .sPDF ? '8px 8px' : '8px 8px',
                  backgroundColor: '#722420',
                  color: 'white',
                  fontWeight: 'bold',
                  minHeight:'28px',
                  padding: '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  borderBottom: '1px solid #722420',
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
                  minHeight:'28px',
                  padding: '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  borderBottom: '1px solid #722420',
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
                  minHeight:'28px',
                  padding: '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  borderBottom: '1px solid #722420',
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
                  minHeight:'28px',
                  padding: '4px 8px',
                  ...(isPDF ? {
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center'
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }),
                  borderBottom: '1px solid #722420',
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

                return (
                  <div key={row.id} style={{ display: 'contents' }}>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: 'normal',
                      minHeight: `${28 * rowSpan}px`,
                      padding: isPDF ? '6px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'top',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        rowSpan: rowSpan
                      } : {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }),
                      borderBottom: '1px solid #e0e0e0',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}>
                      {row.description}
                    </div>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: 'normal',
                      minHeight: `${28 * rowSpan}px`,
                      padding: isPDF ? '6px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'top',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        rowSpan: rowSpan
                      } : {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }),
                      borderBottom: '1px solid #e0e0e0',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}>
                      {row.unit}
                    </div>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: 'normal',
                      minHeight: `${28 * rowSpan}px`,
                      padding: isPDF ? '6px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'top',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        rowSpan: rowSpan
                      } : {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }),
                      borderBottom: '1px solid #e0e0e0',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}>
                      {row.price}
                    </div>
                    <div style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      color: '#000000',
                      fontWeight: '600',
                      minHeight: `${28 * rowSpan}px`,
                      padding: isPDF ? '6px 8px' : '4px 8px',
                      ...(isPDF ? {
                        display: 'table-cell',
                        verticalAlign: 'top',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        rowSpan: rowSpan
                      } : {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }),
                      borderBottom: '1px solid #e0e0e0',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '100%',
                      overflow: 'hidden'
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


              {/* ? */}
              {currentPageRows.length > 0 && currentEstimatePage === totalPages && (
                <div style={{ display: 'contents' }}>
                  <div style={{
                    backgroundColor: '#722420',
                    color: 'white',
                    fontWeight: 'bold',
                    minHeight: '28px',
                    padding: '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center'
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
                  }}></div>
                  <div style={{
                    backgroundColor: '#722420',
                    color: 'white',
                    fontWeight: 'bold',
                    minHeight: '28px',
                    padding: '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center'
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
                  }}></div>
                  <div style={{
                    backgroundColor: '#722420',
                    color: 'white',
                    fontWeight: 'bold',
                    minHeight: '28px',
                    padding: '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center'
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
                    minHeight: '28px',
                    padding: '4px 8px',
                    ...(isPDF ? {
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center'
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

 

          {/* Frame Border */}
          <div className={styles.frame}>
            <div className={styles.rectangle} />
            </div>
        </div>
        </div>
      </div>
  );
};

export default Step5Part2;
