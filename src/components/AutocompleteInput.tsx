import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchGoogleSheetData, searchSheetData, SheetRow } from '../lib/googleSheetsService';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  field: 'description' | 'unit' | 'price';
  onSelectRow?: (row: SheetRow) => void; // Callback when a full row is selected
  onEnterKey?: () => void; // Callback when Enter is pressed and dropdown is not open
  dataRowId?: string; // Data attribute for row identification
  sheetId?: string;
  sheetRange?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  field,
  onSelectRow,
  onEnterKey,
  dataRowId,
  sheetId,
  sheetRange = 'Repairs!A:E' // Default to 5 columns (Sr. No., Estimate Description, Unit, estimate, recommendation)
}) => {
  const [suggestions, setSuggestions] = useState<SheetRow[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sheetData, setSheetData] = useState<SheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const isTextarea = field === 'description';

  // Fetch sheet data on mount
  useEffect(() => {
    const loadSheetData = async () => {
      const effectiveSheetId = sheetId || process.env.REACT_APP_GOOGLE_SHEET_ID || '1Bhz4JMVaR4tGbBKrhRHwR38MTtX8MVM_0v0JV8V6R9Q';
      const apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || 'AIzaSyBixMaBdYAqO8_I9qlBlwU6nQkjiDCt-uc';
      
      if (!effectiveSheetId || !apiKey) {
        // Silently skip if not configured - autocomplete is optional
        return;
      }
      
      try {
        setIsLoading(true);
        const data = await fetchGoogleSheetData(effectiveSheetId, sheetRange);
        setSheetData(data);
        if (data.length === 0) {
          console.warn(`⚠ No data loaded from Google Sheet. Check:`);
          console.warn(`  1. Sheet ID: ${effectiveSheetId}`);
          console.warn(`  2. Range: ${sheetRange}`);
          console.warn(`  3. Environment variables are set in deployment`);
          console.warn(`  4. Sheet is shared publicly (if using API key method)`);
        }
      } catch (error: any) {
        console.error('✗ Failed to load Google Sheet data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSheetData();
  }, [sheetId, sheetRange]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (isTextarea && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight, but with a minimum
      const newHeight = Math.max(parseFloat(getComputedStyle(textarea).lineHeight) || 20, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, isTextarea]);

  // Update dropdown position when it should be shown
  useEffect(() => {
    const updatePosition = () => {
      if (showDropdown && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const position = {
          top: rect.bottom, // Fixed positioning is relative to viewport, no need for scrollY
          left: rect.left,  // Fixed positioning is relative to viewport, no need for scrollX
          width: rect.width
        };
        setDropdownPosition(position);
      }
    };

    updatePosition();

    // Update position on scroll and resize
    if (showDropdown) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showDropdown, value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // For textarea (description), only show dropdown if there's text and no line breaks in the current line
    if (isTextarea) {
      const lines = newValue.split('\n');
      const currentLine = lines[lines.length - 1];
      if (currentLine.trim().length > 0 && sheetData.length > 0) {
        const matches = searchSheetData(currentLine, sheetData, field);
        setSuggestions(matches);
        setShowDropdown(matches.length > 0);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } else {
      if (newValue.trim().length > 0) {
        if (sheetData.length > 0) {
          const matches = searchSheetData(newValue, sheetData, field);
          setSuggestions(matches);
          setShowDropdown(matches.length > 0);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: SheetRow) => {
    // Validate that we have a valid suggestion with required fields
    if (!suggestion || !suggestion.description) {
      console.warn('Invalid suggestion selected:', suggestion);
      return;
    }
    
    if (isTextarea) {
      // For textarea, replace only the current line with the selected suggestion
      const lines = value.split('\n');
      const currentLineIndex = lines.length - 1;
      lines[currentLineIndex] = suggestion[field];
      onChange(lines.join('\n'));
    } else {
      onChange(suggestion[field]);
    }
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    // If onSelectRow callback is provided, call it with the full row
    // Create a fresh copy to avoid any reference issues
    if (onSelectRow) {
      const rowToPass: SheetRow = {
        srNo: suggestion.srNo || '',
        description: suggestion.description || '',
        unit: suggestion.unit || '',
        price: suggestion.price || '',
        recommendation: suggestion.recommendation || ''
      };
      onSelectRow(rowToPass);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // For textarea (description), allow Enter to create new line unless dropdown is open and item is selected
    if (isTextarea && e.key === 'Enter') {
      if (showDropdown && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        // Ensure we're using the exact suggestion from the array at the selected index
        const selectedSuggestion = suggestions[selectedIndex];
        if (selectedSuggestion) {
          handleSelectSuggestion(selectedSuggestion);
        }
      } else if (!showDropdown && onEnterKey) {
        // If dropdown is not open and onEnterKey is provided, call it
        e.preventDefault();
        onEnterKey();
      }
      // Otherwise, let Enter create a new line (default behavior)
      return;
    }

    if (showDropdown && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            // Ensure we're using the exact suggestion from the array at the selected index
            const selectedSuggestion = suggestions[selectedIndex];
            if (selectedSuggestion) {
              handleSelectSuggestion(selectedSuggestion);
            }
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    } else if (e.key === 'Enter' && onEnterKey) {
      // If dropdown is not open and Enter is pressed, call onEnterKey
      e.preventDefault();
      onEnterKey();
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (isTextarea) {
      const lines = value.split('\n');
      const currentLine = lines[lines.length - 1];
      if (currentLine.trim().length > 0 && sheetData.length > 0) {
        const matches = searchSheetData(currentLine, sheetData, field);
        setSuggestions(matches);
        setShowDropdown(matches.length > 0);
      }
    } else {
      if (value.trim().length > 0 && sheetData.length > 0) {
        const matches = searchSheetData(value, sheetData, field);
        setSuggestions(matches);
        setShowDropdown(matches.length > 0);
      }
    }
  };

  // Handle blur - delay to allow click on dropdown
  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const dropdownContent = showDropdown && suggestions.length > 0 ? (
    <div
      ref={dropdownRef}
      className="bg-white rounded-lg shadow-2xl max-h-64 overflow-y-auto border border-gray-200"
      style={{ 
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width || 200}px`,
        minWidth: '200px',
        zIndex: 10000,
        marginTop: '6px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backgroundColor: 'white',
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        transition: 'opacity 0.15s ease-in-out'
      }}
    >
      {suggestions.map((suggestion, index) => {
        // Create a unique key based on the suggestion content to avoid React key issues
        const suggestionKey = `${suggestion.srNo || ''}-${suggestion.description || ''}-${suggestion.price || ''}-${index}`;
        return (
        <div
          key={suggestionKey}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Ensure we're using the exact suggestion from the array at this index
            const selectedSuggestion = suggestions[index];
            if (selectedSuggestion) {
              handleSelectSuggestion(selectedSuggestion);
            }
          }}
          className={`px-4 py-3 cursor-pointer transition-all duration-150 ease-in-out border-b border-gray-100 last:border-b-0 ${
            index === selectedIndex 
              ? 'bg-[#722420] text-white' 
              : 'bg-white text-gray-900 hover:bg-gray-50'
          }`}
          onMouseEnter={() => setSelectedIndex(index)}
          style={{
            transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out'
          }}
        >
          <div className={`text-sm font-semibold ${
            index === selectedIndex ? 'text-white' : 'text-gray-900'
          }`}>
            {field === 'description' ? (
              <>
                {suggestion.srNo && (
                  <span className="mr-2 font-normal text-gray-600">
                    [{suggestion.srNo}]
                  </span>
                )}
                {suggestion.description}
                {suggestion.price && (
                  <span className="ml-2 font-normal">
                  : {suggestion.price.trim().startsWith('$') ? suggestion.price.trim() : `$${suggestion.price.trim()}`}
                  </span>
                )}
              </>
            ) : (
              suggestion[field]
            )}
          </div>
          {field === 'description' && suggestion.unit && (
            <div className={`text-xs mt-1.5 ${
              index === selectedIndex ? 'text-gray-200' : 'text-gray-500'
            }`}>
              Unit: {suggestion.unit}
            </div>
          )}
        </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={`relative w-full ${className.includes('w-full') ? '' : ''}`} style={{ position: 'relative', zIndex: 1, width: '100%' }}>
      {isTextarea ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={className}
          data-row-id={dataRowId}
          rows={1}
          style={{ 
            resize: 'vertical',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            minHeight: '1.5rem',
            lineHeight: '1.25rem',
            overflow: 'hidden',
            width: '100%'
          }}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={className}
          data-row-id={dataRowId}
        />
      )}
      
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default AutocompleteInput;

