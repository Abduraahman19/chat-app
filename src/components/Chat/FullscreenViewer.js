'use client'
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiDownload, 
  FiZoomIn, 
  FiZoomOut, 
  FiRotateCw,
  FiEdit3,
  FiType,
  FiSquare,
  FiCircle,
  FiArrowRight,
  FiSend,
  FiPalette
} from 'react-icons/fi';

export default function FullscreenViewer({ media, messageText, onClose, onSend }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  

  
  const imageRef = useRef(null);
  const containerRef = useRef(null);






  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };

    const handleWheel = (e) => {
      e.preventDefault();
      
      // Enhanced zoom calculation for better control
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Smooth zoom factor based on deltaY
      let zoomFactor;
      if (Math.abs(e.deltaY) > 100) {
        // Fast scroll - bigger steps
        zoomFactor = e.deltaY > 0 ? -0.3 : 0.3;
      } else {
        // Slow scroll - smaller steps for precision
        zoomFactor = e.deltaY > 0 ? -0.1 : 0.1;
      }
      
      const newScale = Math.max(0.1, Math.min(10, scale + zoomFactor));
      
      // Zoom towards mouse position
      if (newScale > 1) {
        const scaleRatio = newScale / scale;
        const newX = mouseX - (mouseX - position.x) * scaleRatio;
        const newY = mouseY - (mouseY - position.y) * scaleRatio;
        setPosition({ x: newX, y: newY });
      } else {
        // Reset position when zooming out to original size
        setPosition({ x: 0, y: 0 });
      }
      
      setScale(newScale);
      
      // Visual feedback for zoom
      setIsZooming(true);
      setTimeout(() => setIsZooming(false), 150);
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
  }, []);

  const handleZoomIn = () => {
    const newScale = Math.min(10, scale + 0.3);
    setScale(newScale);
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 150);
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(0.1, scale - 0.3);
    setScale(newScale);
    
    // Reset position when zooming back to original size
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 150);
  };
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
        className="flex flex-col w-full h-full bg-black/60 backdrop-blur-md"
        ref={containerRef}
      >
        {/* Professional Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 flex items-center justify-between p-4 text-white border-b bg-black/30 backdrop-blur-xl border-white/20"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium truncate text-white/95">{media.fileName}</h3>
            <p className="text-xs text-white/60 mt-0.5">{formatFileSize(media.fileSize)}</p>
          </div>
          
          {/* Professional Controls */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
              title="Zoom Out"
            >
              <FiZoomOut size={18} />
            </motion.button>
            
            <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium text-white/90 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
              title="Zoom In"
            >
              <FiZoomIn size={18} />
            </motion.button>
            
            <div className="w-px h-6 mx-1 bg-white/20" />
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRotation(prev => prev + 90)}
              className="p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
              title="Rotate"
            >
              <FiRotateCw size={18} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
              title="Download"
            >
              <FiDownload size={18} />
            </motion.button>
            

            
            <div className="w-px h-6 mx-1 bg-white/20" />
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2.5 rounded-lg hover:bg-red-500/20 transition-all duration-200 text-white/80 hover:text-white"
              title="Close"
            >
              <FiX size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Image Container */}
        <div 
          className="flex items-center justify-center flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleReset}
        >
          {media.type === 'image' ? (
            <div className="relative">
              <motion.img
                ref={imageRef}
                src={media.url}
                alt={media.fileName}
                className="select-none max-w-none"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
                  cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                  transition: scale <= 1 || isZooming ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                  filter: `drop-shadow(0 10px 25px rgba(0,0,0,0.3)) ${isZooming ? 'brightness(1.1)' : ''}`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
                crossOrigin="anonymous"
                onLoad={() => {
                  // Professional auto-fit with smooth animation
                  if (imageRef.current && containerRef.current) {
                    const img = imageRef.current;
                    const container = containerRef.current;
                    const containerRect = container.getBoundingClientRect();
                    const imgAspect = img.naturalWidth / img.naturalHeight;
                    const containerAspect = containerRect.width / (containerRect.height - 120);
                    
                    let fitScale = 1;
                    if (imgAspect > containerAspect) {
                      fitScale = (containerRect.width * 0.85) / img.naturalWidth;
                    } else {
                      fitScale = ((containerRect.height - 120) * 0.85) / img.naturalHeight;
                    }
                    
                    // Smooth scale animation
                    setTimeout(() => setScale(Math.min(1, fitScale)), 100);
                  }
                }}
              />

            </div>
          ) : (
            <div className="p-8 text-center text-white">
              <div className="max-w-md p-8 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="mb-4 text-6xl opacity-75">📄</div>
                <h3 className="mb-2 text-2xl font-semibold">{media.fileName}</h3>
                <p className="mb-6 text-lg opacity-75">{formatFileSize(media.fileSize)}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center px-8 py-3 mx-auto text-lg transition-colors rounded-lg bg-white/20 hover:bg-white/30"
                >
                  <FiDownload className="mr-3" size={20} />
                  Download File
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Professional Message Text */}
        {messageText && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-6 text-center text-white border-t bg-black/90 backdrop-blur-md border-white/10"
          >
            <p className="max-w-2xl mx-auto text-base leading-relaxed text-white/95">{messageText}</p>
          </motion.div>
        )}



        {/* Enhanced Instructions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 left-4 text-white/50 text-xs bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm"
        >
          <p>🖱️ Scroll to zoom • ✋ Drag to pan • 🔄 Double-click to reset</p>
        </motion.div>
        
        {/* Zoom Indicator */}
        <AnimatePresence>
          {isZooming && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none"
            >
              <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
            </motion.div>
          )}
        </AnimatePresence>


      </motion.div>
    </AnimatePresence>
  );
}