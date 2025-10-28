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

type RecommendationSection = {
  title: string;
  rows: RepairEstimateRow[];
};

interface Step5Part2Props {
  isPDF?: boolean;
  currentEstimatePage?: number;
  repairEstimateData?: RepairEstimateData;
  updateRepairEstimateData?: (data: RepairEstimateData) => void;
  section1?: RecommendationSection;
  section2?: RecommendationSection;
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
  updateRepairEstimateData,
  section1,
  section2
}) => {
  const [localData, setLocalData] = useState<RepairEstimateData>(repairEstimateData);
  const tableRef = useRef<HTMLDivElement>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalData(repairEstimateData);
  }, [repairEstimateData]);
  
  // Two-section pagination: Show both tables on same page until 10+ total rows
  // Then Table 2 moves to next page. Backwards compatible: if sections are not provided,
  // treat repairEstimateData.rows as section 1.
  const ROWS_PER_PAGE = 10;

  const effectiveSection1: RecommendationSection = {
    title: section1?.title ?? 'Recommendations',
    rows: (section1?.rows && section1.rows.length > 0)
      ? section1.rows
      : (repairEstimateData?.rows || [])
  };

  const effectiveSection2: RecommendationSection | undefined = (section2 && section2.rows && section2.rows.length > 0)
    ? section2
    : undefined;

  const totalRows = effectiveSection1.rows.length + (effectiveSection2?.rows.length || 0);
  const actualCurrentPage = currentEstimatePage || 1;

  // Determine what to show on current page
  let showSection1 = false;
  let showSection2 = false;
  let section1Rows: RepairEstimateRow[] = [];
  let section2Rows: RepairEstimateRow[] = [];
  let totalPages = 1;

  if (totalRows <= ROWS_PER_PAGE) {
    // Both tables fit on one page
    showSection1 = true;
    showSection2 = effectiveSection2 !== undefined;
    section1Rows = effectiveSection1.rows;
    section2Rows = effectiveSection2?.rows || [];
    totalPages = 1;
  } else {
    // Need pagination
    const section1Pages = Math.ceil(effectiveSection1.rows.length / ROWS_PER_PAGE);
    const section2Pages = effectiveSection2 ? Math.ceil(effectiveSection2.rows.length / ROWS_PER_PAGE) : 0;
    totalPages = section1Pages + section2Pages;

    if (actualCurrentPage <= section1Pages) {
      // Showing Section 1
      showSection1 = true;
      showSection2 = false;
      const startIndex = (actualCurrentPage - 1) * ROWS_PER_PAGE;
      const endIndex = startIndex + ROWS_PER_PAGE;
      section1Rows = effectiveSection1.rows.slice(startIndex, endIndex);
    } else {
      // Showing Section 2
      showSection1 = false;
      showSection2 = true;
      const pageIndex = actualCurrentPage - section1Pages - 1;
      const startIndex = pageIndex * ROWS_PER_PAGE;
      const endIndex = startIndex + ROWS_PER_PAGE;
      section2Rows = effectiveSection2?.rows.slice(startIndex, endIndex) || [];
    }
  }

  // Calculate dynamic positioning
  const calculateTableHeight = (rows: RepairEstimateRow[]) => {
    if (rows.length === 0) return 0;
    const headerHeight = 20; // Header row height
    const rowHeight = 30; // Increased row height to account for content wrapping and spacing
    const totalRowHeight = rows.length * rowHeight;
    return headerHeight + totalRowHeight;
  };

  const section1Height = calculateTableHeight(section1Rows);
  const section2Height = calculateTableHeight(section2Rows);
  const GAP_BETWEEN_TABLES = 80; // Increased gap to prevent overlapping

  // Dynamic positions
  const section1Top = 150;
  const section1TableTop = 180;
  
  // When Section 2 is on a separate page, start below header
  const section2Top = showSection1 ? (section1Top + section1Height + GAP_BETWEEN_TABLES) : 150;
  const section2TableTop = section2Top + 30; // 30px gap between title and table
  
  const summaryTop = section2Top + section2Height + GAP_BETWEEN_TABLES;
  const summaryTableTop = summaryTop + 30;

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

      
    

          {/* Render Section 1 if it should be shown */}
          {showSection1 && (
            <>
              {/* Section 1 Title */}
              <div style={{ position: 'absolute', top: `${section1Top}px`, left: '29px', right: '29px', fontSize: '14px', fontWeight: 600 }}>
                {effectiveSection1.title}
              </div>

              {/* Section 1 Table */}
              <div style={{ 
                position: 'absolute', 
                top: `${section1TableTop}px`, 
                left: '29px', 
                right: '29px',    
                fontSize: '12px',
                fontFamily: 'Inter, Arial, sans-serif'
              }}>
            <div 
              ref={tableRef}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '3fr 50px 60px 60px',
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
                  borderBottom: '1px solid #722420',
                  fontSize: '12px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }}>Total</div>
              </div>
              {/* Data Rows */}
              {section1Rows.map((row, index) => {
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
                const baseRowHeight = isPDF ? 14 : 14;
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
                        textAlign: 'center',
                        lineHeight: '1.0',
                        rowSpan: rowSpan,
                        height: `${descriptionHeight}px`,
                        boxSizing: 'border-box',
                        paddingTop: '2px'
                      } : {
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        textAlign: 'left',
                        paddingTop: '2px'
                      }),
                      borderBottom: '1px solid #e0e0e0',
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
                      borderBottom: '1px solid #e0e0e0',
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
                      borderBottom: '1px solid #e0e0e0',
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
                      borderBottom: '1px solid #e0e0e0',
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


              {/* Total Row (only on final page) */}
              {section1Rows.length > 0 && actualCurrentPage === totalPages && (
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
                     wordWrap: 'break-word',
                     overflowWrap: 'break-word',
                     whiteSpace: 'normal'
                  }}>
                    ${(effectiveSection1.rows || []).reduce((sum, row) => {
                      const unitPrice = parseFloat(row.unit) || 0;
                      const price = parseFloat(row.price) || 0;
                      return sum + (unitPrice * price);
                    }, 0).toFixed(2)}
                  </div>
                 </div>
              )}
            </div>
          </div>
            </>
          )}

          {/* Render Section 2 if it should be shown */}
          {showSection2 && (
            <>
              {/* Section 2 Title */}
              <div style={{ position: 'absolute', top: `${section2Top}px`, left: '29px', right: '29px', fontSize: '14px', fontWeight: 600 }}>
                {effectiveSection2?.title || ''}
              </div>

              {/* Section 2 Table */}
              <div style={{ 
                position: 'absolute', 
                top: `${section2TableTop}px`, 
                left: '29px', 
                right: '29px',    
                fontSize: '12px',
                fontFamily: 'Inter, Arial, sans-serif'
              }}>
                <div 
                  ref={tableRef}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: '3fr 50px 60px 60px',
                    gap: '0px',
                    border: '1px solid #722420',
                    backgroundColor:'#722420 ',
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'contents' }}>
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
                      borderBottom: '1px solid #722420',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}>Description</div>
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
                      borderBottom: '1px solid #722420',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}>Unit</div>
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
                      borderBottom: '1px solid #722420',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}>Price</div>
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
                      borderBottom: '1px solid #722420',
                      fontSize: '12px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}>Total</div>
                  </div>
                  {/* Data Rows */}
                  {section2Rows.map((row, index) => {
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
                    const baseRowHeight = isPDF ? 14 : 14;
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
                            textAlign: 'center',
                            lineHeight: '1.0',
                            rowSpan: rowSpan,
                            height: `${descriptionHeight}px`,
                            boxSizing: 'border-box',
                            paddingTop: '2px'
                          } : {
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            textAlign: 'left',
                            paddingTop: '2px'
                          }),
                          borderBottom: '1px solid #e0e0e0',
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
                          borderBottom: '1px solid #e0e0e0',
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
                          borderBottom: '1px solid #e0e0e0',
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
                          borderBottom: '1px solid #e0e0e0',
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

                  {/* Total Row (only on final page) */}
                  {section2Rows.length > 0 && actualCurrentPage === totalPages && (
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
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}>
                        ${(effectiveSection2?.rows || []).reduce((sum, row) => {
                          const unitPrice = parseFloat(row.unit) || 0;
                          const price = parseFloat(row.price) || 0;
                          return sum + (unitPrice * price);
                        }, 0).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Table - Only show when both sections exist and on final page */}
              {actualCurrentPage === totalPages && (
                <>
                  {/* Summary Title */}
                  <div style={{ position: 'absolute', top: `${summaryTop}px`, left: '29px', right: '29px', fontSize: '14px', fontWeight: 600 }}>
                    Summary
                  </div>

                  {/* Summary Table */}
                  <div style={{ 
                    position: 'absolute', 
                    top: `${summaryTableTop}px`, 
                    left: '29px', 
                    right: '29px',    
                    fontSize: '12px',
                    fontFamily: 'Inter, Arial, sans-serif'
                  }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '3fr 50px 60px 60px',
                      gap: '0px',
                      border: '1px solid #722420',
                      backgroundColor:'#722420 ',
                    }}>
                      {/* Header Row */}
                      <div style={{ display: 'contents' }}>
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
                          borderBottom: '1px solid #722420',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>Section</div>
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
                          borderBottom: '1px solid #722420',
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
                          borderBottom: '1px solid #722420',
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
                          borderBottom: '1px solid #722420',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>Total</div>
                      </div>

                      {/* Section 1 Total Row */}
                      <div style={{ display: 'contents' }}>
                        <div style={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          fontWeight: 'normal',
                          minHeight: isPDF ? '20px' : '20px',
                          padding: isPDF ? '0px 8px' : '4px 8px',
                          ...(isPDF ? {
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            textAlign: 'left',
                            height: '20px',
                            boxSizing: 'border-box',
                            lineHeight: '1.0'
                          } : {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            textAlign: 'left'
                          }),
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          {effectiveSection1.title} 
                          
                        </div>
                        <div style={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          fontWeight: 'normal',
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
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}></div>
                        <div style={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          fontWeight: 'normal',
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
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}></div>
                        <div style={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          fontWeight: '600',
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
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          ${(effectiveSection1.rows || []).reduce((sum, row) => {
                            const unitPrice = parseFloat(row.unit) || 0;
                            const price = parseFloat(row.price) || 0;
                            return sum + (unitPrice * price);
                          }, 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Section 2 Total Row */}
                      <div style={{ display: 'contents' }}>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          color: '#000000',
                          fontWeight: 'normal',
                          minHeight: isPDF ? '20px' : '20px',
                          padding: isPDF ? '0px 8px' : '4px 8px',
                          ...(isPDF ? {
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            textAlign: 'left',
                            height: '20px',
                            boxSizing: 'border-box',
                            lineHeight: '1.0'
                          } : {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            textAlign: 'left'
                          }),
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          {effectiveSection2?.title || 'Section 2'} 
                        </div>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          color: '#000000',
                          fontWeight: 'normal',
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
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}></div>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          color: '#000000',
                          fontWeight: 'normal',
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
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}></div>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          color: '#000000',
                          fontWeight: '600',
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
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          ${(effectiveSection2?.rows || []).reduce((sum, row) => {
                            const unitPrice = parseFloat(row.unit) || 0;
                            const price = parseFloat(row.price) || 0;
                            return sum + (unitPrice * price);
                          }, 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Grand Total Row */}
                      <div style={{ display: 'contents' }}>
                        <div style={{
                          backgroundColor: '#722420',
                          color: 'white',
                          fontWeight: 'bold',
                          minHeight: isPDF ? '20px' : '20px',
                          padding: isPDF ? '0px 8px' : '4px 8px',
                          ...(isPDF ? {
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            textAlign: 'left',
                            height: '20px',
                            boxSizing: 'border-box',
                            lineHeight: '1.0'
                          } : {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            textAlign: 'left'
                          }),
                          borderBottom: '1px solid #722420',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          TOTAL 
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
                          borderBottom: '1px solid #722420',
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
                          borderBottom: '1px solid #722420',
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
                          borderBottom: '1px solid #722420',
                          fontSize: '12px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          ${(() => {
                            const sum1 = (effectiveSection1.rows || []).reduce((sum, row) => {
                              const unitPrice = parseFloat(row.unit) || 0;
                              const price = parseFloat(row.price) || 0;
                              return sum + (unitPrice * price);
                            }, 0);
                            const sum2 = (effectiveSection2?.rows || []).reduce((sum, row) => {
                              const unitPrice = parseFloat(row.unit) || 0;
                              const price = parseFloat(row.price) || 0;
                              return sum + (unitPrice * price);
                            }, 0);
                            return (sum1 + sum2).toFixed(2);
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

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
