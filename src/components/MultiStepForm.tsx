import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import Page4 from './Page4';
import Page5 from './Page5';
import DataScraper from './DataScraper';
import ImageCropper from './ImageCropper';

export interface FormData {
  // Client Information
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  reportDate: string;
  timelineCoverImage?: string; // Timeline cover image from scraped data
  invoiceData?: {
    invoiceNumber: string;
    paymentMethod: string;
    paymentNumber: string;
    rows: Array<{
      id: string;
      description: string;
      unit: string;
      price: string;
    }>;
  };
}

const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'scrape' | 'form'>('scrape');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientAddress: '',
    chimneyType: '',
    reportDate: new Date().toISOString().split('T')[0],
    timelineCoverImage: '',
    invoiceData: {
      invoiceNumber: '',
      paymentMethod: '',
      paymentNumber: '',
      rows: []
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [preferGoogleDocs, setPreferGoogleDocs] = useState(true); // User preference for PDF viewing
  const [cropData, setCropData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Block mobile devices until they switch to desktop view
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      
      if (isMobileDevice) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleDataExtracted = (data: FormData) => {
    setFormData(data);
    setCurrentStep('form');
  };

  const handleManualEntry = () => {
    setFormData({
      clientName: '',
      clientAddress: '',
      chimneyType: '',
      reportDate: new Date().toISOString().split('T')[0],
      timelineCoverImage: '',
      invoiceData: {
        invoiceNumber: '',
        paymentMethod: '',
        paymentNumber: '',
        rows: []
      }
    });
    setCurrentStep('form');
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Find the existing preview div that contains the Page components
      const previewDiv = document.querySelector('[data-preview="true"]');
      if (!previewDiv) {
        throw new Error('Preview div not found. Please ensure you are on the form step.');
      }

      // Use state-based mobile detection
      const isMobileDevice = isMobile;
      
      // Create a temporary clone for PDF generation with adjusted positioning
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '595px';
      tempContainer.style.height = '842px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.margin = '0';
      tempContainer.style.padding = '0';
      tempContainer.style.border = 'none';
      tempContainer.style.outline = 'none';
      
      // Clone the preview content
      const clonedContent = previewDiv.cloneNode(true) as HTMLElement;
      
      // Adjust the text position for PDF generation (move up by 5px)
      const titleText = clonedContent.querySelector('.absolute.w-\\[402px\\]');
      if (titleText) {
        (titleText as HTMLElement).style.top = '-5px'; // Override the top-1.5 class, move up by 5px
      }
      
      // Mobile-specific adjustments for PDF generation
      if (isMobileDevice) {
        // Force desktop-like scaling and positioning for mobile PDF generation
        const page1Element = clonedContent.querySelector('[data-preview="true"] > div') as HTMLElement;
        if (page1Element) {
          // Reset any mobile-specific transforms
          page1Element.style.transform = 'none';
          page1Element.style.scale = '1';
          page1Element.style.width = '595px';
          page1Element.style.height = '842px';
          page1Element.style.maxWidth = '595px';
          page1Element.style.maxHeight = '842px';
          
          // Ensure proper positioning
          page1Element.style.position = 'relative';
          page1Element.style.left = '0';
          page1Element.style.top = '0';
          
          // Remove any margins that might cause extra spacing
          page1Element.style.margin = '0';
          page1Element.style.padding = '0';
        }
        
        // Reset any mobile-specific styles on child elements
        const allElements = clonedContent.querySelectorAll('*');
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          // Remove mobile-specific transforms and positioning
          if (element.style.transform && element.style.transform.includes('scale')) {
            element.style.transform = 'none';
          }
          if (element.style.scale) {
            element.style.scale = '1';
          }
          
          // Remove any margins and padding that could cause extra spacing
          element.style.margin = '0';
          element.style.padding = '0';
          
          // Ensure no border spacing
          if (element.tagName === 'TABLE') {
            element.style.borderCollapse = 'collapse';
            element.style.borderSpacing = '0';
          }
        });
      }
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      

      
      // Convert to PDF using jsPDF
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      
      // Generate PDF with both pages
      await generateMultiPagePDF(pdf, isMobileDevice);
      
      // Save PDF directly (no Google Docs viewer)
        const fileName = `chimney_report_${formData.clientName || 'client'}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again. Make sure all components are visible in the preview.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Check if required fields are filled
    if (!formData.clientName || !formData.clientAddress || !formData.chimneyType) {
      alert('Please fill in all required fields before generating the report.');
      return;
    }
    
    // Generate PDF
    await generatePDF();
  };

  const handleBackToScrape = () => {
    setCurrentStep('scrape');
  };

  const handleCropImage = () => {
    setIsCropping(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    updateFormData({ timelineCoverImage: croppedImageUrl });
    setIsCropping(false);
    setCropData(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setCropData(null);
  };

  // Calculate total pages including invoice pages
  const MAX_TABLE_HEIGHT = 400; // Max height for table container
  const ROW_HEIGHT = 50; // Estimated row height
  
  const maxRowsPerPage = Math.floor(MAX_TABLE_HEIGHT / ROW_HEIGHT);
  const ITEMS_PER_PAGE = Math.max(1, maxRowsPerPage); // At least 1 row per page
  
  // Smart pagination: ensure no row is cut off
  const calculateSmartInvoicePages = () => {
    const totalRows = formData.invoiceData?.rows?.length || 0;
    if (totalRows === 0) return 1;
    
    // Use 5 rows per page to ensure no cut-offs
    const ROWS_PER_PAGE = 5;
    return Math.ceil(totalRows / ROWS_PER_PAGE);
  };
  
  const totalInvoicePages = calculateSmartInvoicePages();
  const totalPages = 5 + Math.max(0, totalInvoicePages - 1); // 5 base pages + additional invoice pages

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to compress images before PDF generation
  const compressImage = async (canvas: HTMLCanvasElement, format: 'JPEG' | 'PNG', quality: number): Promise<string> => {
    return new Promise((resolve) => {
      if (format === 'JPEG') {
        // Compress to JPEG with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } else {
        // PNG compression (PNG is already compressed, but we can optimize)
        const compressedDataUrl = canvas.toDataURL('image/png');
        resolve(compressedDataUrl);
      }
    });
  };

  // Function to create optimized canvas for better compression
  const createOptimizedCanvas = (originalCanvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): HTMLCanvasElement => {
    const optimizedCanvas = document.createElement('canvas');
    const ctx = optimizedCanvas.getContext('2d');
    
    if (ctx) {
      optimizedCanvas.width = targetWidth;
      optimizedCanvas.height = targetHeight;
      
      // Use high-quality image smoothing for better results
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the original canvas onto the optimized one
      ctx.drawImage(originalCanvas, 0, 0, targetWidth, targetHeight);
    }
    
    return optimizedCanvas;
  };

  // Function to generate multi-page PDF
  const generateMultiPagePDF = async (pdf: any, isMobileDevice: boolean) => {
    const imgWidth = 210; // A4 width in mm
    const imgHeight = 297; // A4 height in mm (full page)
    
    console.log('PDF Generation - Total Pages:', totalPages);
    console.log('PDF Generation - Invoice Data Rows:', formData.invoiceData?.rows?.length || 0);
    
    // Generate all pages dynamically
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log('Generating PDF Page:', pageNum);
      const pageCanvas = await generatePageCanvas(pageNum);
      const optimizedCanvas = createOptimizedCanvas(pageCanvas, 842, 1190);
      
      // Use different compression for page 4 (chimney images)
      const compressionQuality = pageNum === 4 ? 0.9 : 0.78;
      const pageImgData = await compressImage(optimizedCanvas, 'JPEG', compressionQuality);
      
      if (pageNum > 1) {
        pdf.addPage();
      }
      
    if (isMobileDevice) {
        pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
    } else {
        pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }
    }
  };

  // Function to generate canvas for specific page
  const generatePageCanvas = async (pageNumber: number) => {
    // Create temporary container for the specific page
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '595px';
    tempContainer.style.height = '842px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.margin = '0';
    tempContainer.style.padding = '0';
    tempContainer.style.border = 'none';
    tempContainer.style.outline = 'none';
    
    // Add PDF-specific classes and attributes
    tempContainer.className = 'pdf-generation';
    tempContainer.setAttribute('data-pdf', 'true');
    
    // Create the page component
    const pageElement = pageNumber === 1 ? 
      React.createElement(Page1, { formData, updateFormData, isPDF: true, timelineCoverImage: formData.timelineCoverImage }) :
      pageNumber === 2 ?
      React.createElement(Page2, { formData, updateFormData, isPDF: true }) :
      pageNumber === 3 ?
      React.createElement(Page3, { formData, updateFormData, isPDF: true }) :
      pageNumber === 4 ?
      React.createElement(Page4, { chimneyType: formData.chimneyType, isPDF: true }) :
      pageNumber === 5 ?
      React.createElement(Page5, { isPDF: true, invoiceData: formData.invoiceData, currentInvoicePage: 1 }) :
      pageNumber > 5 ?
      React.createElement(Page5, { isPDF: true, invoiceData: formData.invoiceData, currentInvoicePage: pageNumber - 4 }) :
      React.createElement(Page5, { isPDF: true, invoiceData: formData.invoiceData, currentInvoicePage: 1 });
    
    // Render the page to the container
    const root = ReactDOM.createRoot(tempContainer);
    root.render(pageElement);
    
    document.body.appendChild(tempContainer);
    
    // Wait for rendering and CSS to be applied
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Debug: Log the positioning of key elements
    if (pageNumber === 3) {
      const overlapElement = tempContainer.querySelector('.overlap') as HTMLElement;
      const titleElement = tempContainer.querySelector('.title') as HTMLElement;
      const clientNameElement = tempContainer.querySelector('.div') as HTMLElement;
      const emailElement = tempContainer.querySelector('.email') as HTMLElement;
      
      console.log('PDF Generation Debug - Page 3:');
      console.log('Overlap position:', overlapElement?.style.left, overlapElement?.style.top);
      console.log('Title position:', titleElement?.style.left, titleElement?.style.top);
      console.log('Client name position:', clientNameElement?.style.left, clientNameElement?.style.top);
      console.log('Email position:', emailElement?.style.left, emailElement?.style.top);
    }
    
    // Use html2canvas to capture the page with optimized settings
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(tempContainer, {
      scale: 1.25, // reduce raster size for file size control
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 595,
      height: 842,
      scrollX: 0,
      scrollY: 0,
      // Additional compression optimizations
      removeContainer: true,
      foreignObjectRendering: false
    });
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    return canvas;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mobile Blocking Overlay */}
      {isMobile && (
        <div className="mobile-block-overlay">
          <div className="mobile-block-content">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-[#722420] mb-4">Mobile Device Detected</h2>
            <p className="text-gray-700 mb-6">
              This website requires Desktop View for the best experience. Please switch your browser to Desktop Mode.
            </p>
            
            <div className="bg-red-50 rounded-lg p-4 mb-6 text-left border border-red-200">
              <h3 className="font-semibold text-black mb-2">How to switch to Desktop View:</h3>
              <div className="space-y-2 text-sm text-black">
                <div><strong>Safari:</strong> Tap AA → Request Desktop Website</div>
                <div><strong>Chrome:</strong> Tap ⋮ → Desktop Site</div>
                <div><strong>Firefox:</strong> Tap ⋮ → Desktop Site</div>
                <div><strong>Edge:</strong> Tap ⋯ → Desktop Site</div>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#722420] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5a1d1a] transition-colors"
            >
              I've Switched to Desktop View
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              After switching, tap this button to refresh the page
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-4 sm:mb-8 text-center px-2">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">Chimney Inspection Report Generator</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {currentStep === 'scrape' 
            ? 'Extract data from company sources or manually input client information' 
            : 'Review and finalize inspection report data'
          }
        </p>
      </div>

      {/* Step Indicator - Only show on scrape step */}
      {currentStep === 'scrape' && (
        <div className="mb-4 sm:mb-8 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center text-[#722420]">
              <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium bg-[#722420] text-white">
                1
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium">Data Collection</span>
            </div>
            <div className="hidden sm:block w-16 h-1 bg-gray-200"></div>
            <div className="sm:hidden w-1 h-8 bg-gray-200"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium bg-gray-200 text-gray-600">
                2
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium">Report Generation ({totalPages} Pages)</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {currentStep === 'scrape' ? (
        <div className="card p-4 sm:p-8">
          <DataScraper onDataExtracted={handleDataExtracted} setCurrentStep={setCurrentStep} setFormData={setFormData} />
        </div>
      ) : (
        <>
          {/* Form Step Progress Indicator */}
          <div className="mb-6 px-2">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${currentPage >= 1 ? 'text-[#722420]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentPage >= 1 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentPage >= 1 ? '✓' : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Client Info</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className={`flex items-center ${currentPage >= 2 ? 'text-[#722420]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentPage >= 2 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentPage >= 2 ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Company Info</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className={`flex items-center ${currentPage >= 3 ? 'text-[#722420]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentPage >= 3 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentPage >= 3 ? '✓' : '3'}
                </div>
                <span className="ml-2 text-sm font-medium">Service Report</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className={`flex items-center ${currentPage >= 4 ? 'text-[#722420]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentPage >= 4 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentPage >= 4 ? '✓' : '4'}
                </div>
                <span className="ml-2 text-sm font-medium">Chimney Type</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className={`flex items-center ${currentPage === 5 ? 'text-[#722420]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentPage === 5 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  5
                </div>
                <span className="ml-2 text-sm font-medium">Invoice</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Input Fields Section */}
          <div className="card p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {currentPage === 1 ? 'Manual Entry' : currentPage === 2 ? 'Page 2 - Static Content' : currentPage === 3 ? 'Page 3 - Service Report' : currentPage === 4 ? 'Page 4 - Chimney Type' : 'Page 5 - Invoice'}
              </h3>
              <button
                onClick={handleBackToScrape}
                className="text-[#722420] hover:text-[#5a1d1a] text-sm font-medium"
              >
                ← Back to Data Extraction
              </button>
            </div>
            
            {/* Final Report Generation Indicator (now on Page 5) */}
            {currentPage === 5 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-green-800 mb-1">Ready to Generate Report!</h4>
                    <p className="text-sm text-green-700">
                      You've completed all the required information. Review the preview on the right and click "Generate Report" below to create your PDF.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {currentPage === 1 ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Client Name */}
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => updateFormData({ clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                      placeholder="Enter client name"
                    />
                  </div>
                  
                  {/* Client Address */}
                  <div>
                    <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Client Address
                    </label>
                    <textarea
                      id="clientAddress"
                      value={formData.clientAddress}
                      onChange={(e) => updateFormData({ clientAddress: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                      placeholder="Enter client address"
                    />
                  </div>
                  
                  {/* Chimney Type */}
                  <div>
                    <label htmlFor="chimneyType" className="block text-sm font-medium text-gray-700 mb-2">
                      Chimney Type
                    </label>
                    <select
                      id="chimneyType"
                      value={formData.chimneyType}
                      onChange={(e) => updateFormData({ chimneyType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    >
                      <option value="">Select chimney type</option>
                      <option value="masonry">Masonry</option>
                      <option value="prefabricated">Prefabricated</option>
                    </select>
                  </div>

                  {/* Report Date */}
                  <div>
                    <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Report Date
                    </label>
                    <input
                      type="date"
                      id="reportDate"
                      value={formData.reportDate}
                      onChange={(e) => updateFormData({ reportDate: e.target.value })}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-[#722420] text-center font-medium cursor-pointer hover:border-gray-400 transition-colors"
                      style={{
                          fontSize: '16px',
                          minHeight: '48px'
                      }}
                    />
                  </div>

                  {/* House Image Upload - Only show if no timelineCoverImage exists */}
                  {!formData.timelineCoverImage && (
                    <div className="space-y-4">
                      
                      
                      
                      <div>
                        <label htmlFor="imageUrlInput" className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            id="imageUrlInput"
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-[#722420]"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const url = (e.target as HTMLInputElement).value.trim();
                                if (url) {
                                  updateFormData({ timelineCoverImage: url });
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const urlInput = document.getElementById('imageUrlInput') as HTMLInputElement;
                              const url = urlInput.value.trim();
                              if (url) {
                                updateFormData({ timelineCoverImage: url });
                              }
                            }}
                            className="px-4 py-2 bg-[#722420] text-white rounded-lg hover:bg-[#5a1d1a] transition-colors text-sm"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show existing image info if timelineCoverImage exists */}
                  {formData.timelineCoverImage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">House Image Available</p>
                          <p className="text-xs text-green-600">Image has been extracted or uploaded</p>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCropImage()}
                          className="ml-7 p-6 py-3 text-xs bg-[#722420] text-white rounded hover:bg-[#5a1d1a] transition-colors"
                        >
                          ✂️ Crop Image
                        </button>
                        <br />
                        <button
                          type="button"
                          onClick={() => updateFormData({ timelineCoverImage: '' })}
                          className="text-sm text-[#722420] hover:text-black underline"
                        >
                          Remove image to upload a new one
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            ) : currentPage === 2 ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 2 - Static Content</h4>
                  <p className="text-black mb-4">
                    This page contains company credentials and insurance information that cannot be edited.
                  </p>
                  <p className="text-sm text-black">
                    All information is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : currentPage === 3 ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="page3ClientName" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name for Greeting
                  </label>
                  <input
                    type="text"
                    id="page3ClientName"
                    value={formData.clientName}
                    onChange={(e) => updateFormData({ clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    placeholder="Enter client name for greeting"
                  />
                </div>
              </div>
            ) : currentPage === 4 ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 4 - Static Content</h4>
                  <p className="text-black mb-4">
                    This page summarizes the chimney type selection and is not editable.
                  </p>
                  <p className="text-sm text-black">
                    The content is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Invoice Number */}
                <div>
                  <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={formData.invoiceData?.invoiceNumber || ''}
                    onChange={(e) => updateFormData({ 
                      invoiceData: { 
                        invoiceNumber: e.target.value,
                        paymentMethod: formData.invoiceData?.paymentMethod || '',
                        paymentNumber: formData.invoiceData?.paymentNumber || '',
                        rows: formData.invoiceData?.rows || []
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    placeholder="Enter invoice number"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={formData.invoiceData?.paymentMethod || ''}
                    onChange={(e) => updateFormData({ 
                      invoiceData: { 
                        invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                        paymentMethod: e.target.value,
                        paymentNumber: formData.invoiceData?.paymentNumber || '',
                        rows: formData.invoiceData?.rows || []
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Payment Number */}
                <div>
                  <label htmlFor="paymentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="paymentNumber"
                    value={formData.invoiceData?.paymentNumber || ''}
                    onChange={(e) => updateFormData({ 
                      invoiceData: { 
                        invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                        paymentMethod: formData.invoiceData?.paymentMethod || '',
                        paymentNumber: e.target.value,
                        rows: formData.invoiceData?.rows || []
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    placeholder="Enter payment number (check #, transaction ID, etc.)"
                  />
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Invoice Items
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newRow = {
                          id: Date.now().toString(),
                          description: '',
                          unit: '',
                          price: ''
                        };
                        updateFormData({ 
                          invoiceData: { 
                            invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                            paymentMethod: formData.invoiceData?.paymentMethod || '',
                            paymentNumber: formData.invoiceData?.paymentNumber || '',
                            rows: [...(formData.invoiceData?.rows || []), newRow]
                          } 
                        });
                      }}
                      className="px-3 py-1 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] text-sm"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(formData.invoiceData?.rows || []).map((row, index) => (
                      <div key={row.id} className="flex space-x-2 p-2 border border-gray-200 rounded-md">
                        <input
                          type="text"
                          placeholder="Description"
                          value={row.description}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, description: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={row.unit}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, unit: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                        />
                        <input
                          type="text"
                          placeholder="Price"
                          value={row.price}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, price: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedRows = (formData.invoiceData?.rows || []).filter(r => r.id !== row.id);
                            updateFormData({
                              invoiceData: {
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              }
                            });
                          }}
                          className="px-2 py-1 bg-[#722420] text-white rounded hover:bg-[#5a1d1a] text-sm flex items-center justify-center"
                          title="Delete item"
                        >
                          <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {(!formData.invoiceData?.rows || formData.invoiceData.rows.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No items added yet. Click "Add Item" to add invoice items.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button - Only show on Page 5 (last page) */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              {currentPage === 5 ? (
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="w-full btn-primary"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating PDF...' : 'Generate Report'}
                </button>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-3">
                    {currentPage === 1 ? 'Fill in the client information above' : currentPage === 2 ? 'Review the static content' : currentPage === 3 ? 'Review service report details' : 'Review chimney type details'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Navigate to Page 5 to generate your report
                  </p>
                </div>
              )}
              
              {/* Mobile optimization note */}
              {isMobile && currentPage === 5 && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                  📱 Mobile optimized: PDF will be generated with desktop-quality layout
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="card p-0">
            {/* Page Navigation */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Report Preview
                
              </h3>
              <div className="flex items-center space-x-2">
                {currentPage > 1 && (
                  <button
                    onClick={handlePrevPage}
                    className="px-3 py-1 text-sm bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] transition-colors"
                  >
                    ← Page {currentPage - 1}
                  </button>
                )}
                <span className="text-sm text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <button
                    onClick={handleNextPage}
                    className="px-3 py-1 text-sm bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] transition-colors"
                  >
                    Page {currentPage + 1} →
                  </button>
                )}
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex justify-center overflow-x-auto" data-preview="true">
                          {currentPage === 1 ? (
              <Page1 formData={formData} updateFormData={updateFormData} timelineCoverImage={formData.timelineCoverImage} />
            ) : currentPage === 2 ? (
              <Page2 formData={formData} updateFormData={updateFormData} />
              ) : currentPage === 3 ? (
              <Page3 formData={formData} updateFormData={updateFormData} />
              ) : currentPage === 4 ? (
                <Page4 chimneyType={formData.chimneyType} />
              ) : currentPage === 5 ? (
                <Page5 
                  invoiceData={formData.invoiceData} 
                  updateInvoiceData={(data) => updateFormData({ invoiceData: data })}
                  currentInvoicePage={1}
                />
              ) : currentPage > 5 ? (
                <Page5 
                  invoiceData={formData.invoiceData} 
                  updateInvoiceData={(data) => updateFormData({ invoiceData: data })}
                  currentInvoicePage={currentPage - 4}
                />
              ) : null}
            </div>
            
            {/* Mobile preview instructions */}
            {isMobile && (
              <div className="p-3 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
                <p className="text-xs text-blue-700 font-medium">
                  📱 Desktop view enabled for better experience
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Full layout visible on mobile devices • Navigate between pages
                </p>
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Image Cropping Modal */}
      {isCropping && formData.timelineCoverImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
                  <p className="text-sm text-gray-600">
                    {window.innerWidth <= 768 
                      ? "Touch and drag to crop. Use corners to resize."
                      : "Drag to move, use corners to resize. Maintains aspect ratio for optimal display."
                    }
                  </p>
                </div>
                <button
                  onClick={handleCropCancel}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden p-2 sm:p-4">
              <ImageCropper
                imageUrl={formData.timelineCoverImage}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
                aspectRatio={284/220} // Match the display dimensions in Page1
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
