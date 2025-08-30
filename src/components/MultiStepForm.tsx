import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Page1 from './Page1';
import Page2 from './Page2';
import DataScraper from './DataScraper';

export interface FormData {
  // Client Information
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  reportDate: string;
  timelineCoverImage?: string; // Timeline cover image from scraped data
}

const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'scrape' | 'form'>('scrape');
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientAddress: '',
    chimneyType: '',
    reportDate: new Date().toISOString().split('T')[0],
    timelineCoverImage: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      timelineCoverImage: ''
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
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Generate PDF with both pages
      await generateMultiPagePDF(pdf, isMobileDevice);
      
      // Download the PDF
      const fileName = `chimney_report_${formData.clientName || 'client'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Show success message
      alert('Report generated successfully!');
      
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

  const handleNextPage = () => {
    setCurrentPage(2);
  };

  const handlePrevPage = () => {
    setCurrentPage(1);
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
    
    // Generate Page 1 with optimization
    const page1Canvas = await generatePageCanvas(1);
    const optimizedPage1Canvas = createOptimizedCanvas(page1Canvas, 1190, 1684); // 2x scale for quality
    const page1ImgData = await compressImage(optimizedPage1Canvas, 'JPEG', 0.85); // Compress to JPEG with 85% quality
    
    // Generate Page 2 with optimization
    const page2Canvas = await generatePageCanvas(2);
    const optimizedPage2Canvas = createOptimizedCanvas(page2Canvas, 1190, 1684); // 2x scale for quality
    const page2ImgData = await compressImage(optimizedPage2Canvas, 'JPEG', 0.85); // Compress to JPEG with 85% quality
    
    // Add both pages to PDF
    if (isMobileDevice) {
      pdf.addImage(page1ImgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
      pdf.addPage();
      pdf.addImage(page2ImgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
    } else {
      pdf.addImage(page1ImgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.addPage();
      pdf.addImage(page2ImgData, 'JPEG', 0, 0, imgWidth, imgHeight);
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
        React.createElement(Page2, { formData, updateFormData, isPDF: true });
    
    // Render the page to the container
    const root = ReactDOM.createRoot(tempContainer);
    root.render(pageElement);
    
    document.body.appendChild(tempContainer);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
          // Use html2canvas to capture the page with optimized settings
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(tempContainer, {
        scale: 1.5, // Lower initial scale for better compression
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

      {/* Step Indicator */}
      <div className="mb-4 sm:mb-8 px-2">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className={`flex items-center ${currentStep === 'scrape' ? 'text-[#722420]' : 'text-gray-400'}`}>
            <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
              currentStep === 'scrape' ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm sm:text-base font-medium">Data Collection</span>
          </div>
          <div className="hidden sm:block w-16 h-1 bg-gray-200"></div>
          <div className="sm:hidden w-1 h-8 bg-gray-200"></div>
          <div className={`flex items-center ${currentStep === 'form' ? 'text-[#722420]' : 'text-gray-400'}`}>
            <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
              currentStep === 'form' ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm sm:text-base font-medium">Report Generation</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentStep === 'scrape' ? (
        <div className="card p-4 sm:p-8">
          <DataScraper onDataExtracted={handleDataExtracted} setCurrentStep={setCurrentStep} setFormData={setFormData} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Input Fields Section */}
          <div className="card p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {currentPage === 1 ? 'Manual Entry' : 'Page 2 - Static Content'}
              </h3>
              <button
                onClick={handleBackToScrape}
                className="text-[#722420] hover:text-[#5a1d1a] text-sm font-medium"
              >
                ← Back to Data Extraction
              </button>
            </div>
            
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
                    <div>
                      <label htmlFor="houseImageUpload" className="block text-sm font-medium text-gray-700 mb-2">
                        Upload House Image
                      </label>
                      <input
                        type="file"
                        id="houseImageUpload"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    const imageUrl = event.target?.result as string;
                                    updateFormData({ timelineCoverImage: imageUrl });
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-[#722420] text-center font-medium cursor-pointer hover:border-gray-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#722420] file:text-white hover:file:bg-[#5a1d1a]"
                      />
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
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => updateFormData({ timelineCoverImage: '' })}
                          className="text-xs text-green-700 hover:text-green-800 underline"
                        >
                          Remove image to upload a new one
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating PDF...' : 'Generate a Report'}
                  </button>
                  
                  {/* Mobile optimization note */}
                  {isMobile && (
                    <div className="mt-3 text-xs text-gray-500 text-center">
                      📱 Mobile optimized: PDF will be generated with desktop-quality layout
                    </div>
                  )}
                </div>
              </form>
            ) : (
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

                {/* Generate Button for Page 2 */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    className="w-full btn-primary"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating PDF...' : 'Generate a Report'}
                  </button>
                  
                  {/* Mobile optimization note */}
                  {isMobile && (
                    <div className="mt-3 text-xs text-gray-500 text-center">
                      📱 Mobile optimized: PDF will be generated with desktop-quality layout
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="card p-0">
            {/* Page Navigation */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Page 1
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Page {currentPage} of 2
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === 2}
                  className="px-3 py-1 text-sm bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Page 2 →
                </button>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex justify-center overflow-x-auto" data-preview="true">
              {currentPage === 1 ? (
                <Page1 formData={formData} updateFormData={updateFormData} timelineCoverImage={formData.timelineCoverImage} />
              ) : (
                <Page2 formData={formData} updateFormData={updateFormData} />
              )}
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
      )}
    </div>
  );
};

export default MultiStepForm;
