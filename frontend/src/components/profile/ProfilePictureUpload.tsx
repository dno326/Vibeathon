import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  initials?: string;
  onImageUpload: (imageFile: File) => Promise<void>;
  onImageUpdate: (imageFile: File) => Promise<void>;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  initials = 'U',
  onImageUpload,
  onImageUpdate,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Update preview when currentImageUrl changes
  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result as string);
        setIsCropping(true);
        setImageLoaded(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      
      // Initialize crop position to center
      const containerWidth = containerRef.current?.offsetWidth || 400;
      const containerHeight = containerRef.current?.offsetHeight || 400;
      const initialSize = Math.min(containerWidth, containerHeight) * 0.6;
      setCropSize(initialSize);
      setCropPosition({
        x: (containerWidth - initialSize) / 2,
        y: (containerHeight - initialSize) / 2,
      });
      setImageLoaded(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageLoaded) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on resize handle (bottom-right corner)
    const handleSize = 20;
    const handleX = cropPosition.x + cropSize - handleSize / 2;
    const handleY = cropPosition.y + cropSize - handleSize / 2;
    const distance = Math.sqrt(
      Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2)
    );

    if (distance < handleSize) {
      setIsResizing(true);
    } else if (
      x >= cropPosition.x &&
      x <= cropPosition.x + cropSize &&
      y >= cropPosition.y &&
      y <= cropPosition.y + cropSize
    ) {
      setIsDragging(true);
    }
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageLoaded) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (isResizing) {
      const newSize = Math.max(100, cropSize + Math.max(deltaX, deltaY));
      const maxSize = Math.min(rect.width, rect.height);
      setCropSize(Math.min(newSize, maxSize));
    } else if (isDragging) {
      const newX = Math.max(0, Math.min(rect.width - cropSize, cropPosition.x + deltaX));
      const newY = Math.max(0, Math.min(rect.height - cropSize, cropPosition.y + deltaY));
      setCropPosition({ x: newX, y: newY });
    }

    if (isDragging || isResizing) {
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const performCrop = useCallback(async () => {
    if (!cropImage || !canvasRef.current || !imageRef.current || !imageLoaded) return;

    const img = new Image();
    img.onload = async () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      // Calculate scale factor
      const displayWidth = imageRef.current!.offsetWidth;
      const displayHeight = imageRef.current!.offsetHeight;
      const scaleX = img.width / displayWidth;
      const scaleY = img.height / displayHeight;
      
      // Calculate crop area in image coordinates
      const cropX = cropPosition.x * scaleX;
      const cropY = cropPosition.y * scaleY;
      const cropSizeScaled = cropSize * Math.min(scaleX, scaleY);

      // Create circular mask
      canvas.width = 400;
      canvas.height = 400;
      
      // Draw image with circular clipping
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, 200, 0, 2 * Math.PI);
      ctx.clip();
      
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropSizeScaled,
        cropSizeScaled,
        0,
        0,
        400,
        400
      );
      
      ctx.restore();

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
          setIsUploading(true);
          try {
            if (currentImageUrl) {
              await onImageUpdate(file);
            } else {
              await onImageUpload(file);
            }
            setPreview(canvas.toDataURL());
            setIsCropping(false);
            setCropImage(null);
            setImageLoaded(false);
          } catch (error) {
            console.error('Failed to upload image:', error);
          } finally {
            setIsUploading(false);
          }
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = cropImage;
  }, [cropImage, cropPosition, cropSize, imageLoaded, currentImageUrl, onImageUpload, onImageUpdate]);

  const handleCancelCrop = () => {
    setIsCropping(false);
    setCropImage(null);
    setImageLoaded(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Profile Picture Display */}
      <div className="relative mb-4">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-200 shadow-lg">
            {initials}
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 shadow-lg hover:bg-purple-700 transition-colors"
          disabled={isUploading}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Cropping Modal */}
      {isCropping && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Crop Your Profile Picture</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag to move, drag the corner to resize. The image will be cropped as a circle.
            </p>
            
            <div
              ref={containerRef}
              className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden"
              style={{ height: '400px', width: '100%' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={cropImage}
                alt="Crop preview"
                className="absolute inset-0 w-full h-full object-contain"
                onLoad={handleImageLoad}
                style={{ pointerEvents: 'none' }}
              />
              
              {/* Overlay with circular cutout */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  clipPath: `circle(${cropSize / 2}px at ${cropPosition.x + cropSize / 2}px ${cropPosition.y + cropSize / 2}px)`,
                  WebkitClipPath: `circle(${cropSize / 2}px at ${cropPosition.x + cropSize / 2}px ${cropPosition.y + cropSize / 2}px)`,
                }}
              />
              
              {/* Crop circle border */}
              <div
                className="absolute border-4 border-white rounded-full pointer-events-none shadow-lg"
                style={{
                  left: cropPosition.x,
                  top: cropPosition.y,
                  width: cropSize,
                  height: cropSize,
                }}
              />
              
              {/* Resize handle */}
              <div
                className="absolute bg-white border-2 border-purple-600 rounded-full cursor-nwse-resize"
                style={{
                  left: cropPosition.x + cropSize - 10,
                  top: cropPosition.y + cropSize - 10,
                  width: 20,
                  height: 20,
                }}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelCrop}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={performCrop}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                disabled={isUploading || !imageLoaded}
              >
                {isUploading ? 'Uploading...' : 'Save Picture'}
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ProfilePictureUpload;
