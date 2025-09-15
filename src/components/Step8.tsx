import React from 'react';

interface ImageItem {
  id: string;
  url: string;
}

interface Page8Props {
  isPDF?: boolean;
  unusedImages?: ImageItem[];
  currentPage?: number;
  totalPages?: number;
  selectedImages?: ImageItem[]; // Images chosen on Step 6
}

const Page8: React.FC<Page8Props> = ({ isPDF = false, unusedImages = [], currentPage = 1, totalPages = 1, selectedImages = [] }) => {
  // Calculate which images to show for this page (9 images per page)
  const imagesPerPage = 9;
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const pageImages = unusedImages.slice(startIndex, endIndex);

  const selectedIdSet = new Set((selectedImages || []).map(img => img.id));

  if (isPDF) {
    return (
      <div style={{
        width: '595px',
        height: '842px',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        fontFamily: 'Inter, Arial, sans-serif',
        position: 'relative'
      }}>
        <div style={{
          width: '546px',
          height: '790px',
          position: 'relative',
          top: '26px',
          left: '0px'
        }}>
          {/* Header with Logo and Title */}
          <div style={{
            position: 'absolute',
            width: '393px',
            height: '106px',
            top: '25px',
            left: '77px'
          }}>
            {/* Title Background */}
            <div style={{
              position: 'absolute',
              width: '391px',
              height: '54px',
              top: '52px',
              left: '0px',
              backgroundColor: 'black',
              borderRadius: '36px',
              border: '6px solid #722420'
            }}>
              <div style={{
                position: 'absolute',
                width: '364px',
                top: '2px',
                left: '2px',
                fontFamily: 'Inter-Bold, Helvetica',
                fontWeight: 'bold',
                color: 'white',
                fontSize: '21px',
                textAlign: 'center',
                letterSpacing: '0.42px',
                lineHeight: 'normal',
                whiteSpace: 'nowrap'
              }}>
                Inspection Images
              </div>
            </div>

            {/* Logo */}
            <img
              style={{
                position: 'absolute',
                width: '124px',
                height: '52px',
                top: '0px',
                left: '134px',
                objectFit: 'cover'
              }}
              alt="Logo"
              src="/logo.webp"
            />
          </div>

          {/* Main Border */}
          <div style={{
            position: 'absolute',
            width: '546px',
            height: '790px',
            top: '0px',
            left: '0px',
            border: '2px solid #722420'
          }}>
            <div style={{
              position: 'relative',
              width: '536px',
              height: '780px',
              top: '3px',
              left: '3px',
              border: '2px solid #722420'
            }} />
          </div>

          {/* Images Grid - 3x3 */}
          <div style={{
            position: 'absolute',
            top: '146px',
            left: '22px',
            width: '502px',
            height: '602px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {pageImages.map((image, index) => (
              <div
                key={image.id}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  border: '1px solid #722420'
                }}
              >
                <img
                  src={image.url}
                  alt={`Inspection image ${startIndex + index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {/* {selectedIdSet.has(image.id) && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      letterSpacing: '0.4px',
                      display: 'inline-block',
                      height: '14px',
                      lineHeight: '14px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {'\u00A0Invoice\u00A0'}
                  </div>
                )} */}
              </div>
            ))}
            
            {/* Fill empty slots with placeholder */}
            {Array.from({ length: 9 - pageImages.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                style={{
                  width: '100%',
                  height: '100%',
                  
                
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#999'
                }}
              >
    
              </div>
            ))}
          </div>

         
        </div>
      </div>
    );
  }

  // Non-PDF view
  return (
    <div className="bg-white grid justify-items-center [align-items:start] w-screen">
      <div className="bg-white w-[595px] h-[842px]">
        <div className="relative w-[546px] h-[790px] top-[26px] left-[25px]">
          <div className="absolute w-[393px] h-[106px] top-[25px] left-[77px]">
            <div className="absolute w-[391px] h-[54px] top-[52px] left-0 bg-black rounded-[36px] border-[6px] border-solid border-[#722420]">
              <div className="absolute w-[364px] top-2 left-2 [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[21px] text-center tracking-[0.42px] leading-[normal] whitespace-nowrap">
                Inspection Images
              </div>
            </div>
            <img
              className="absolute w-[124px] h-[52px] top-0 left-[134px] aspect-[2.4] object-cover"
              alt="Logo"
              src="/logo.webp"
            />
          </div>
          <div className="absolute w-[546px] h-[790px] top-0 left-0 border-2 border-solid border-[#722420]">
            <div className="relative w-[536px] h-[780px] top-[3px] left-[3px] border-2 border-solid border-[#722420]" />
          </div>
          
          <div className="absolute left-[22px] top-[146px] w-[502px] h-[602px] border  bg-white" />
          
          {/* Images Grid - 3x3 */}
          <div className="absolute top-[146px] left-[22px] w-[502px] h-[602px] grid grid-cols-3 grid-rows-3 gap-2">
            {pageImages.map((image, index) => (
              <div
                key={image.id}
                className="w-full h-full overflow-hidden border border-[#722420] bg-white relative"
              >
                <img
                  src={image.url}
                  alt={`Inspection image ${startIndex + index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedIdSet.has(image.id) && (
                  <div className="absolute bottom-1 left-1 bg-black text-white text-[12px] font-bold px-1.5 py-0.5 rounded">
                    Invoice
                  </div>
                )}
              </div>
            ))}
            
            {/* Fill empty slots with placeholder */}
            {Array.from({ length: 9 - pageImages.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-full h-full   bg-white flex items-center justify-center text-gray-500 text-xs"
              >
               
              </div>
            ))}
          </div>

          {/* Page Number */}
          
        </div>
      </div>
    </div>
  );
};

export default Page8;
