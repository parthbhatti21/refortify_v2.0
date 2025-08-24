import React, { useState } from 'react';
import Page1 from './Page1';
import FormInputs from './FormInputs';
import DataScraper from './DataScraper';

export interface FormData {
  // Client Information
  clientName: string;
  clientAddress: string;
  chimneyType: string;
}

const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'scrape' | 'form'>('scrape');
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientAddress: '',
    chimneyType: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleDataExtracted = (data: FormData) => {
    setFormData(data);
    setCurrentStep('form');
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Find the existing preview div that contains the Page1 component
      const previewDiv = document.querySelector('[data-preview="true"]');
      if (!previewDiv) {
        throw new Error('Preview div not found. Please ensure you are on the form step.');
      }

      // Create a temporary clone for PDF generation with adjusted positioning
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '595px';
      tempContainer.style.height = '842px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.overflow = 'hidden';
      
      // Clone the preview content
      const clonedContent = previewDiv.cloneNode(true) as HTMLElement;
      
      // Adjust the text position for PDF generation (move up by 5px)
      const titleText = clonedContent.querySelector('.absolute.w-\\[402px\\]');
      if (titleText) {
        (titleText as HTMLElement).style.top = '-5px'; // Override the top-1.5 class, move up by 5px
      }
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use html2canvas to capture the adjusted content
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 595,
        height: 842,
        scrollX: 0,
        scrollY: 0
      });
      
      // Clean up temporary container
      document.body.removeChild(tempContainer);
      
      // Convert to PDF using jsPDF
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit A4 - single page only
      const imgWidth = 210; // A4 width in mm
      const imgHeight = 297; // A4 height in mm (full page)
      
      // Add single page with the image - any overflow will be cropped
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
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

  return (
    <div className="max-w-7xl mx-auto">
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
          <DataScraper onDataExtracted={handleDataExtracted} setCurrentStep={setCurrentStep} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Input Fields Section */}
          <div className="card p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Manual Entry</h3>
              <button
                onClick={handleBackToScrape}
                className="text-[#722420] hover:text-[#5a1d1a] text-sm font-medium"
              >
                ← Back to Data Extraction
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <FormInputs formData={formData} updateFormData={updateFormData} />
              
              {/* Submit Button */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating PDF...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="card p-0">
            {/* <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h3> */}
            <div className="flex justify-center overflow-x-auto" data-preview="true">
              <Page1 formData={formData} updateFormData={updateFormData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
