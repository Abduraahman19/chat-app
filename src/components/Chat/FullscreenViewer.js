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
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [texts, setTexts] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(3);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [tempText, setTempText] = useState('');
  const [caption, setCaption] = useState('');
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];
  const tools = [
    { id: 'pen', icon: FiEdit3, label: 'Pen' },
    { id: 'text', icon: FiType, label: 'Text' },
    { id: 'rectangle', icon: FiSquare, label: 'Rectangle' },
    { id: 'circle', icon: FiCircle, label: 'Circle' },
    { id: 'arrow', icon: FiArrowRight, label: 'Arrow' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (canvas && img && isEditing) {
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      redrawCanvas();
    }
  }, [drawings, texts, isEditing]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isEditing) return;
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };

    const handleWheel = (e) => {
      if (isEditing) return;
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
  }, [isEditing]);

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

  // Editing functions
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all drawings
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawing.type === 'pen') {
        ctx.beginPath();
        drawing.path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (drawing.type === 'rectangle') {
        ctx.strokeRect(drawing.startX, drawing.startY, drawing.width, drawing.height);
      } else if (drawing.type === 'circle') {
        ctx.beginPath();
        ctx.arc(drawing.centerX, drawing.centerY, drawing.radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawing.type === 'arrow') {
        drawArrow(ctx, drawing.startX, drawing.startY, drawing.endX, drawing.endY);
      }
    });
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (e) => {
    if (!editMode || editMode === 'text') return;
    
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    
    if (editMode === 'pen') {
      setCurrentPath([coords]);
    } else {
      setCurrentPath([coords]);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !editMode) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (editMode === 'pen') {
      setCurrentPath(prev => [...prev, coords]);
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (!isDrawing || !editMode) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (editMode === 'pen') {
      setDrawings(prev => [...prev, {
        type: 'pen',
        path: currentPath,
        color: selectedColor,
        size: brushSize
      }]);
    } else if (editMode === 'rectangle') {
      const startCoords = currentPath[0];
      setDrawings(prev => [...prev, {
        type: 'rectangle',
        startX: Math.min(startCoords.x, coords.x),
        startY: Math.min(startCoords.y, coords.y),
        width: Math.abs(coords.x - startCoords.x),
        height: Math.abs(coords.y - startCoords.y),
        color: selectedColor,
        size: brushSize
      }]);
    } else if (editMode === 'circle') {
      const startCoords = currentPath[0];
      const radius = Math.sqrt(Math.pow(coords.x - startCoords.x, 2) + Math.pow(coords.y - startCoords.y, 2));
      setDrawings(prev => [...prev, {
        type: 'circle',
        centerX: startCoords.x,
        centerY: startCoords.y,
        radius: radius,
        color: selectedColor,
        size: brushSize
      }]);
    } else if (editMode === 'arrow') {
      const startCoords = currentPath[0];
      setDrawings(prev => [...prev, {
        type: 'arrow',
        startX: startCoords.x,
        startY: startCoords.y,
        endX: coords.x,
        endY: coords.y,
        color: selectedColor,
        size: brushSize
      }]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleCanvasClick = (e) => {
    if (editMode === 'text') {
      const coords = getCanvasCoordinates(e);
      setTextPosition(coords);
      setShowTextInput(true);
    }
  };

  const addText = () => {
    if (tempText.trim()) {
      setTexts(prev => [...prev, {
        text: tempText,
        x: textPosition.x,
        y: textPosition.y,
        color: selectedColor,
        size: 24
      }]);
      setTempText('');
      setShowTextInput(false);
    }
  };

  const handleSendEdited = () => {
    if (!onSend) return;
    
    // Create final image with drawings
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Draw all annotations
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawing.type === 'pen') {
        ctx.beginPath();
        drawing.path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (drawing.type === 'rectangle') {
        ctx.strokeRect(drawing.startX, drawing.startY, drawing.width, drawing.height);
      } else if (drawing.type === 'circle') {
        ctx.beginPath();
        ctx.arc(drawing.centerX, drawing.centerY, drawing.radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawing.type === 'arrow') {
        drawArrow(ctx, drawing.startX, drawing.startY, drawing.endX, drawing.endY);
      }
    });
    
    // Draw texts
    texts.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.size}px Arial`;
      ctx.fillText(text.text, text.x, text.y);
    });
    
    // Convert to blob and send
    canvas.toBlob((blob) => {
      onSend(caption.trim(), blob);
    }, 'image/jpeg', 0.9);
  };

  const handleMouseDown = (e) => {
    if (isEditing) return;
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isEditing) return;
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isEditing) return;
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
            
            {media.type === 'image' && (
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white ${
                  isEditing ? 'bg-white/20' : ''
                }`}
                title="Edit"
              >
                <FiEdit3 size={18} />
              </motion.button>
            )}
            
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
          className={`flex items-center justify-center flex-1 overflow-hidden ${
            isEditing ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={isEditing ? undefined : handleReset}
        >
          {media.type === 'image' ? (
            <div className="relative">
              <motion.img
                ref={imageRef}
                src={media.url}
                alt={media.fileName}
                className="select-none max-w-none"
                style={{
                  transform: isEditing ? 'none' : `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
                  cursor: isEditing ? 'crosshair' : (scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'),
                  transition: scale <= 1 || isZooming ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                  filter: `drop-shadow(0 10px 25px rgba(0,0,0,0.3)) ${isZooming ? 'brightness(1.1)' : ''}`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
                crossOrigin="anonymous"
                onLoad={() => {
                  // Professional auto-fit with smooth animation
                  if (imageRef.current && containerRef.current && !isEditing) {
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
              {isEditing && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onClick={handleCanvasClick}
                />
              )}
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

        {/* Editing Tools */}
        {isEditing && media.type === 'image' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-white/20"
          >
            {/* Tool Selection */}
            <div className="flex justify-center space-x-2 mb-4">
              {tools.map(tool => (
                <motion.button
                  key={tool.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(editMode === tool.id ? null : tool.id)}
                  className={`p-3 rounded-xl transition-colors ${
                    editMode === tool.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/15'
                  }`}
                >
                  <tool.icon size={20} />
                </motion.button>
              ))}
            </div>

            {/* Color Palette */}
            <div className="flex justify-center space-x-2 mb-4">
              {colors.map(color => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-white' : 'border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Brush Size */}
            {editMode && editMode !== 'text' && (
              <div className="flex justify-center items-center space-x-4 mb-4">
                <span className="text-white/70 text-sm">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-white text-sm">{brushSize}px</span>
              </div>
            )}

            {/* Caption and Send */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="flex-1 px-4 py-3 bg-white/10 text-white placeholder-white/60 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {onSend && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendEdited}
                  className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <FiSend size={16} />
                  <span>Send</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Enhanced Instructions */}
        {!isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-4 left-4 text-white/50 text-xs bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <p>🖱️ Scroll to zoom • ✋ Drag to pan • 🔄 Double-click to reset</p>
          </motion.div>
        )}
        
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

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Add Text</h3>
              <input
                type="text"
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                placeholder="Enter text..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTextInput(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addText}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}