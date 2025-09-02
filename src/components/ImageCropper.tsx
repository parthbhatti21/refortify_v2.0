import React, { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageUrl, onCropComplete, onCancel, aspectRatio }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(0.1);
  const [hasCrop, setHasCrop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        
        // Wait for the next frame to ensure image is rendered
        setTimeout(() => {
          const imgRect = imageRef.current?.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          
          if (imgRect && containerRect) {
            const imgLeft = imgRect.left - containerRect.left;
            const imgTop = imgRect.top - containerRect.top;
            
            // Initialize crop to center of the actual image
            const cropWidth = Math.min(imgRect.width * 0.8, isMobile ? 200 : 300);
            const cropHeight = cropWidth * 0.75; // Free-form aspect ratio
            setCrop({
              x: imgLeft + (imgRect.width - cropWidth) / 2,
              y: imgTop + (imgRect.height - cropHeight) / 2,
              width: cropWidth,
              height: cropHeight
            });
          }
        }, 200);
      };
    }
  }, [imageUrl, aspectRatio, isMobile]);

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    const imgRect = imageRef.current?.getBoundingClientRect();
    if (!rect || !imgRect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Calculate image position relative to container
    const imgLeft = imgRect.left - rect.left;
    const imgTop = imgRect.top - rect.top;

    // Check if touching inside the actual image area
    if (x < imgLeft || x > imgLeft + imgRect.width || 
        y < imgTop || y > imgTop + imgRect.height) {
      return;
    }

    // Check if touching inside existing crop area
    if (hasCrop && x >= crop.x && x <= crop.x + crop.width && 
        y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    } else {
      // Start new selection
      setIsSelecting(true);
      setDragStart({ x, y });
      setCrop({ x, y, width: 0, height: 0 });
      setHasCrop(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    const imgRect = imageRef.current?.getBoundingClientRect();
    if (!rect || !imgRect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Calculate image position relative to container
    const imgLeft = imgRect.left - rect.left;
    const imgTop = imgRect.top - rect.top;
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    if (isDragging && hasCrop) {
      // Moving existing crop
      const newX = Math.max(imgLeft, Math.min(x - dragStart.x, imgLeft + imgWidth - crop.width));
      const newY = Math.max(imgTop, Math.min(y - dragStart.y, imgTop + imgHeight - crop.height));
      setCrop(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isSelecting) {
      // Creating new crop selection
      const startX = Math.min(dragStart.x, x);
      const startY = Math.min(dragStart.y, y);
      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);

      let finalWidth = width;
      let finalHeight = height;

      // Ensure crop stays within image bounds
      const maxX = imgLeft + imgWidth - finalWidth;
      const maxY = imgTop + imgHeight - finalHeight;
      
      const finalX = Math.max(imgLeft, Math.min(startX, maxX));
      const finalY = Math.max(imgTop, Math.min(startY, maxY));

      setCrop({ x: finalX, y: finalY, width: finalWidth, height: finalHeight });
    }
  };

  const handleTouchEnd = () => {
    if (isSelecting && crop.width > 20 && crop.height > 20) {
      setHasCrop(true);
    }
    setIsDragging(false);
    setIsSelecting(false);
  };

  // Mouse event handlers (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Skip mouse events on mobile
    const rect = containerRef.current?.getBoundingClientRect();
    const imgRect = imageRef.current?.getBoundingClientRect();
    if (!rect || !imgRect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate image position relative to container
    const imgLeft = imgRect.left - rect.left;
    const imgTop = imgRect.top - rect.top;

    // Check if clicking inside the actual image area
    if (x < imgLeft || x > imgLeft + imgRect.width || 
        y < imgTop || y > imgTop + imgRect.height) {
      return;
    }

    // Check if clicking inside existing crop area
    if (hasCrop && x >= crop.x && x <= crop.x + crop.width && 
        y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    } else {
      // Start new selection
      setIsSelecting(true);
      setDragStart({ x, y });
      setCrop({ x, y, width: 0, height: 0 });
      setHasCrop(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return; // Skip mouse events on mobile
    const rect = containerRef.current?.getBoundingClientRect();
    const imgRect = imageRef.current?.getBoundingClientRect();
    if (!rect || !imgRect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate image position relative to container
    const imgLeft = imgRect.left - rect.left;
    const imgTop = imgRect.top - rect.top;
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    if (isDragging && hasCrop) {
      // Moving existing crop
      const newX = Math.max(imgLeft, Math.min(x - dragStart.x, imgLeft + imgWidth - crop.width));
      const newY = Math.max(imgTop, Math.min(y - dragStart.y, imgTop + imgHeight - crop.height));
      setCrop(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isSelecting) {
      // Creating new crop selection
      const startX = Math.min(dragStart.x, x);
      const startY = Math.min(dragStart.y, y);
      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);

      let finalWidth = width;
      let finalHeight = height;

      // Ensure crop stays within image bounds
      const maxX = imgLeft + imgWidth - finalWidth;
      const maxY = imgTop + imgHeight - finalHeight;
      
      const finalX = Math.max(imgLeft, Math.min(startX, maxX));
      const finalY = Math.max(imgTop, Math.min(startY, maxY));

      setCrop({ x: finalX, y: finalY, width: finalWidth, height: finalHeight });
    }
  };

  const handleMouseUp = () => {
    if (isMobile) return; // Skip mouse events on mobile
    if (isSelecting && crop.width > 10 && crop.height > 10) {
      setHasCrop(true);
    }
    setIsDragging(false);
    setIsSelecting(false);
  };

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!ctx || !imageRef.current) return;

      const imgElement = imageRef.current;
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (!containerRect) return;

      // Get the actual displayed image dimensions and position
      const imgRect = imgElement.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerTop = containerRect.top;
      
      // Calculate the image's position relative to the container
      const imgLeft = imgRect.left - containerLeft;
      const imgTop = imgRect.top - containerTop;
      
      // Calculate the scale factors
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;
      
      // Adjust crop coordinates to be relative to the actual image position
      const adjustedCropX = (crop.x - imgLeft) * scaleX;
      const adjustedCropY = (crop.y - imgTop) * scaleY;
      const adjustedCropWidth = crop.width * scaleX;
      const adjustedCropHeight = crop.height * scaleY;
      
      // Ensure crop coordinates are within bounds
      const finalCropX = Math.max(0, Math.min(adjustedCropX, img.naturalWidth - adjustedCropWidth));
      const finalCropY = Math.max(0, Math.min(adjustedCropY, img.naturalHeight - adjustedCropHeight));
      const finalCropWidth = Math.min(adjustedCropWidth, img.naturalWidth - finalCropX);
      const finalCropHeight = Math.min(adjustedCropHeight, img.naturalHeight - finalCropY);

      canvas.width = finalCropWidth;
      canvas.height = finalCropHeight;

      try {
        ctx.drawImage(
          img,
          finalCropX, finalCropY, finalCropWidth, finalCropHeight,
          0, 0, finalCropWidth, finalCropHeight
        );

        const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCropComplete(croppedImageUrl);
      } catch (error) {
        console.error('Error cropping image:', error);
        alert('Error cropping image. Please try again.');
      }
    };

    img.onerror = () => {
      alert('Error loading image for cropping. Please try a different image.');
    };

    img.src = imageUrl;
  };

  const handleResize = (direction: 'nw' | 'ne' | 'sw' | 'se', e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    const imgRect = imageRef.current?.getBoundingClientRect();
    if (!rect || !imgRect) return;

    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length !== 1) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate image position relative to container
    const imgLeft = imgRect.left - rect.left;
    const imgTop = imgRect.top - rect.top;
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    let newWidth = crop.width;
    let newHeight = crop.height;
    let newX = crop.x;
    let newY = crop.y;

    switch (direction) {
      case 'se':
        newWidth = Math.max(20, x - crop.x);
        newHeight = Math.max(20, y - crop.y);
        break;
      case 'sw':
        newWidth = Math.max(20, crop.x + crop.width - x);
        newHeight = Math.max(20, y - crop.y);
        newX = x;
        break;
      case 'ne':
        newWidth = Math.max(20, x - crop.x);
        newHeight = Math.max(20, crop.y + crop.height - y);
        newY = y;
        break;
      case 'nw':
        newWidth = Math.max(20, crop.x + crop.width - x);
        newHeight = Math.max(20, crop.y + crop.height - y);
        newX = x;
        newY = y;
        break;
    }

    // Ensure crop stays within image bounds
    const maxX = imgLeft + imgWidth - newWidth;
    const maxY = imgTop + imgHeight - newHeight;
    
    newX = Math.max(imgLeft, Math.min(newX, maxX));
    newY = Math.max(imgTop, Math.min(newY, maxY));

    setCrop({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <div className="text-center mb-1">
        <p className="text-sm text-gray-600">
          {!hasCrop 
            ? isMobile 
              ? "Touch and drag to create a crop selection" 
              : "Click and drag to create a free-form crop selection"
            : isMobile
              ? "Touch and drag the red box to move, use corners to resize"
              : "Drag the red box to move, use corners to resize, or click outside to create a new selection"
          }
        </p>
      </div>

      {/* Zoom Controls - Mobile Optimized */}
      <div className={`flex items-center justify-center space-x-2 ${isMobile ? 'space-x-2' : 'space-x-4'} mb-2`}>
        <span className="text-sm text-gray-600">Zoom:</span>
        <button
          onClick={() => setScale(Math.max(0.1, scale - 0.1))}
          className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1'} bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors`}
        >
          -
        </button>
        <span className={`text-sm font-medium min-w-[60px] text-center ${isMobile ? 'text-xs' : ''}`}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.min(10, scale + 0.1))}
          className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1'} bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors`}
        >
          +
        </button>
        <button
          onClick={() => {
            setScale(0.1);
            setCrop({ x: 0, y: 0, width: 0, height: 0 });
            setHasCrop(false);
          }}
          className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1'} bg-[#722420] text-white rounded hover:bg-[#5a1d1a] transition-colors`}
        >
          Reset
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative border-2 border-gray-300 rounded-lg overflow-hidden flex justify-center items-center"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'default',
          maxHeight: isMobile ? '60vh' : '45vh',
          minHeight: isMobile ? '250px' : '300px',
          width: '100%',
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Crop preview"
          className="max-w-full max-h-full object-contain"
          draggable={false}
          crossOrigin="anonymous"
          style={{ 
            transform: `scale(${scale})`,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
        
        {/* Crop selection area */}
        {crop.width > 0 && crop.height > 0 && (
          <div
            className={`absolute border-2 bg-opacity-20 ${
              isSelecting 
                ? 'border-[#722420] bg-[#722420]' 
                : hasCrop 
                  ? 'border-[#722420] bg-[#722420]' 
                  : 'border-gray-500 bg-gray-500'
            }`}
            style={{
              left: crop.x,
              top: crop.y,
              width: crop.width,
              height: crop.height,
              cursor: isDragging ? 'grabbing' : hasCrop ? 'grab' : 'crosshair'
            }}
          >
            {/* Resize handles - only show for existing crop */}
            {hasCrop && (
              <>
                <div
                  className={`absolute bg-[#722420] rounded-full ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`}
                  style={{ left: -8, top: -8 }}
                  onMouseDown={(e) => handleResize('nw', e)}
                  onTouchStart={(e) => handleResize('nw', e)}
                />
                <div
                  className={`absolute bg-[#722420] rounded-full ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`}
                  style={{ right: -8, top: -8 }}
                  onMouseDown={(e) => handleResize('ne', e)}
                  onTouchStart={(e) => handleResize('ne', e)}
                />
                <div
                  className={`absolute bg-[#722420] rounded-full ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`}
                  style={{ left: -8, bottom: -8 }}
                  onMouseDown={(e) => handleResize('sw', e)}
                  onTouchStart={(e) => handleResize('sw', e)}
                />
                <div
                  className={`absolute bg-[#722420] rounded-full ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`}
                  style={{ right: -8, bottom: -8 }}
                  onMouseDown={(e) => handleResize('se', e)}
                  onTouchStart={(e) => handleResize('se', e)}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Mobile Optimized */}
      <div className={`flex justify-end space-x-3 pt-2 ${isMobile ? 'space-x-2' : ''}`}>
        <button
          onClick={onCancel}
          className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors`}
        >
          Cancel
        </button>
        <button
          onClick={handleCrop}
          className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} bg-[#722420] text-white rounded-lg hover:bg-[#5a1d1a] transition-colors`}
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
