'use client'
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';

export default function FullscreenViewer({ media, messageText, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
    };

    document.addEventListener('keydown', handleKeyPress);
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [onClose]);

  const handleZoomIn = () => setScale(prev => Math.min(5, prev + 0.2));
  const handleZoomOut = () => setScale(prev => Math.max(0.1, prev - 0.2));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
        ref={containerRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm text-white relative z-10">
          <div className="flex-1">
            <h3 className="font-semibold text-lg truncate">{media.fileName}</h3>
            <p className="text-sm opacity-75">{formatFileSize(media.fileSize)}</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Zoom Out (-)"
            >
              <FiZoomOut size={20} />
            </motion.button>
            
            <span className="text-sm px-2 py-1 bg-white/20 rounded">
              {Math.round(scale * 100)}%
            </span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Zoom In (+)"
            >
              <FiZoomIn size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRotation(prev => prev + 90)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Rotate"
            >
              <FiRotateCw size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Download"
            >
              <FiDownload size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Close (Esc)"
            >
              <FiX size={20} />
            </motion.button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleReset}
        >
          {media.type === 'image' ? (
            <motion.img
              ref={imageRef}
              src={media.url}
              alt={media.fileName}
              className="max-w-none select-none"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              draggable={false}
              onLoad={() => {
                // Auto-fit image to screen on load
                if (imageRef.current && containerRef.current) {
                  const img = imageRef.current;
                  const container = containerRef.current;
                  const containerRect = container.getBoundingClientRect();
                  const imgAspect = img.naturalWidth / img.naturalHeight;
                  const containerAspect = containerRect.width / (containerRect.height - 80); // Account for header
                  
                  if (imgAspect > containerAspect) {
                    // Image is wider
                    const fitScale = (containerRect.width * 0.9) / img.naturalWidth;
                    setScale(Math.min(1, fitScale));
                  } else {
                    // Image is taller
                    const fitScale = ((containerRect.height - 80) * 0.9) / img.naturalHeight;
                    setScale(Math.min(1, fitScale));
                  }
                }
              }}
            />
          ) : (
            <div className="text-center text-white p-8">
              <div className="p-8 bg-white/10 rounded-2xl backdrop-blur-sm max-w-md">
                <div className="text-6xl mb-4 opacity-75">📄</div>
                <h3 className="text-2xl font-semibold mb-2">{media.fileName}</h3>
                <p className="text-lg opacity-75 mb-6">{formatFileSize(media.fileSize)}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="px-8 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center mx-auto text-lg"
                >
                  <FiDownload className="mr-3" size={20} />
                  Download File
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Message Text */}
        {messageText && (
          <div className="p-4 bg-black/80 backdrop-blur-sm text-white text-center">
            <p className="text-lg">{messageText}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-white/60 text-sm">
          <p>Double-click to reset • Scroll to zoom • Drag to pan</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}