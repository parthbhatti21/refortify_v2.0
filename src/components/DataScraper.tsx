import React, { useState } from 'react';

interface DataScraperProps {
  onDataExtracted: (data: { clientName: string; clientAddress: string; chimneyType: string; reportDate: string; timelineCoverImage: string }) => void;
  setCurrentStep: (step: 'scrape' | 'form') => void;
  setFormData: (data: { clientName: string; clientAddress: string; chimneyType: string; reportDate: string; timelineCoverImage: string }) => void;
}

interface ExtractedData {
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  reportDate: string;
  timelineContent: string;
  imageUrls: string[];
  timelineCoverImage: string;
}

const DataScraper: React.FC<DataScraperProps> = ({ onDataExtracted, setCurrentStep, setFormData }) => {
  const [url, setUrl] = useState('https://app.companycam.com/timeline/ZzQLL3MY3C1dtVjb');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    clientName: '',
    clientAddress: '',
    chimneyType: '',
    reportDate: new Date().toISOString().split('T')[0],
    timelineContent: '',
    imageUrls: [],
    timelineCoverImage: ''
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
    let timelineCoverImage = "";

    // Find timeline-cover-image specifically
    const timelineCoverImg = doc.querySelector('img.timeline-cover-image');
    if (timelineCoverImg) {
      const src = timelineCoverImg.getAttribute('src');
      if (src) {
        timelineCoverImage = src;
        imageUrls.push(src); // Also add to general image URLs
      }
    }

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
      reportDate: new Date().toISOString().split('T')[0],
      timelineContent,
      imageUrls,
      timelineCoverImage
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
      chimneyType: extractedData.chimneyType,
      reportDate: extractedData.reportDate,
      timelineCoverImage: extractedData.timelineCoverImage || '' // Use specific timeline cover image
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
              onClick={() => {
                setFormData({
                  clientName: '',
                  clientAddress: '',
                  chimneyType: '',
                  reportDate: new Date().toISOString().split('T')[0],
                  timelineCoverImage: ''
                });
                setCurrentStep('form');
              }}
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
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - House Image */}
              {extractedData.timelineCoverImage && (
                <div className="flex flex-col items-center lg:col-span-1">
                  <h5 className="font-medium text-gray-700 mb-3">House Image:</h5>
                  <img 
                    src={extractedData.timelineCoverImage} 
                    alt="Timeline Cover" 
                    className="w-48 h-50 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                  />
                </div>
              )}
              
              {/* Right side - Form Fields */}
              <div className="space-y-6 lg:col-span-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Client Name</p>
                  <h4 className="text-xl font-bold text-gray-900">
                    {extractedData.clientName || 'Client Name Not Extracted'}
                  </h4>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Client Address</p>
                  <h4 className="text-xl font-bold text-gray-900">
                    {extractedData.clientAddress || 'Address Not Extracted'}
                  </h4>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <label htmlFor="extractedChimneyType" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Chimney Type
                  </label>
                  <div className="relative">
                    <select
                      id="extractedChimneyType"
                      value={extractedData.chimneyType}
                      onChange={(e) => handleDataChange('chimneyType', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-[#722420] text-gray-900 font-medium transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 hover:bg-gray-100"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 12px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px',
                        paddingRight: '40px'
                      }}
                    >
                      <option value="" className="text-gray-500">Select chimney type</option>
                      <option value="masonry" className="text-gray-900 font-medium">Masonry</option>
                      <option value="prefabricated" className="text-gray-900 font-medium">Prefabricated</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {extractedData.chimneyType && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs text-green-700 font-medium">
                        ✓ Selected: <span className="capitalize">{extractedData.chimneyType}</span>
                      </p>
                    </div>
                  )}
                </div>
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
