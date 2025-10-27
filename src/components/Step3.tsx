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
    left: '32px', // Align content block to the left in PDF
    top: '188px',
    position: 'absolute' as const,
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
                Service Report: A Step In Time Chimney Sweeps
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
              top: '170px',
              // lineHeight: '1.9',
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '0.40px'
            }}
          >
            Dear {formData.clientName || 'c1'},
          </div>
          
          <div className="email-content" style={emailStyle}>
          <div className="itWasAContainer">
<p className="itWasA">    
It was a pleasure to provide service for your home and attached is a detailed service report for your review and a repair
estimate if applicable. This service report is in sections which are as follows:</p>
{isPDF && <><li className="itWasA">&nbsp;</li></>}
<ul className="invoiceWithDescriptionEsti" style={{ lineHeight: isPDF ? '1.8' : 'normal' }}>
<li className="itWasA" style={{ marginBottom: isPDF ? '8px' : '0' }}><span style={{ fontSize: '8px', verticalAlign: isPDF?"middle":"middle"}}>&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>Invoice with description</li>
<li className="estimatedRepairsWith" style={{ marginBottom: isPDF ? '8px' : '0' }}><span style={{ fontSize: '8px', verticalAlign: isPDF?"middle":"middle" }}>&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>Estimated Repairs with description, building codes and </li>
<li className="estimatedRepairsWith" style={{ marginBottom: isPDF ? '8px' : '0' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;inspection photographs</li>

<li className="estimatedRepairsWith" style={{ marginBottom: isPDF ? '8px' : '0' }}><span style={{ fontSize: '8px', verticalAlign: isPDF?"middle":"middle"}}>&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>Inspection Photographs</li>
<li className="estimatedRepairsWith" style={{ marginBottom: isPDF ? '8px' : '0' }}><span style={{ fontSize: '8px', verticalAlign: isPDF?"middle":"middle"}}>&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>Details to understand chimney parts</li>
<li className="estimatedRepairsWith" style={{ marginBottom: isPDF ? '8px' : '0' }}><span style={{ fontSize: '8px', verticalAlign: isPDF?"middle":"middle"}}>&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>Top hat club membership</li>
<li className="estimatedRepairsWith" style={{ marginBottom: isPDF ? '8px' : '0' }}><span style={{ fontSize: '8px', verticalAlign: isPDF?"middle":"middle"}}>&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>Thank You</li>
<li className="estimatedRepairsWith" style={{ marginBottom: isPDF ? '8px' : '0' }}><span style={{ fontSize: '8px', verticalAlign: isPDF?"middle":"middle"}}>&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>Terms and Conditions</li>
</ul>
{isPDF && <><p className="itWasA">&nbsp;</p></>}

<p className="itWasA">Thank you so much for using our service. We strive to offer the best service, the best warranties, the best quality control and the best training in our industry. Your complete satisfaction is most important to everyone of the us at A Step in Time Chimney Sweeps.</p>

{isPDF && <><p className="itWasA">&nbsp;</p></>}
<p className="itWasA">Sincerely, </p>
<p className="itWasA">Ray Gessner, P.E. </p>
<p className="itWasA">C.E.O. - A STEP IN TIME CHIMNEY SWEEPS Ray@ChimneySweep.com </p>
<p className="itWasA">833-CHIMNEY </p>
<p className="itWasA">833-244-6639</p>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page3;
