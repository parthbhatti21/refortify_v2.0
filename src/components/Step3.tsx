import React from 'react';
import './Step3.css';

interface Page3Props {
  formData: {
    clientName: string;
    clientAddress: string;
    chimneyType: string;
    reportDate: string;
  };
  updateFormData: (data: Partial<{ clientName: string; clientAddress: string; chimneyType: string; reportDate: string }>) => void;
  isPDF?: boolean; // Flag to indicate if this is for PDF generation
}

const Page3: React.FC<Page3Props> = ({ formData, isPDF = false }) => {
  // PDF Centering Fix: Calculate center positions for all elements to ensure proper centering
  // Page dimensions: 595px width x 842px height (A4)
  // Content area: 546px width x 790px height
  const PAGE_WIDTH = 595;
  const CONTENT_WIDTH = 546;
  const CONTENT_HEIGHT = 790;

  // Calculate center positions for PDF
  const centerContent = isPDF ? {
    left: `${(PAGE_WIDTH - CONTENT_WIDTH) / 2}px`, // Center the content area
    top: '15px', // Move content higher on the page for better PDF layout
    position: 'absolute' as const,
  } : {};

  const titleStyle = isPDF ? {
    left: `${(CONTENT_WIDTH - 482) / 2}px`, // Center title within content area (482px width)
    top: '5px', // Position title at the top of the content area
  } : {};

  const logoStyle = isPDF ? {
    left: `${(CONTENT_WIDTH - 124) / 2}px`, // Center logo within content area (124px width)
    top: '10px', // Position logo 10px below the top for better PDF layout
  } : {};

  const clientNameStyle = isPDF ? {
    left: `${(CONTENT_WIDTH - 157) / 2}px`, // Center client name within content area (157px width)
    top: '149px', // Adjust client name position for better spacing
  } : {};

  const emailStyle = isPDF ? {
    left: `${(CONTENT_WIDTH - 471) / 2}px`, // Center email image within content area (471px width)
    top: '178px', // Adjust email position for better spacing
  } : {};

  // Add a prominent header for the final page (only visible in preview, not in PDF)
  const renderPreviewHeader = () => {
    if (isPDF) return null;

    return (
      <div></div>
    )
  };

  return (
    <div className="page" >
      {/* Preview Header - Only shown in preview mode */}
      {renderPreviewHeader()}

      <div className="overlap-wrapper" >
        <div className="overlap" style={centerContent}>
          <div className="title" style={titleStyle}>
            <div className="overlap-group">
              <p className="text-wrapper">
                Service Report: A Step In Time Chimney Sweep
              </p>
            </div>

            <img className="logo" alt="Logo" src="/logo.webp" style={logoStyle} />
          </div>

          <div className="frame">
            <div className="rectangle" />
          </div>

          <div
            className="div"
            style={{ 
              fontFamily: 'Times New Roman, Times, serif', 
              opacity: 1, 
              fontSize: '20px',
              fontWeight: '400',
              letterSpacing: '0.40px'
            }}
          >
            Dear {formData.clientName || 'c1'},
          </div>

          <img className="email" alt="Email" src="/email.webp" style={emailStyle} />
        </div>
      </div>
    </div>
  );
};

export default Page3;
