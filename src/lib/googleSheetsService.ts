/**
 * Google Sheets API Service
 * Fetches data from a Google Sheet using the Google Sheets API directly
 * Requires REACT_APP_GOOGLE_SHEETS_API_KEY to be set in .env file
 */

export interface SheetRow {
  description: string;
  unit: string;
  price: string;
}

/**
 * Fetches data from Google Sheets using direct API call
 * Requires REACT_APP_GOOGLE_SHEETS_API_KEY environment variable
 * 
 * @param sheetId - The Google Sheet ID (from the sheet URL)
 * @param range - The range to fetch (e.g., 'Sheet1!A:B' for Description, Price)
 * @returns Array of rows with description, unit, and price
 */
export const fetchGoogleSheetData = async (
  sheetId: string,
  range: string = 'Sheet1!A:B' // Default to 2 columns (Description, Price)
): Promise<SheetRow[]> => {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
    
    // Use direct Google Sheets API (no backend needed)
    if (!apiKey) {
      return [];
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch Google Sheet data: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const parsed = parseSheetData(data.values || []);
    
    return parsed;
  } catch (error: any) {
    return [];
  }
};

/**
 * Parses raw sheet data into SheetRow format
 * Supports both 2-column (Description, Price) and 3-column (Description, Unit, Price) formats
 * @param rows - Raw array of rows from Google Sheets API
 * @returns Array of parsed SheetRow objects
 */
const parseSheetData = (rows: string[][]): SheetRow[] => {
  if (!rows || rows.length === 0) return [];
  
  // Skip the header row if present
  const headerRow = rows[0] || [];
  const headerLower = headerRow.map((cell: string) => cell?.toLowerCase()?.trim() || '');
  const isHeaderRow = headerLower.some((cell: string) => 
    ['description', 'unit', 'price'].includes(cell)
  );
  
  const dataRows = isHeaderRow ? rows.slice(1) : rows;
  
  // Detect format: check if header has "unit" or if rows have 3 columns
  const hasUnitColumn = headerLower.includes('unit') || 
    (dataRows.length > 0 && dataRows[0]?.length >= 3);
  
  return dataRows
    .filter((row: string[]) => row && row.length > 0 && row[0]?.trim()) // Filter out empty rows
    .map((row: string[]) => {
      if (hasUnitColumn) {
        // 3-column format: Description, Unit, Price
        return {
          description: row[0]?.trim() || '',
          unit: row[1]?.trim() || '',
          price: row[2]?.trim() || ''
        };
      } else {
        // 2-column format: Description, Price (no Unit column)
        return {
          description: row[0]?.trim() || '',
          unit: '', // Default to empty for 2-column format
          price: row[1]?.trim() || ''
        };
      }
    })
    .filter((row: SheetRow) => row.description); // Only include rows with description
};

/**
 * Searches Google Sheet data for matching rows
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
    const fieldValue = row[field]?.toLowerCase() || '';
    return fieldValue.includes(lowerQuery);
  }).slice(0, 10); // Limit to 10 results
  
  return results;
};

