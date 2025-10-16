'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiDownload } from 'react-icons/fi';

export default function ImagePreview({ image, onSend, onClose }) {
  const [caption, setCaption] = useState('');

  const handleSend = () => {
    onSend(caption.trim());
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.fileName || 'image.jpg';
    a.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/70 backdrop-blur-xl border-b border-white/20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <FiX size={24} />
          </motion.button>
          
          <h3 className="text-white font-medium">Send Image</h3>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="p-2 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <FiDownload size={20} />
          </motion.button>
        </div>

        {/* Image Display */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={image.url}
            alt={image.fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Caption Input */}
        <div className="p-4 bg-black/70 backdrop-blur-xl border-t border-white/20">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1 px-4 py-3 bg-white/10 text-white placeholder-white/60 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
            >
              <FiSend size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}