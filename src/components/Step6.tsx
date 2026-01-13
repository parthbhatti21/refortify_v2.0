import React, { useState, useEffect } from "react";
import styles from "./Step6.module.css";

interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  pageNumber?: number; // Page number this image belongs to (1-indexed)
}

interface Page6Props {
  scrapedImages?: ImageItem[];
  selectedImages?: ImageItem[];
  onImageSelection?: (images: ImageItem[]) => void;
  isPDF?: boolean;
  onImagePositionChange?: (imageId: string, x: number, y: number, width: number, height: number, pageNumber?: number) => void;
  textPositionX?: number;
  textPositionY?: number;
  onTextPositionChange?: (x: number, y: number, pageNumber?: number) => void;
  currentPage?: number;
  onPageChange?: (pageNumber: number) => void;
  totalPages?: number;
  onTotalPagesChange?: (totalPages: number) => void;
}

const MAX_IMAGES_PER_PAGE = 4;

export const Page6: React.FC<Page6Props> = ({
  scrapedImages = [],
  selectedImages = [],
  onImageSelection,
  isPDF = false,
  onImagePositionChange,
  textPositionX,
  textPositionY,
  onTextPositionChange,
  currentPage: propCurrentPage,
  onPageChange,
  totalPages: propTotalPages,
  onTotalPagesChange
}) => {
  const [localSelectedImages, setLocalSelectedImages] = useState<ImageItem[]>(selectedImages);
  const [currentPage, setCurrentPage] = useState<number>(propCurrentPage ?? 1);
  const [textPositions, setTextPositions] = useState<Record<number, { x: number; y: number }>>({});
  const pageContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Calculate total pages needed based on image count
  const calculateTotalPages = (images: ImageItem[]) => {
    if (images.length === 0) return 1;
    return Math.max(1, Math.ceil(images.length / MAX_IMAGES_PER_PAGE));
  };
  
  const [totalPages, setTotalPages] = useState<number>(propTotalPages ?? calculateTotalPages(selectedImages));
  
  // State for dragging/resizing each image
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [resizingImageId, setResizingImageId] = useState<string | null>(null);
  const [resizeType, setResizeType] = useState<'width' | 'height' | 'both' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // State for dragging text
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragStart, setTextDragStart] = useState({ x: 0, y: 0 });
  
  // Get default text position - X is always centered, only Y varies
  const getDefaultTextPosition = React.useMemo(() => {
    const centerX = 273; // Always center (546/2 = 273)
    const currentPageImages = localSelectedImages.filter(img => (img.pageNumber || 1) === currentPage);
    const imageCount = currentPageImages.length;
    
    // Check if we have saved position for this page
    if (textPositions[currentPage]) {
      return textPositions[currentPage];
    }
    
    // Use prop position if available
    if (textPositionY !== undefined) {
      return { x: centerX, y: textPositionY };
    }
    
    // Default Y position based on image count on current page
    if (imageCount === 1) {
      return { x: centerX, y: isPDF ? 580 : 620 };
    } else if (imageCount === 2) {
      return { x: centerX, y: isPDF ? 670 : 690 };
    } else {
      return { x: centerX, y: isPDF ? 690 : 690 };
    }
  }, [textPositionY, currentPage, localSelectedImages, textPositions, isPDF]);
  
  const centerX = 273; // Always center
  const [localTextX, setLocalTextX] = useState(centerX);
  const [localTextY, setLocalTextY] = useState(() => {
    const defaultPos = getDefaultTextPosition;
    return textPositions[currentPage]?.y ?? textPositionY ?? defaultPos.y;
  });
  
  // Update local text position when page or props change - X always stays centered
  useEffect(() => {
    setLocalTextX(centerX); // Always keep X at center
    const savedPos = textPositions[currentPage];
    if (savedPos) {
      setLocalTextY(savedPos.y);
    } else if (textPositionY !== undefined) {
      setLocalTextY(textPositionY);
    } else {
      setLocalTextY(getDefaultTextPosition.y);
    }
  }, [textPositionY, currentPage, textPositions]);
  
  // Text drag handler - only vertical movement
  const handleTextMouseDown = (e: React.MouseEvent) => {
    if (isPDF) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingText(true);
    const rect = pageContainerRef.current?.getBoundingClientRect();
    if (rect) {
      setTextDragStart({
        x: 0, // Not used for horizontal movement
        y: e.clientY - rect.top - localTextY
      });
    }
  };
  
  // Global mouse move handler for text dragging - vertical only
  useEffect(() => {
    if (!isDraggingText) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!pageContainerRef.current) return;
      const rect = pageContainerRef.current.getBoundingClientRect();
      
      // Only calculate new Y position (X stays centered)
      const newY = e.clientY - rect.top - textDragStart.y;
      
      // Constrain Y to page bounds, X always stays at center (273px = 546/2)
      const minY = 0;
      const maxY = 790 - 30; // Approximate text height
      const centerX = 273; // Center of page (546 / 2)
      
      setLocalTextY(Math.max(minY, Math.min(maxY, newY)));
      setLocalTextX(centerX); // Always keep X at center
    };

    const handleMouseUp = () => {
      if (isDraggingText) {
        setIsDraggingText(false);
        // Save position (X is always center, Y is the dragged position) for current page
        const centerX = 273; // Center of page
        setTextPositions(prev => ({
          ...prev,
          [currentPage]: { x: centerX, y: localTextY }
        }));
        if (onTextPositionChange) {
          onTextPositionChange(centerX, localTextY, currentPage);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingText, textDragStart, localTextY, onTextPositionChange, currentPage]);

  // Auto-assign page numbers to images and create pages as needed
  useEffect(() => {
    if (selectedImages.length === 0) {
      setLocalSelectedImages([]);
      setTotalPages(1);
      return;
    }
    
    // Assign page numbers to images (default: distribute evenly, max 4 per page)
    const imagesWithPages = selectedImages.map((img, index) => {
      if (img.pageNumber) {
        return img; // Keep existing page number
      }
      // Auto-assign: distribute images across pages (max 4 per page)
      const pageNum = Math.floor(index / MAX_IMAGES_PER_PAGE) + 1;
      return { ...img, pageNumber: pageNum };
    });
    
    // Calculate required total pages
    const maxPageNumber = Math.max(...imagesWithPages.map(img => img.pageNumber || 1));
    const requiredPages = Math.max(1, maxPageNumber, Math.ceil(imagesWithPages.length / MAX_IMAGES_PER_PAGE));
    
    setLocalSelectedImages(imagesWithPages);
    setTotalPages(requiredPages);
    
    // Notify parent of total pages change
    if (onTotalPagesChange && requiredPages !== totalPages) {
      onTotalPagesChange(requiredPages);
    }
    
    // Ensure current page is valid
    if (currentPage > requiredPages) {
      const newPage = requiredPages;
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  }, [selectedImages]);
  
  // Sync current page with prop
  useEffect(() => {
    if (propCurrentPage !== undefined && propCurrentPage !== currentPage) {
      setCurrentPage(propCurrentPage);
    }
  }, [propCurrentPage]);
  
  // Sync total pages with prop
  useEffect(() => {
    if (propTotalPages !== undefined && propTotalPages !== totalPages) {
      setTotalPages(propTotalPages);
    }
  }, [propTotalPages]);

  // Get default dimensions and position for an image based on count
  const getDefaultImageDimensions = (imageCount: number, index: number) => {
    if (imageCount === 1) {
      return { width: 297, height: 385 };
    } else if (imageCount === 2) {
      return { width: 264, height: 275 };
    } else if (imageCount === 3 || imageCount === 4) {
      return { width: 240, height: 240 };
    }
    return { width: 200, height: 200 };
  };

  const getDefaultImagePosition = (imageCount: number, index: number, imageWidth: number, imageHeight: number) => {
    const pageWidth = 546;
    const pageHeight = 790;
    const containerTop = 200;
    const containerLeft = 60;
    const containerWidth = pageWidth - 120;
    const containerHeight = pageHeight - containerTop - 120;
    
    if (imageCount === 1) {
      return {
        x: containerLeft + (containerWidth - imageWidth) / 2,
        y: containerTop + 70
      };
    } else if (imageCount === 2) {
      const gap = 16;
      const totalWidth = imageWidth * 2 + gap;
      const startX = containerLeft + (containerWidth - totalWidth) / 2;
      return {
        x: startX + index * (imageWidth + gap),
        y: containerTop + 40
      };
    } else if (imageCount === 3 || imageCount === 4) {
      const gap = 16;
      const cols = 2;
      const row = Math.floor(index / cols);
      const col = index % cols;
      const totalWidth = imageWidth * cols + gap * (cols - 1);
      const startX = containerLeft + (containerWidth - totalWidth) / 2;
      return {
        x: startX + col * (imageWidth + gap),
        y: containerTop + row * (imageHeight + gap)
      };
    }
    return { x: containerLeft, y: containerTop };
  };

  // Get image position and size (for current page images)
  const getImagePosition = (image: ImageItem, index: number) => {
    const currentPageImages = getCurrentPageImages();
    const defaultDims = getDefaultImageDimensions(currentPageImages.length, index);
    const width = image.width ?? defaultDims.width;
    const height = image.height ?? defaultDims.height;
    const defaultPos = getDefaultImagePosition(currentPageImages.length, index, width, height);
    
    return {
      x: image.positionX ?? defaultPos.x,
      y: image.positionY ?? defaultPos.y,
      width,
      height
    };
  };

  const handleImageToggle = (image: ImageItem) => {
    if (isPDF) return; // Don't allow selection changes in PDF mode

    const isSelected = localSelectedImages.some(img => img.id === image.id);
    let newSelection: ImageItem[];

    if (isSelected) {
      // Remove image from selection
      newSelection = localSelectedImages.filter(img => img.id !== image.id);
    } else {
      // Add image to selection - always assign to current page (no limit)
      newSelection = [...localSelectedImages, { ...image, pageNumber: currentPage }];
    }

    setLocalSelectedImages(newSelection);
    onImageSelection?.(newSelection);
  };
  
  // Get images for current page
  const getCurrentPageImages = () => {
    return localSelectedImages.filter(img => (img.pageNumber || 1) === currentPage);
  };
  
  // Move image to different page
  const moveImageToPage = (imageId: string, targetPage: number) => {
    const updatedImages = localSelectedImages.map(img => 
      img.id === imageId ? { ...img, pageNumber: targetPage } : img
    );
    
    // Recalculate total pages based on all images
    const maxPageNumber = Math.max(...updatedImages.map(img => img.pageNumber || 1), 1);
    const calculatedTotalPages = Math.max(1, maxPageNumber);
    
    if (calculatedTotalPages !== totalPages) {
      setTotalPages(calculatedTotalPages);
      if (onTotalPagesChange) {
        onTotalPagesChange(calculatedTotalPages);
      }
    }
    
    setLocalSelectedImages(updatedImages);
    onImageSelection?.(updatedImages);
  };

  const isImageSelected = (image: ImageItem) => {
    return localSelectedImages.some(img => img.id === image.id);
  };

  // Drag handlers
  const handleImageMouseDown = (e: React.MouseEvent, imageId: string) => {
    if (isPDF) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingImageId(imageId);
    const rect = pageContainerRef.current?.getBoundingClientRect();
    const image = localSelectedImages.find(img => img.id === imageId);
    if (rect && image) {
      const currentPageImages = getCurrentPageImages();
      const pos = getImagePosition(image, currentPageImages.findIndex(img => img.id === imageId));
      setDragStart({
        x: e.clientX - rect.left - pos.x,
        y: e.clientY - rect.top - pos.y
      });
    }
  };

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent, imageId: string, type: 'width' | 'height' | 'both') => {
    if (isPDF) return;
    e.preventDefault();
    e.stopPropagation();
    setResizingImageId(imageId);
    setResizeType(type);
    const image = localSelectedImages.find(img => img.id === imageId);
    if (image) {
      const currentPageImages = getCurrentPageImages();
      const pos = getImagePosition(image, currentPageImages.findIndex(img => img.id === imageId));
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: pos.width,
        height: pos.height
      });
    }
  };

  // Global mouse move handler for dragging and resizing
  useEffect(() => {
    if (!draggingImageId && !resizingImageId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!pageContainerRef.current) return;
      const rect = pageContainerRef.current.getBoundingClientRect();
      
      if (draggingImageId) {
        const image = localSelectedImages.find(img => img.id === draggingImageId);
        if (!image) return;
        const currentPageImages = getCurrentPageImages();
        const index = currentPageImages.findIndex(img => img.id === draggingImageId);
        const currentPos = getImagePosition(image, index);
        
        const newX = e.clientX - rect.left - dragStart.x;
        const newY = e.clientY - rect.top - dragStart.y;
        
        // Constrain to page bounds
        const minX = 29;
        const maxX = 546 - currentPos.width - 29;
        const minY = 0;
        const maxY = 790 - currentPos.height;
        
        const constrainedX = Math.max(minX, Math.min(maxX, newX));
        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        
        // Update image position
        const updatedImages = localSelectedImages.map(img => 
          img.id === draggingImageId 
            ? { ...img, positionX: constrainedX, positionY: constrainedY }
            : img
        );
        setLocalSelectedImages(updatedImages);
      } else if (resizingImageId && resizeType) {
        const image = localSelectedImages.find(img => img.id === resizingImageId);
        if (!image) return;
        const currentPageImages = getCurrentPageImages();
        const index = currentPageImages.findIndex(img => img.id === resizingImageId);
        const currentPos = getImagePosition(image, index);
        
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = currentPos.width;
        let newHeight = currentPos.height;
        
        if (resizeType === 'width') {
          newWidth = Math.max(100, Math.min(500, resizeStart.width + deltaX));
        } else if (resizeType === 'height') {
          newHeight = Math.max(100, Math.min(600, resizeStart.height + deltaY));
        } else if (resizeType === 'both') {
          newWidth = Math.max(100, Math.min(500, resizeStart.width + deltaX));
          newHeight = Math.max(100, Math.min(600, resizeStart.height + deltaY));
        }
        
        // Update image size
        const updatedImages = localSelectedImages.map(img => 
          img.id === resizingImageId 
            ? { ...img, width: newWidth, height: newHeight }
            : img
        );
        setLocalSelectedImages(updatedImages);
      }
    };

    const handleMouseUp = () => {
      if (draggingImageId || resizingImageId) {
        const image = localSelectedImages.find(img => 
          img.id === (draggingImageId || resizingImageId)
        );
        if (image && onImagePositionChange) {
          const currentPageImages = getCurrentPageImages();
          const index = currentPageImages.findIndex(img => 
            img.id === (draggingImageId || resizingImageId)
          );
          const pos = getImagePosition(image, index);
          onImagePositionChange(image.id, pos.x, pos.y, pos.width, pos.height, currentPage);
        }
        setDraggingImageId(null);
        setResizingImageId(null);
        setResizeType(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingImageId, resizingImageId, resizeType, dragStart, resizeStart, localSelectedImages, onImagePositionChange, currentPage]);

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
          ref={pageContainerRef}
          className="relative w-[546px] h-[790px] top-[26px]"
          style={isPDF ? {
            left: '24.5px', // Center: (595 - 546) / 2 = 24.5px
            margin: '0'
          } : {
            left: '25px',
            margin: 'initial'
          }}
        >
          {/* Header Section */}
          <div 
            className={isPDF ? "w-[393px] h-[106px]" : "absolute w-[393px] h-[106px] top-[25px] left-[77px]"}
            style={isPDF ? {
              position: 'absolute',
              top: '25px',
              left: '76.5px', // Center: (546 - 393) / 2 = 76.5px
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

            {/* Images Display Area - Draggable and resizable images (current page only) */}
            {(() => {
              const currentPageImages = getCurrentPageImages();
              return currentPageImages.length > 0 ? (
                currentPageImages.map((image, index) => {
                  const pos = getImagePosition(image, index);
                  const isDragging = draggingImageId === image.id;
                  const isResizing = resizingImageId === image.id;
                
                return (
                  <div
                    key={image.id}
                    style={{
                      position: 'absolute',
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      width: `${pos.width}px`,
                      height: `${pos.height}px`,
                      cursor: isDragging ? 'grabbing' : (isPDF ? 'default' : 'grab'),
                      zIndex: isDragging || isResizing ? 10 : 1
                    }}
                    onMouseDown={(e) => !isPDF && handleImageMouseDown(e, image.id)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Project image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                        pointerEvents: 'none',
                        userSelect: 'none'
                      }}
                      draggable={false}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {!isPDF && (
                      <>
                        {/* Right edge resize handle (width only) */}
                        <div
                          style={{
                            position: 'absolute',
                            right: '-8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '40px',
                            backgroundColor: '#722420',
                            border: '2px solid white',
                            borderRadius: '8px',
                            cursor: 'ew-resize',
                            zIndex: 11,
                            pointerEvents: 'auto'
                          }}
                          onMouseDown={(e) => handleResizeMouseDown(e, image.id, 'width')}
                        />
                        {/* Bottom edge resize handle (height only) */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40px',
                            height: '16px',
                            backgroundColor: '#722420',
                            border: '2px solid white',
                            borderRadius: '8px',
                            cursor: 'ns-resize',
                            zIndex: 11,
                            pointerEvents: 'auto'
                          }}
                          onMouseDown={(e) => handleResizeMouseDown(e, image.id, 'height')}
                        />
                        {/* Bottom-right corner resize handle (both width and height) */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-8px',
                            right: '-8px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#722420',
                            border: '2px solid white',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            zIndex: 11,
                            pointerEvents: 'auto'
                          }}
                          onMouseDown={(e) => handleResizeMouseDown(e, image.id, 'both')}
                        />
                      </>
                    )}
                  </div>
                );
              })
              ) : (
              // Show placeholder when no images selected
              <div 
                className="absolute top-[200px] bottom-[120px] left-[60px] right-[60px] flex items-center justify-center"
                style={isPDF ? {
                  position: 'absolute',
                  top: '100px',
                  bottom: '120px',
                  left: '70px',
                  right: '40px'
                } : {}}
              >
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg mb-2">No Images Selected</p>
                  <p className="text-sm">Selected images will appear here</p>
                </div>
              </div>
            );
            })()}

          {/* Description paragraph below images - Draggable */}
          {getCurrentPageImages().length > 0 && (
            <div 
              className="absolute"
              style={{
                left: `${localTextX}px`,
                top: `${localTextY}px`,
                transform: 'translateX(-50%)',
                width: '80%',
                textAlign: 'center',
                cursor: isDraggingText ? 'grabbing' : (isPDF ? 'default' : 'grab'),
                zIndex: isDraggingText ? 10 : 1
              }}
              onMouseDown={handleTextMouseDown}
            >
              <p 
                style={{
                  fontFamily: 'Times New Roman, Times, serif',
                  fontSize: isPDF ? '14px' : '16px',
                  color: '#000000',
                  margin: '0',
                  lineHeight: '1.4',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              >
                Written Invoice
              </p>
            </div>
          )}


          {/* Frame Border */}
          <div 
            className={isPDF ? "w-[546px] h-[790px] border-2 border-solid border-[#722420]" : "absolute w-[546px] h-[790px] top-0 left-0 border-2 border-solid border-[#722420]"}
            style={isPDF ? {
              position: 'absolute',
              top: '0',
              left: '0' // Container is already positioned, so border should be at 0
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
