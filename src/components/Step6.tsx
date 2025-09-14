import React, { useState, useEffect } from "react";
import styles from "./Step6.module.css";

interface ImageItem {
  id: string;
  url: string;
  alt?: string;
}

interface Page6Props {
  scrapedImages?: ImageItem[];
  selectedImages?: ImageItem[];
  onImageSelection?: (images: ImageItem[]) => void;
  isPDF?: boolean;
}

export const Page6: React.FC<Page6Props> = ({
  scrapedImages = [],
  selectedImages = [],
  onImageSelection,
  isPDF = false
}) => {
  const [localSelectedImages, setLocalSelectedImages] = useState<ImageItem[]>(selectedImages);

  useEffect(() => {
    setLocalSelectedImages(selectedImages);
  }, [selectedImages]);

  const handleImageToggle = (image: ImageItem) => {
    if (isPDF) return; // Don't allow selection changes in PDF mode

    const isSelected = localSelectedImages.some(img => img.id === image.id);
    let newSelection: ImageItem[];

    if (isSelected) {
      // Remove image from selection
      newSelection = localSelectedImages.filter(img => img.id !== image.id);
    } else {
      // Add image to selection (max 4)
      if (localSelectedImages.length < 4) {
        newSelection = [...localSelectedImages, image];
      } else {
        return; // Don't add if already at max
      }
    }

    setLocalSelectedImages(newSelection);
    onImageSelection?.(newSelection);
  };

  const isImageSelected = (image: ImageItem) => {
    return localSelectedImages.some(img => img.id === image.id);
  };

  return (
    <div 
      className="bg-white"
      style={isPDF ? {
        width: '595px',
        height: '842px',
        margin: '0 auto'
      } : {
        display: 'grid',
        justifyItems: 'center',
        alignItems: 'start',
        width: '100vw'
      }}
    >
      <div className="bg-white w-[595px] h-[842px]">
        <div 
          className="relative w-[546px] h-[790px] top-[26px]"
          style={{
            left: isPDF ? 'auto' : '25px',
            margin: isPDF ? '0 auto' : 'initial'
          }}
        >
          {/* Header Section */}
          <div 
            className={isPDF ? "w-[393px] h-[106px]" : "absolute w-[393px] h-[106px] top-[25px] left-[77px]"}
            style={isPDF ? {
              position: 'absolute',
              top: '25px',
              left: '55%',
              transform: 'translateX(-50%)'
            } : {}}
          >
            <div className="absolute w-[391px] h-[54px] top-[52px] left-0 bg-black rounded-[36px] border-[6px] border-solid border-[#722420]">
              <div 
                className="absolute w-[364px] top-2 left-2 [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[21px] text-center tracking-[0.42px] leading-[normal] whitespace-nowrap"
                style={{ 
                  top: isPDF ? '4px' : '8px' 
                }}
              >
                Today's Invoice 
              </div>
            </div>

            <img
              className="absolute w-[124px] h-[52px] top-0 left-[134px] aspect-[2.4] object-cover"
              alt="Logo"
              src="/logo.webp"
            />
          </div>

            {/* Images Display Area - Always show selected images only for preview */}
            <div 
              className={isPDF ? "" : "absolute top-[200px] bottom-[120px] left-[60px] right-[60px]"}
              style={isPDF ? {
                position: 'absolute',
                top: '100px',
                bottom: '120px',
                left: '70px',
                right: '40px',
                maxWidth: '466px'
              } : {}}
            >
              {localSelectedImages.length > 0 ? (
                // Show selected images with smart cropping to fit available space
                <div 
                  className="w-full h-full"
                  style={{
                    padding: isPDF ? '10px' : '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                {localSelectedImages.length === 1 ? (
                  // Single image - centered
                  <div 
                    className="relative" 
                    style={{ 
                      maxWidth: isPDF ? '80%' : '70%', 
                      maxHeight: isPDF ? '80%' : '70%',
                      marginTop: isPDF ? '70px' : '0'
                    }}
                  >
                    <img
                      src={localSelectedImages[0].url}
                      alt={localSelectedImages[0].alt || 'Project image 1'}
                      className="w-full h-full object-cover shadow-md rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : localSelectedImages.length === 2 ? (
                  // Two images - stacked vertically centered
                  <div 
                    className="flex flex-col gap-4"
                    style={{
                      maxWidth: isPDF ? '85%' : '70%',
                      maxHeight: isPDF ? '95%' : '90%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: isPDF ? '40px' : '0'
                    }}
                  >
                    {localSelectedImages.map((image, index) => (
                      <div key={image.id} className="relative top-[10px]" style={{ top: isPDF ? '25px': '0'}}>
                        <img
                          src={image.url}
                          alt={image.alt || `Project image ${index + 1}`}
                          className="shadow-md rounded-lg object-cover"
                          style={{
                            maxWidth: isPDF ? '450px' : '500px',
                            maxHeight: isPDF ? '250px' : '250px',
                        
                            width: 'auto',
                            height: 'auto'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : localSelectedImages.length === 3 ? (
                  // Three images - centered 2x2 grid
                  <div 
                    className="grid grid-cols-2 gap-4"
                    style={{
                      maxWidth: isPDF ? '90%' : '80%',
                      maxHeight: isPDF ? '90%' : '80%',
                      width: isPDF ? '450px' : 'auto',
                      height: isPDF ? '350px' : 'auto'
                    }}
                  >
                    {localSelectedImages.map((image, index) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.alt || `Project image ${index + 1}`}
                          className="w-full h-full object-cover shadow-md rounded-lg"
                          style={{
                            minHeight: isPDF ? '150px' : '150px'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                    {/* Empty space for 4th position */}
                    <div></div>
                  </div>
                ) : (
                  // Four images - centered 2x2 grid
                  <div 
                    className="grid grid-cols-2 gap-4"
                    style={{
                      maxWidth: isPDF ? '90%' : '80%',
                      maxHeight: isPDF ? '90%' : '80%',
                      width: isPDF ? '450px' : 'auto',
                      height: isPDF ? '350px' : 'auto'
                    }}
                  >
                    {localSelectedImages.map((image, index) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.alt || `Project image ${index + 1}`}
                          className="w-full h-full object-cover shadow-md rounded-lg"
                          style={{
                            minHeight: isPDF ? '150px' : '150px'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Show placeholder when no images selected
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg mb-2">No Images Selected</p>
                  <p className="text-sm">Selected images will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Selection Info (Preview mode only) */}
          

          {/* Frame Border */}
          <div 
            className={isPDF ? "w-[546px] h-[790px] border-2 border-solid border-[#722420]" : "absolute w-[546px] h-[790px] top-0 left-0 border-2 border-solid border-[#722420]"}
            style={isPDF ? {
              position: 'absolute',
              top: '0',
              left: '22.5px'
            } : {}}
          >
            <div className="relative w-[536px] h-[780px] top-[3px] left-[3px] border-2 border-solid border-[#722420]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page6;
