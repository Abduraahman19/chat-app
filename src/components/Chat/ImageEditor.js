'use client'
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiSend, 
  FiType, 
  FiEdit3, 
  FiSquare, 
  FiCircle, 
  FiArrowRight,
  FiRotateCcw,
  FiDroplet,
  FiMinus
} from 'react-icons/fi';

export default function ImageEditor({ image, onSend, onClose }) {
  const [caption, setCaption] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [texts, setTexts] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ff3040');
  const [brushSize, setBrushSize] = useState(4);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [tempText, setTempText] = useState('');
  const [tempTextSize, setTempTextSize] = useState(32);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const colors = [
    '#ff3040', '#00d4aa', '#4285f4', '#ffeb3b', 
    '#ff9800', '#9c27b0', '#ffffff', '#000000'
  ];
  
  const tools = [
    { id: 'pen', icon: FiEdit3, label: 'Draw' },
    { id: 'eraser', icon: FiMinus, label: 'Eraser' },
    { id: 'text', icon: FiType, label: 'Text' },
    { id: 'arrow', icon: FiArrowRight, label: 'Arrow' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (canvas && img) {
      const updateCanvas = () => {
        const rect = img.getBoundingClientRect();
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Set canvas size to match image display size
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        
        // Scale canvas back down using CSS
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        // Scale the drawing context so everything draws at the correct size
        const ctx = canvas.getContext('2d');
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        redrawCanvas();
      };
      
      if (img.complete) {
        updateCanvas();
      } else {
        img.onload = updateCanvas;
      }
      
      window.addEventListener('resize', updateCanvas);
      return () => window.removeEventListener('resize', updateCanvas);
    }
  }, [drawings, texts, selectedColor, brushSize]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !img) return;

    const rect = img.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;
    
    // Draw all drawings
    drawings.forEach(drawing => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawing.type === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawing.color;
        ctx.lineWidth = drawing.size * Math.min(scaleX, scaleY);
        ctx.beginPath();
        drawing.path.forEach((point, index) => {
          const x = point.x * scaleX;
          const y = point.y * scaleY;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      } else if (drawing.type === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = drawing.size * Math.min(scaleX, scaleY);
        ctx.beginPath();
        drawing.path.forEach((point, index) => {
          const x = point.x * scaleX;
          const y = point.y * scaleY;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      } else if (drawing.type === 'arrow') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawing.color;
        ctx.lineWidth = drawing.size * Math.min(scaleX, scaleY);
        const startX = drawing.startX * scaleX;
        const startY = drawing.startY * scaleY;
        const endX = drawing.endX * scaleX;
        const endY = drawing.endY * scaleY;
        drawArrow(ctx, startX, startY, endX, endY);
      }
    });
    
    ctx.globalCompositeOperation = 'source-over';

    // Draw texts
    texts.forEach((text, index) => {
      ctx.fillStyle = text.color;
      ctx.font = `bold ${text.size * Math.min(scaleX, scaleY)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(text.text, text.x * scaleX, text.y * scaleY);
      
      // Draw selection border for selected text
      if (selectedTextIndex === index) {
        const textWidth = ctx.measureText(text.text).width;
        const textHeight = text.size * Math.min(scaleX, scaleY);
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          text.x * scaleX - textWidth/2 - 5,
          text.y * scaleY - textHeight + 5,
          textWidth + 10,
          textHeight + 5
        );
        ctx.setLineDash([]);
      }
    });
    
    ctx.globalCompositeOperation = 'source-over';
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 15;
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
    const img = imageRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates relative to the displayed image size
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;
    
    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (!editMode || editMode === 'text') return;
    
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    setCurrentPath([coords]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !editMode) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (editMode === 'pen' || editMode === 'eraser') {
      setCurrentPath(prev => [...prev, coords]);
      
      // Real-time drawing
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (ctx && img) {
        const rect = img.getBoundingClientRect();
        const scaleX = rect.width / img.naturalWidth;
        const scaleY = rect.height / img.naturalHeight;
        
        if (editMode === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = brushSize * 2 * Math.min(scaleX, scaleY);
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = selectedColor;
          ctx.lineWidth = brushSize * Math.min(scaleX, scaleY);
        }
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (currentPath.length > 0) {
          const prevPoint = currentPath[currentPath.length - 1];
          ctx.beginPath();
          ctx.moveTo(prevPoint.x * scaleX, prevPoint.y * scaleY);
          ctx.lineTo(coords.x * scaleX, coords.y * scaleY);
          ctx.stroke();
        }
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !editMode) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (editMode === 'pen') {
      setDrawings(prev => [...prev, {
        type: 'pen',
        path: currentPath,
        color: selectedColor,
        size: brushSize
      }]);
    } else if (editMode === 'eraser') {
      setDrawings(prev => [...prev, {
        type: 'eraser',
        path: currentPath,
        size: brushSize * 2
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
    setSelectedTextIndex(null);
  };

  const addText = () => {
    if (tempText.trim()) {
      setTexts(prev => [...prev, {
        text: tempText,
        x: textPosition.x,
        y: textPosition.y,
        color: selectedColor,
        size: tempTextSize
      }]);
      setTempText('');
      setTempTextSize(32);
      setShowTextInput(false);
    }
  };

  const handleTextMouseDown = (e, index) => {
    e.stopPropagation();
    setSelectedTextIndex(index);
    setIsDraggingText(true);
  };

  const handleTextDrag = (e) => {
    if (!isDraggingText || selectedTextIndex === null) return;
    
    const coords = getCanvasCoordinates(e);
    setTexts(prev => prev.map((text, index) => 
      index === selectedTextIndex 
        ? { ...text, x: coords.x, y: coords.y }
        : text
    ));
  };

  const handleTextMouseUp = () => {
    setIsDraggingText(false);
    setSelectedTextIndex(null);
  };

  const deleteSelectedText = () => {
    if (selectedTextIndex !== null) {
      setTexts(prev => prev.filter((_, index) => index !== selectedTextIndex));
      setSelectedTextIndex(null);
    }
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      setDrawings(prev => prev.slice(0, -1));
    } else if (texts.length > 0) {
      setTexts(prev => prev.slice(0, -1));
    }
  };

  const handleSend = () => {
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
      } else if (drawing.type === 'arrow') {
        drawArrow(ctx, drawing.startX, drawing.startY, drawing.endX, drawing.endY);
      }
    });
    
    // Draw texts
    texts.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `bold ${text.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(text.text, text.x, text.y);
    });
    
    canvas.toBlob((blob) => {
      onSend(caption.trim(), blob);
    }, 'image/jpeg', 0.95);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="flex items-center justify-between p-4 bg-black/90"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-white rounded-full hover:bg-white/10"
          >
            <FiX size={24} />
          </motion.button>
          
          <h3 className="text-white font-medium text-lg">Edit Photo</h3>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            className="px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600"
          >
            Send
          </motion.button>
        </motion.div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-4 relative bg-black">
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={image.url}
              alt={image.fileName}
              className="max-w-full max-h-full object-contain rounded-lg block"
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 cursor-crosshair rounded-lg pointer-events-auto"
              onMouseDown={(e) => {
                // Check if clicking on text
                const coords = getCanvasCoordinates(e);
                let clickedTextIndex = null;
                
                texts.forEach((text, index) => {
                  const canvas = canvasRef.current;
                  const img = imageRef.current;
                  const rect = img.getBoundingClientRect();
                  const scaleX = rect.width / img.naturalWidth;
                  const scaleY = rect.height / img.naturalHeight;
                  
                  const ctx = canvas.getContext('2d');
                  ctx.font = `bold ${text.size * Math.min(scaleX, scaleY)}px Arial`;
                  const textWidth = ctx.measureText(text.text).width;
                  const textHeight = text.size * Math.min(scaleX, scaleY);
                  
                  if (coords.x >= (text.x * scaleX - textWidth/2) / scaleX &&
                      coords.x <= (text.x * scaleX + textWidth/2) / scaleX &&
                      coords.y >= (text.y * scaleY - textHeight) / scaleY &&
                      coords.y <= text.y) {
                    clickedTextIndex = index;
                  }
                });
                
                if (clickedTextIndex !== null) {
                  handleTextMouseDown(e, clickedTextIndex);
                } else {
                  handleMouseDown(e);
                }
              }}
              onMouseMove={(e) => {
                if (isDraggingText) {
                  handleTextDrag(e);
                } else {
                  handleMouseMove(e);
                }
              }}
              onMouseUp={(e) => {
                if (isDraggingText) {
                  handleTextMouseUp();
                } else {
                  handleMouseUp(e);
                }
              }}
              onClick={handleCanvasClick}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Bottom Tools */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-black/95 p-4 space-y-4"
        >
          {/* Tools Row */}
          <div className="flex items-center justify-center space-x-4">
            {/* Color Picker */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-12 h-12 rounded-full border-3 border-white/30 flex items-center justify-center"
              style={{ backgroundColor: selectedColor }}
            >
              <FiDroplet className="text-white" size={20} />
            </motion.button>

            {/* Tools */}
            {tools.map(tool => (
              <motion.button
                key={tool.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEditMode(editMode === tool.id ? null : tool.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  editMode === tool.id 
                    ? 'bg-white text-black' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <tool.icon size={20} />
              </motion.button>
            ))}

            {/* Undo */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUndo}
              disabled={drawings.length === 0 && texts.length === 0}
              className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 disabled:opacity-50"
            >
              <FiRotateCcw size={20} />
            </motion.button>
          </div>

          {/* Color Palette */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex justify-center space-x-3"
              >
                {colors.map(color => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor === color ? 'border-white' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Size for selected text */}
          {selectedTextIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center space-x-4"
            >
              <span className="text-white/70 text-sm">Text Size</span>
              <input
                type="range"
                min="16"
                max="72"
                value={texts[selectedTextIndex]?.size || 32}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setTexts(prev => prev.map((text, index) => 
                    index === selectedTextIndex 
                      ? { ...text, size: newSize }
                      : text
                  ));
                }}
                className="w-32 accent-white"
              />
              <span className="text-white text-sm w-8">{texts[selectedTextIndex]?.size || 32}</span>
            </motion.div>
          )}

          {/* Brush Size */}
          {editMode && editMode !== 'text' && selectedTextIndex === null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center space-x-4"
            >
              <span className="text-white/70 text-sm">
                {editMode === 'eraser' ? 'Eraser Size' : 'Brush Size'}
              </span>
              <input
                type="range"
                min="2"
                max={editMode === 'eraser' ? "20" : "12"}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32 accent-white"
              />
              <span className="text-white text-sm w-8">{brushSize}</span>
            </motion.div>
          )}

          {/* Caption Input */}
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1 px-4 py-3 bg-white/10 text-white placeholder-white/60 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </motion.div>

        {/* Text Input Modal */}
        <AnimatePresence>
          {showTextInput && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4 text-center text-white">Add Text</h3>
                <input
                  type="text"
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  placeholder="Type something..."
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl mb-4 text-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <div className="mb-4">
                  <label className="block text-white/70 text-sm mb-2">Text Size</label>
                  <input
                    type="range"
                    min="16"
                    max="72"
                    value={tempTextSize}
                    onChange={(e) => setTempTextSize(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-center text-white text-sm mt-1">{tempTextSize}px</div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowTextInput(false);
                      setTempText('');
                      setTempTextSize(32);
                    }}
                    className="flex-1 py-3 px-4 border-2 border-gray-600 rounded-xl font-medium text-white hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addText}
                    className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Controls */}
        <AnimatePresence>
          {selectedTextIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-xl p-4 flex items-center space-x-3 border border-gray-700"
            >
              <span className="text-white text-sm">Selected Text</span>
              <button
                onClick={deleteSelectedText}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedTextIndex(null)}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
              >
                Deselect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}