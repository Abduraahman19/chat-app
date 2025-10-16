'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiImage, FiFile, FiMic } from 'react-icons/fi';

export default function AttachmentMenu({ isOpen, onClose, onCameraClick, onGalleryClick, onFileClick }) {
  const attachmentOptions = [
    {
      id: 'camera',
      label: 'Camera',
      icon: FiCamera,
      color: 'from-green-500 to-emerald-500',
      onClick: onCameraClick
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: FiImage,
      color: 'from-blue-500 to-indigo-500',
      onClick: onGalleryClick
    },
    {
      id: 'document',
      label: 'Document',
      icon: FiFile,
      color: 'from-purple-500 to-violet-500',
      onClick: onFileClick
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-16 left-4 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Share</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {attachmentOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      option.onClick();
                      onClose();
                    }}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-2 shadow-lg`}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}