import React, { useState } from 'react';

interface ImageItem {
  id: string;
  url: string;
  alt?: string;
}

interface DataScraperProps {
  onDataExtracted: (data: { 
    clientName: string; 
    clientAddress: string; 
    chimneyType: string; 
    reportDate: string; 
    timelineCoverImage: string;
    scrapedImages: ImageItem[];
  }) => void;
  setCurrentStep: (step: 'scrape' | 'form') => void;
  setFormData: (data: { 
    clientName: string; 
    clientAddress: string; 
    chimneyType: string; 
    reportDate: string; 
    timelineCoverImage: string;
    scrapedImages: ImageItem[];
  }) => void;
}

interface JobData {
  id: string;
  date: string;
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  timelineContent: string;
  imageUrls: string[];
  timelineCoverImage: string;
  scrapedImages: ImageItem[];
}

interface ExtractedData {
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  reportDate: string;
  timelineContent: string;
  imageUrls: string[];
  timelineCoverImage: string;
  scrapedImages: ImageItem[];
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
    timelineCoverImage: '',
    scrapedImages: []
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showNoImagePopup, setShowNoImagePopup] = useState(false);
  const [showPreviousJobImages, setShowPreviousJobImages] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [allJobs, setAllJobs] = useState<JobData[]>([]);
  const [selectedDateJob, setSelectedDateJob] = useState<JobData | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Function to parse all jobs from HTML and extract their dates
  const parseAllJobsFromHtml = (htmlContent: string): JobData[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const jobs: JobData[] = [];
    
    // Look for timeline-block elements (each represents a job/date)
    const timelineBlocks = doc.querySelectorAll('div.timeline-block');
    
    console.log(`Found ${timelineBlocks.length} timeline blocks`);
    
    timelineBlocks.forEach((timelineBlock, index) => {
      // Extract date from span.date element
      let jobDate = '';
      const dateElement = timelineBlock.querySelector('span.date');
      if (dateElement) {
        jobDate = dateElement.textContent?.trim() || '';
        console.log(`Job ${index + 1} date: ${jobDate}`);
      }
      
      // Extract images from photo-grid
      const imageUrls: string[] = [];
      const photoItems = timelineBlock.querySelectorAll('a.photo-item[data-full]');
      
      photoItems.forEach(photoItem => {
        const dataFull = photoItem.getAttribute('data-full');
        if (dataFull) {
          imageUrls.push(dataFull);
        }
      });
      
      console.log(`Job ${index + 1} images: ${imageUrls.length}`);
      
      // Extract timeline content
      const timelineContent = timelineBlock.textContent?.trim() || '';
      
      // Determine chimney type based on content
      let chimneyType = "masonry";
      const content = timelineContent.toLowerCase();
      if (content.includes('prefabricated') || content.includes('prefab')) {
        chimneyType = "prefabricated";
      }
      
      // Create job data
      const jobData: JobData = {
        id: `job-${index}-${Date.now()}`,
        date: jobDate || new Date().toISOString().split('T')[0],
        clientName: '', // Will be filled from main extraction
        clientAddress: '', // Will be filled from main extraction
        chimneyType: chimneyType,
        timelineContent: timelineContent,
        imageUrls: imageUrls,
        timelineCoverImage: imageUrls[0] || '',
        scrapedImages: imageUrls.map((url, imgIndex) => ({
          id: `job-${index}-img-${imgIndex}-${Date.now()}`,
          url: url,
          alt: `Job ${index + 1} image ${imgIndex + 1}`
        }))
      };
      
      jobs.push(jobData);
    });
    
    // Sort jobs by date (newest first)
    jobs.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('Parsed jobs:', jobs);
    return jobs;
  };

  // Function to find the previous job by date
  const findPreviousJobByDate = (jobs: JobData[]): JobData | null => {
    if (jobs.length < 2) {
      return null; // Need at least 2 jobs to find a previous one
    }
    
    // Jobs are already sorted by date (newest first)
    // Return the second job (previous to the latest)
    return jobs[1];
  };

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

    // Find timeline-block div and extract content (get the first/latest one)
    const timelineBlock = doc.querySelector('div.timeline-block');
    if (timelineBlock) {
      timelineContent = timelineBlock.textContent?.trim() || "";
      
      // Extract image URLs from photo-item elements with data-full attributes
      const photoItems = timelineBlock.querySelectorAll('a.photo-item[data-full]');
      photoItems.forEach(photoItem => {
        const dataFull = photoItem.getAttribute('data-full');
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

    // Convert imageUrls to ImageItem format
    const scrapedImages: ImageItem[] = imageUrls.map((url, index) => ({
      id: `scraped-${index}-${Date.now()}`,
      url: url,
      alt: `Scraped image ${index + 1}`
    }));

    return {
      clientName,
      clientAddress: address,
      chimneyType,
      reportDate: new Date().toISOString().split('T')[0],
      timelineContent,
      imageUrls,
      timelineCoverImage,
      scrapedImages
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
      
      // Print HTML content to console
      console.log('=== HTML CONTENT ===');
      console.log(htmlContent);
      console.log('=== END HTML CONTENT ===');
      
      // Parse all jobs from HTML to find dates
      const allJobsData = parseAllJobsFromHtml(htmlContent);
      setAllJobs(allJobsData);
      
      // Parse the HTML content using our custom parser (for current job)
      const parsedData = parseHtmlContent(htmlContent);
      
      setExtractedData(parsedData);
      setShowEditForm(true);
      
      // Log the extracted data for debugging (same as Python print statements)
      console.log('=== EXTRACTED DATA ===');
      console.log('Current job data:', parsedData.timelineContent);
      console.log('All jobs found:', allJobsData.length);
      console.log('Current job images:', parsedData.imageUrls.length);
      console.log('Jobs with dates:', allJobsData.map(job => ({ date: job.date, images: job.imageUrls.length })));
      console.log('=== END EXTRACTED DATA ===');
      
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

  const handleDateSelection = (job: JobData) => {
    setSelectedDateJob(job);
    setSelectedImages([]); // Reset selected images when selecting a new date
    setShowDateSelector(false);
    setShowPreviousJobImages(true);
  };

  const handleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        // Remove image if already selected
        return prev.filter(url => url !== imageUrl);
      } else {
        // Add image if not selected
        return [...prev, imageUrl];
      }
    });
  };

  const handleSelectAllImages = () => {
    if (!selectedDateJob) return;
    
    if (selectedImages.length === selectedDateJob.imageUrls.length) {
      // If all images are selected, deselect all
      setSelectedImages([]);
    } else {
      // Select all images
      setSelectedImages([...selectedDateJob.imageUrls]);
    }
  };

  const handleMergeSelectedDateImages = () => {
    if (!selectedDateJob || selectedImages.length === 0) return;
    
    // Convert selected image URLs to ImageItem format
    const selectedImageItems: ImageItem[] = selectedImages.map((url, index) => ({
      id: `selected-${index}-${Date.now()}`,
      url: url,
      alt: `Selected image from ${selectedDateJob.date}`
    }));
    
    // Merge only selected images with current job images
    const mergedImages = [...extractedData.scrapedImages, ...selectedImageItems];
    const mergedImageUrls = [...extractedData.imageUrls, ...selectedImages];
    
    setExtractedData(prev => ({
      ...prev,
      scrapedImages: mergedImages,
      imageUrls: mergedImageUrls
    }));
    
    setShowPreviousJobImages(false);
    setSelectedDateJob(null);
    setSelectedImages([]);
    
    console.log(`Merged ${selectedImages.length} selected images from ${selectedDateJob.date}`);
  };

  const handleContinue = () => {
    // Only pass the required data to the parent component
    onDataExtracted({
      clientName: extractedData.clientName,
      clientAddress: extractedData.clientAddress,
      chimneyType: extractedData.chimneyType,
      reportDate: extractedData.reportDate,
      timelineCoverImage: extractedData.timelineCoverImage || '', // Use specific timeline cover image
      scrapedImages: extractedData.scrapedImages || []
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-8 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Report generation made easy by ChimneySweep</h2>
        <p className="text-sm sm:text-base text-gray-600"> Builds electronics inspection reports in minutes</p>
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
              onClick={() => setShowDateSelector(true)}
              disabled={!url || allJobs.length === 0}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-900 text-white rounded-md hover:bg-red-940 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              title="Select images from any available date"
            >
              Select Date Images
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  clientName: '',
                  clientAddress: '',
                  chimneyType: '',
                  reportDate: new Date().toISOString().split('T')[0],
                  timelineCoverImage: '',
                  scrapedImages: []
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
              <div className="flex flex-col items-center lg:col-span-1">
                <h5 className="font-medium text-gray-700 mb-3">House Image:</h5>
                {extractedData.timelineCoverImage ? (
                  <>
                    <img 
                      src={extractedData.timelineCoverImage} 
                      alt="Timeline Cover" 
                      className="w-48 h-50 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                    />
                    {extractedData.imageUrls.length > 1 && (
                      <button
                        onClick={() => setShowImageSelector(true)}
                        className="mt-3 px-4 py-2 bg-[#722420] text-white rounded-lg hover:bg-[#5a1d1a] transition-colors text-sm"
                      >
                        Change the house image
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-48 h-50 bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-sm text-center">No image available</p>
                  </div>
                )}
                
                {/* No House Image Button */}
                <button
                  onClick={() => setShowNoImagePopup(true)}
                  className="mt-3 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  No House Image
                </button>
              </div>
              
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

      {/* Image Selection Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Select House Image</h3>
                <button
                  onClick={() => setShowImageSelector(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Choose from the available images</p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {extractedData.imageUrls.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`House Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#722420] transition-colors"
                      onClick={() => {
                        handleDataChange('timelineCoverImage', imageUrl);
                        setShowImageSelector(false);
                      }}
                    />
                    {extractedData.timelineCoverImage === imageUrl && (
                      <div className="absolute top-2 right-2 bg-[#722420] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to select
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No House Image Popup */}
      {showNoImagePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No House Image</h3>
                <p className="text-sm text-gray-600">Would you like to proceed without a house image or select one from the available images?</p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    handleDataChange('timelineCoverImage', '');
                    setShowNoImagePopup(false);
                  }}
                  className="w-full px-4 py-2 bg-[#722420] text-white rounded-lg hover:bg-[#5a1d1a] transition-colors font-medium"
                >
                  Proceed Without Image
                </button>
                
                {extractedData.imageUrls.length > 0 && (
                  <button
                    onClick={() => {
                      setShowNoImagePopup(false);
                      setShowImageSelector(true);
                    }}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Select from Available Images
                  </button>
                )}
                
                <button
                  onClick={() => setShowNoImagePopup(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector Modal */}
      {showDateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Select Date for Images</h3>
                <button
                  onClick={() => setShowDateSelector(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose a date to view and merge its images with your current job.
              </p>
            </div>
            
            <div className="p-4">
              {allJobs.length > 0 ? (
                <div className="space-y-3">
                  {allJobs.map((job, index) => (
                    <div 
                      key={job.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleDateSelection(job)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {job.date}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.imageUrls.length} image{job.imageUrls.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {index === 0 ? 'Latest' : index === 1 ? 'Previous' : `${index + 1}${index === 2 ? 'rd' : index === 3 ? 'th' : 'th'}`}
                          </span>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dates Found</h3>
                  <p className="text-sm text-gray-600 mb-4">No jobs with dates were found in the HTML content.</p>
                  <button
                    onClick={() => setShowDateSelector(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Images Modal */}
      {showPreviousJobImages && selectedDateJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Images from {selectedDateJob.date}</h3>
                <button
                  onClick={() => {
                    setShowPreviousJobImages(false);
                    setSelectedDateJob(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Found {selectedDateJob.imageUrls.length} image{selectedDateJob.imageUrls.length !== 1 ? 's' : ''} from {selectedDateJob.date}. 
                Select the images you want to add to your current job.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAllImages}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedImages.length === selectedDateJob.imageUrls.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedImages.length} of {selectedDateJob.imageUrls.length} selected
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {selectedDateJob.imageUrls.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {selectedDateJob.imageUrls.map((imageUrl, index) => {
                      const isSelected = selectedImages.includes(imageUrl);
                      return (
                        <div 
                          key={index} 
                          className={`relative group cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => handleImageSelection(imageUrl)}
                        >
                          <img
                            src={imageUrl}
                            alt={`Image from ${selectedDateJob.date} ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg border-2 transition-all ${
                              isSelected ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          />
                          
                          {/* Selection checkbox */}
                          <div className="absolute top-2 right-2">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'bg-white border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          {/* Date overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {selectedDateJob.date}
                          </div>
                          
                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleMergeSelectedDateImages}
                      disabled={selectedImages.length === 0}
                      className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                        selectedImages.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Merge Selected Images ({selectedImages.length})
                    </button>
                    <button
                      onClick={() => {
                        setShowPreviousJobImages(false);
                        setSelectedDateJob(null);
                        setSelectedImages([]);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Found</h3>
                  <p className="text-sm text-gray-600 mb-4">No images were found for {selectedDateJob.date}.</p>
                  <button
                    onClick={() => {
                      setShowPreviousJobImages(false);
                      setSelectedDateJob(null);
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataScraper;
