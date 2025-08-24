import React, { useState } from 'react';

interface DataScraperProps {
  onDataExtracted: (data: { clientName: string; clientAddress: string; chimneyType: string }) => void;
  setCurrentStep: (step: 'scrape' | 'form') => void;
}

interface ExtractedData {
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  timelineContent: string;
  imageUrls: string[];
}

const DataScraper: React.FC<DataScraperProps> = ({ onDataExtracted, setCurrentStep }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    clientName: '',
    clientAddress: '',
    chimneyType: '',
    timelineContent: '',
    imageUrls: []
  });
  const [showEditForm, setShowEditForm] = useState(false);

  // Function to parse HTML content using the same logic as Python code
  const parseHtmlContent = (htmlContent: string): ExtractedData => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    let timelineContent = "";
    let imageUrls: string[] = [];
    let address = "";
    let clientName = "";

    // Find timeline-block div and extract content
    const timelineBlock = doc.querySelector('div.timeline-block');
    if (timelineBlock) {
      timelineContent = timelineBlock.textContent?.trim() || "";
      
      // Extract image URLs from data-full attributes
      const imageLinks = timelineBlock.querySelectorAll('a[data-full]');
      imageLinks.forEach(link => {
        const dataFull = link.getAttribute('data-full');
        if (dataFull) {
          imageUrls.push(dataFull);
        }
      });
    }

    // Find timeline-metadata div and extract address
    const metadataDiv = doc.querySelector('div.timeline-metadata');
    if (metadataDiv) {
      const spans = metadataDiv.querySelectorAll('span');
      if (spans.length > 0) {
        address = spans[spans.length - 1].textContent?.trim() || "";
      }
    }

    // Extract client name from h1 with class first-address-line
    const clientNameElement = doc.querySelector('h1.first-address-line');
    if (clientNameElement) {
      clientName = clientNameElement.textContent?.trim() || "";
    }

    // Determine chimney type based on content analysis
    let chimneyType = "masonry"; // default
    if (timelineContent.toLowerCase().includes('prefabricated') || 
        timelineContent.toLowerCase().includes('prefab')) {
      chimneyType = "prefabricated";
    }

    return {
      clientName,
      clientAddress: address,
      chimneyType,
      timelineContent,
      imageUrls
    };
  };

  const handleScrape = async () => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      // Fetch the HTML content from the URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const htmlContent = await response.text();
      
      // Parse the HTML content using our custom parser
      const parsedData = parseHtmlContent(htmlContent);
      
      setExtractedData(parsedData);
      setShowEditForm(true);
      
      // Log the extracted data for debugging (same as Python print statements)
      console.log(parsedData.timelineContent);
      console.log("-----");
      console.log(parsedData.imageUrls.length);
      
    } catch (error) {
      console.error('Data extraction failed:', error);
      alert('Data extraction failed. Please verify the URL and try again, or contact IT support if the issue persists.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = (field: keyof ExtractedData, value: string) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    // Only pass the required data to the parent component
    onDataExtracted({
      clientName: extractedData.clientName,
      clientAddress: extractedData.clientAddress,
      chimneyType: extractedData.chimneyType
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-8 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Data Extraction Tool</h2>
        <p className="text-sm sm:text-base text-gray-600">Extract client information from inspection reports, customer portals, or other company data sources</p>
      </div>

      {/* URL Input */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <form onSubmit={(e) => { e.preventDefault(); if (url && !isLoading) handleScrape(); }} className="space-y-4">
          <div>
            <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700 mb-2">
              Data Source URL *
            </label>
            <input
              type="url"
              id="dataSource"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL from inspection report, customer portal, or other data source"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={!url || isLoading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Extracting...' : 'Extract Data'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('form')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium"
            >
              Enter Manually
            </button>
          </div>
        </form>
      </div>

      {/* Extracted Data Display/Edit */}
      {showEditForm && (
        <div className="bg-green-50 border border-green-200 p-4 sm:p-6 rounded-lg">
          <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4">Extracted Information</h3>
          <p className="text-sm sm:text-base text-green-700 mb-3 sm:mb-4">Review and verify the extracted data. Make any necessary corrections before proceeding.</p>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="extractedClientName" className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                id="extractedClientName"
                value={extractedData.clientName}
                onChange={(e) => handleDataChange('clientName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="extractedClientAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Client Address
              </label>
              <input
                type="text"
                id="extractedClientAddress"
                value={extractedData.clientAddress}
                onChange={(e) => handleDataChange('clientAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="extractedChimneyType" className="block text-sm font-medium text-gray-700 mb-2">
                Chimney Type
              </label>
              <select
                id="extractedChimneyType"
                value={extractedData.chimneyType}
                onChange={(e) => handleDataChange('chimneyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
              >
                <option value="masonry">Masonry</option>
                <option value="prefabricated">Prefabricated</option>
              </select>
            </div>

            {/* Display extracted timeline content and image count */}
            <div className="bg-gray-100 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-700 mb-2">Extracted Timeline Content:</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">{extractedData.timelineContent || 'No timeline content found'}</p>
              <p className="text-xs sm:text-sm text-gray-600">Images found: {extractedData.imageUrls.length}</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6">
            <button
              onClick={handleContinue}
              className="w-full px-4 sm:px-6 py-3 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] font-medium"
            >
              Proceed to Report Generation
            </button>
          </div>
        </div>
      )}

      {/* Company Guidelines */}
      <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg">
        <h4 className="font-medium text-red-900 mb-2">Company Guidelines:</h4>
        <ul className="text-xs sm:text-sm text-red-800 space-y-1 list-disc list-inside">
          <li>Use this tool to extract data from company-approved sources only</li>
          <li>Always verify extracted information before generating reports</li>
          <li>Ensure client data accuracy for compliance and quality standards</li>
          <li>Contact your supervisor if you encounter data extraction issues</li>
        </ul>
      </div>
    </div>
  );
};

export default DataScraper;
