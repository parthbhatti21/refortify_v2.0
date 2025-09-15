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
                {!isPDF && (
                  <div style={{ 
                    width: '40px',
                    textAlign: 'center', 
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    color: '#ffffff',
                    backgroundColor: '#722420'
                  }}>
                    
                  </div>
                )}
              </div>

              {/* Data Rows */}
              {currentPageRows.map((row, index) => {
                const unitPrice = parseFloat(row.unit) || 0;
                const price = parseFloat(row.price) || 0;
                const total = unitPrice * price;
                return (
                  <div key={row.id} style={{ 
                    display: 'flex',
                    height: '30px',
                    marginBottom: '4px',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}>
                    <div style={{ 
                      flex: '1',
                      padding: '8px 10px', 
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: '1.2',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      backgroundColor: 'inherit'
                    }}>
                      {row.description}
                    </div>
                    <div style={{ 
                      width: '80px',
                      padding: '8px 10px', 
                      textAlign: 'center',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'inherit'
                    }}>
                      {row.unit}
                    </div>
                    <div style={{ 
                      width: '100px',
                      padding: '8px 10px', 
                      textAlign: 'center', 
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'inherit'
                    }}>
                      {row.price}
                    </div>
                    <div style={{ 
                      width: '100px',
                      padding: '8px 10px', 
                      textAlign: 'center', 
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      backgroundColor: 'inherit'
                    }}>
                      {total.toFixed(2)}
                    </div>
                    {!isPDF && (
                      <div style={{ 
                        width: '40px',
                        padding: '8px 0', 
                        textAlign: 'center', 
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'inherit'
                      }}>
                        <button 
                          onClick={() => {
                            const updatedRows = localData.rows.filter(r => r.id !== row.id);
                            updateLocalData({ ...localData, rows: updatedRows });
                          }}
                          aria-label="Delete row"
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontSize: '14px',
                            lineHeight: 1
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Total row - only show on last page */}
              {currentPageRows.length > 0 && currentEstimatePage === totalPages && (
                <div style={{ 
                  display: 'flex',
                  height: '25px',
                  backgroundColor: '#722420', 
                  color: 'white',
                  borderTop: '2px solid #722420',
                  fontWeight: '700'
                }}>
                  <div style={{ 
                    flex: '1',
                    height: '30px',
                    backgroundColor: '#722420'
                  }}></div>
                  <div style={{ 
                    width: '80px',
                    height: '30px',
                    backgroundColor: '#722420'
                  }}></div>
                  <div style={{ 
                    width: '100px',
                    padding: '2px 6px', 
                    textAlign: 'right', 
                    height: '30px',
                    letterSpacing: '0.42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: '#722420',
                    color: '#ffffff'
                  }}>
                    TOTAL :
                  </div>
                  <div style={{ 
                    width: '100px',
                    padding: '2px 6px', 
                    textAlign: 'center', 
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: '#722420',
                    color: '#ffffff'
                  }}>
                    ${localData.rows.reduce((sum, row) => {
                      const unitPrice = parseFloat(row.unit) || 0;
                      const price = parseFloat(row.price) || 0;
                      return sum + (unitPrice * price);
                    }, 0).toFixed(2)}
                  </div>
                  {!isPDF && (
                    <div style={{ 
                      width: '40px',
                      height: '30px',
                      backgroundColor: '#722420'
                    }}></div>
                  )}
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
