/**
 * Google Sheets API Service
 * Fetches data from a Google Sheet using the Google Sheets API directly
 * Requires REACT_APP_GOOGLE_SHEETS_API_KEY to be set in .env file
 */

export interface SheetRow {
  srNo: string;
  description: string;
  unit: string;
  price: string;
  recommendation?: string;
}

// Cache to prevent duplicate API calls
const sheetDataCache = new Map<string, { data: SheetRow[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const pendingRequests = new Map<string, Promise<SheetRow[]>>(); // Track pending requests

/**
 * Fetches data from Google Sheets using direct Google API
 * Requires REACT_APP_GOOGLE_SHEETS_API_KEY environment variable
 * 
 * @param sheetId - The Google Sheet ID (from the sheet URL)
 * @param range - The range to fetch (e.g., 'Sheet1!A:E' for 5 columns)
 * @returns Array of rows with description, unit, and price
 */
export const fetchGoogleSheetData = async (
  sheetId: string,
  range: string = 'Sheet1!A:E' // Default to 5 columns (Sr. No., Estimate Description, Unit, estimate, recommendation)
): Promise<SheetRow[]> => {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || 'AIzaSyBixMaBdYAqO8_I9qlBlwU6nQkjiDCt-uc';
    
    // Use direct Google Sheets API only (no backend proxy)
    if (!apiKey) {
      console.warn('⚠ REACT_APP_GOOGLE_SHEETS_API_KEY not found in fetchGoogleSheetData. Check Vercel environment variables.');
      return [];
    }
    
    // Create cache key from sheetId and range
    const cacheKey = `${sheetId}:${range}`;
    
    // Check cache first (silent)
    const cached = sheetDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Check if there's already a pending request for this key (silent)
    const pendingRequest = pendingRequests.get(cacheKey);
    if (pendingRequest) {
      return await pendingRequest;
    }
    
    // Create new request
    const requestPromise = (async () => {
      try {
    // URL-encode the range to handle special characters in sheet names
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedRange}?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = `Failed to fetch Google Sheet data: ${response.status}`;
      
      // Parse error response for better error messages
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          const errorCode = errorJson.error.code;
          const errorMsg = errorJson.error.message;
          
          if (errorCode === 400 && errorMsg.includes('not supported')) {
            errorMessage = `Sheet access error (400): The sheet "${sheetId}" is not publicly accessible. Steps to fix: 1) Open the sheet and click "Share" → "Change" → Select "Anyone with the link" → Set to "Viewer" → "Done", 2) Verify the sheet name "${range.split('!')[0]}" matches exactly (case-sensitive), 3) If in Google Workspace, ensure public sharing is allowed by your admin. Test URL: https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey.substring(0, 20)}...`;
          } else if (errorCode === 403) {
            errorMessage = `API access denied (403): Check that: 1) Google Sheets API is enabled in Google Cloud Console, 2) Your API key has proper permissions, 3) The sheet is publicly shared.`;
          } else {
            errorMessage = `Google Sheets API error (${errorCode}): ${errorMsg}`;
          }
        }
      } catch (e) {
        errorMessage = `Failed to fetch Google Sheet data: ${response.status} ${errorText}`;
      }
      
      // Log a single concise error
      console.error('✗ Google Sheets API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const parsed = parseSheetData(data.values || []);
        
        // Cache the result
        sheetDataCache.set(cacheKey, {
          data: parsed,
          timestamp: Date.now()
        });
    
    return parsed;
      } finally {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    })();
    
    // Store pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    return await requestPromise;
  } catch (error: any) {
    console.error('✗ Error fetching Google Sheet data:', error?.message || error);
    // Don't throw - return empty array to allow app to continue
    return [];
  }
};

/**
 * Parses raw sheet data into SheetRow format
 * Supports multiple formats:
 * - 5-column format: Sr. No., Estimate Description, Unit, estimate, recommendation
 * - 3-column format: Description, Unit, Price
 * - 2-column format: Description, Price
 * @param rows - Raw array of rows from Google Sheets API
 * @returns Array of parsed SheetRow objects
 */
const parseSheetData = (rows: string[][]): SheetRow[] => {
  if (!rows || rows.length === 0) return [];
  
  // Skip the header row if present
  const headerRow = rows[0] || [];
  const headerLower = headerRow.map((cell: string) => cell?.toLowerCase()?.trim() || '');
  const isHeaderRow = headerLower.some((cell: string) => 
    ['description', 'unit', 'price', 'sr', 'no', 'estimate', 'recommendation'].some(keyword => cell.includes(keyword))
  );
  
  const dataRows = isHeaderRow ? rows.slice(1) : rows;
  
  // Detect format based on header or column count
  const hasSrNo = headerLower.some(cell => cell.includes('sr') && cell.includes('no'));
  const hasEstimateDescription = headerLower.some(cell => cell.includes('estimate') && cell.includes('description'));
  const hasRecommendation = headerLower.some(cell => cell.includes('recommendation'));
  const is5ColumnFormat = hasSrNo && hasEstimateDescription && dataRows.length > 0 && dataRows[0]?.length >= 5;
  
  const hasUnitColumn = headerLower.includes('unit') || 
    (dataRows.length > 0 && dataRows[0]?.length >= 3 && !is5ColumnFormat);
  
  return dataRows
    .filter((row: string[]) => row && row.length > 0 && (row[0]?.trim() || row[1]?.trim())) // Filter out empty rows
    .map((row: string[]) => {
      if (is5ColumnFormat) {
        // 5-column format: Sr. No., Estimate Description, Unit, estimate, recommendation
        return {
          srNo: row[0]?.trim() || '',
          description: row[1]?.trim() || '', // Estimate Description
          unit: row[2]?.trim() || '',
          price: row[3]?.trim() || '', // estimate
          recommendation: row[4]?.trim() || ''
        };
      } else if (hasUnitColumn) {
        // 3-column format: Description, Unit, Price
        return {
          srNo: '',
          description: row[0]?.trim() || '',
          unit: row[1]?.trim() || '',
          price: row[2]?.trim() || ''
        };
      } else {
        // 2-column format: Description, Price (no Unit column)
        return {
          srNo: '',
          description: row[0]?.trim() || '',
          unit: '', // Default to empty for 2-column format
          price: row[1]?.trim() || ''
        };
      }
    })
    .filter((row: SheetRow) => row.description || row.srNo); // Only include rows with description or srNo
};

/**
 * Searches Google Sheet data for matching rows
 * For description field: searches by Sr. No. and Description
 * For other fields: searches by the specific field
 * @param query - The search query
 * @param sheetData - The sheet data to search
 * @param field - The field to search in ('description', 'unit', or 'price')
 * @returns Filtered array of matching rows
 */
export const searchSheetData = (
  query: string,
  sheetData: SheetRow[],
  field: 'description' | 'unit' | 'price' = 'description'
): SheetRow[] => {
  if (!query || !query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  
  const results = sheetData.filter((row) => {
    if (field === 'description') {
      // For description field, search by both Sr. No. and Description
      const srNoMatch = row.srNo?.toLowerCase().includes(lowerQuery) || false;
      const descriptionMatch = row.description?.toLowerCase().includes(lowerQuery) || false;
      return srNoMatch || descriptionMatch;
    } else {
      // For other fields, search by the specific field
      const fieldValue = row[field]?.toLowerCase() || '';
      return fieldValue.includes(lowerQuery);
    }
  }).slice(0, 10); // Limit to 10 results
  
  return results;
};

