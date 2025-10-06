'use client'
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiImage, 
  FiFile, 
  FiCamera, 
  FiX, 
  FiCheck,
  FiMaximize2
} from 'react-icons/fi';
import FullscreenViewer from './FullscreenViewer';
import CameraCapture from './CameraCapture';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

const createUploadPreset = async () => {
  try {
    const response = await fetch('/api/create-preset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default function MediaUpload({ onMediaSelect, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [presetCreated, setPresetCreated] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Skip preset creation, use existing ml_default
  useState(() => {
    setPresetCreated(true);
  }, []);

  const uploadToCloudinary = async (file, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    formData.append('resource_type', resourceType);
    
    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type,
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        duration: data.duration
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Upload failed. Please try again.');
    }
  };

  const handleFileSelect = async (file, type) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const resourceType = type === 'image' ? 'image' : 'raw';
      const uploadResult = await uploadToCloudinary(file, resourceType);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const mediaData = {
        type,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        fileName: file.name,
        fileSize: uploadResult.bytes,
        format: uploadResult.format,
        ...(type === 'image' && {
          width: uploadResult.width,
          height: uploadResult.height
        })
      };

      setTimeout(() => {
        onMediaSelect(mediaData, message.trim());
        onClose();
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    return 'file';
  };

  const handleFileChange = (e, expectedType) => {
    const file = e.target.files[0];
    if (file) {
      const actualType = getFileType(file);
      if (expectedType && actualType !== expectedType) {
        toast.error(`Please select a ${expectedType} file`);
        return;
      }
      
      const maxSizes = {
        image: 10 * 1024 * 1024,
        file: 15 * 1024 * 1024
      };

      const maxSize = maxSizes[actualType] || 15 * 1024 * 1024;
      
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        toast.error(`${actualType === 'image' ? 'Image' : 'File'} size must be less than ${sizeMB}MB`);
        return;
      }

      setSelectedFile(file);
      
      if (actualType === 'image') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      setShowPreview(true);
    }
  };



  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage('');
    setShowPreview(false);
  };

  const handleCameraCapture = (file, previewUrl) => {
    setSelectedFile(file);
    setPreviewUrl(previewUrl);
    setShowPreview(true);
    setShowCamera(false);
  };

  const handleSendMedia = async () => {
    if (!selectedFile) return;
    
    const actualType = getFileType(selectedFile);
    setShowPreview(false);
    await handleFileSelect(selectedFile, actualType);
  };

  const mediaOptions = [
    {
      id: 'image',
      label: 'Photo',
      icon: FiImage,
      color: 'from-green-500 to-emerald-500',
      accept: 'image/*',
      ref: imageInputRef
    },
    {
      id: 'file',
      label: 'Document',
      icon: FiFile,
      color: 'from-blue-500 to-indigo-500',
      accept: '*/*',
      ref: fileInputRef
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Share Media</h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX size={20} />
            </motion.button>
          </div>

          {uploading && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                />
              </div>
              {uploadProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-green-600"
                >
                  <FiCheck className="mr-2" />
                  <span className="text-sm">Upload complete!</span>
                </motion.div>
              )}
            </div>
          )}

          {showPreview && (
            <div className="p-6 border-b border-gray-100">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Preview</h4>
                
                {selectedFile && getFileType(selectedFile) === 'image' ? (
                  <div className="relative group">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full max-h-64 object-cover rounded-lg cursor-pointer"
                      onClick={() => setShowFullscreen(true)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowFullscreen(true)}
                        className="p-3 bg-white/90 text-gray-800 rounded-full shadow-lg"
                      >
                        <FiMaximize2 size={20} />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <FiFile className="text-gray-500 mr-3" size={24} />
                    <div>
                      <p className="font-medium text-gray-800">{selectedFile?.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelPreview}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendMedia}
                  disabled={uploading}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors disabled:opacity-50"
                >
                  Send
                </motion.button>
              </div>
            </div>
          )}

          {!showPreview && (
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {mediaOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => option.ref.current?.click()}
                    disabled={uploading}
                    className={`flex items-center p-4 rounded-xl bg-gradient-to-r ${option.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <motion.div
                      animate={{ x: [-100, 200] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                    
                    <div className="flex items-center relative z-10">
                      <div className="p-2 bg-white/20 rounded-lg mr-4">
                        <option.icon size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold">{option.label}</h4>
                        <p className="text-sm opacity-90">
                          {option.id === 'image' && 'Max 10MB - JPG, PNG, WebP'}
                          {option.id === 'file' && 'Max 15MB - PDF, DOC, TXT'}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCamera(true)}
                disabled={uploading}
                className={`w-full mt-3 flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiCamera className="mr-2" size={20} />
                <span className="font-medium">Take Photo</span>
              </motion.button>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
            capture="environment"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            onChange={(e) => handleFileChange(e, null)}
            className="hidden"
          />
        </motion.div>
        
        {/* Fullscreen Viewer */}
        {showFullscreen && selectedFile && (
          <FullscreenViewer
            media={{
              type: getFileType(selectedFile),
              url: previewUrl,
              fileName: selectedFile.name,
              fileSize: selectedFile.size
            }}
            messageText={message}
            onClose={() => setShowFullscreen(false)}
          />
        )}
        
        {/* Camera Capture */}
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}