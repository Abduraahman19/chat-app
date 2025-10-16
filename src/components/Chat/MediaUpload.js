'use client'
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiImage, 
  FiFile, 
  FiEdit3,
  FiX, 
  FiCheck,
  FiMaximize2
} from 'react-icons/fi';
import FullscreenViewer from './FullscreenViewer';
import ImageEditor from './ImageEditor';


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

  const [isDragOver, setIsDragOver] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

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
    
    // Only images are supported now
    formData.append('resource_type', 'image');
    
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

      // Use 'auto' for all files to let Cloudinary handle format detection
      const resourceType = 'auto';
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
        originalType: file.type,
        ...(type === 'image' && {
          width: uploadResult.width,
          height: uploadResult.height
        }),
        ...(type === 'video' && {
          width: uploadResult.width,
          height: uploadResult.height,
          duration: uploadResult.duration
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
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const isFileTypeSupported = (file) => {
    const supportedTypes = [
      // Images only
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'
    ];
    
    return supportedTypes.includes(file.type);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e, expectedType) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file, expectedType);
    }
  };

  const handleFileSelection = (file, expectedType) => {
    // Check if file type is supported
    if (!isFileTypeSupported(file)) {
      toast.error(`File type "${file.type || 'unknown'}" is not supported. Please select only Images (JPG, PNG, GIF, WebP).`);
      return;
    }

    const actualType = getFileType(file);
    if (expectedType && actualType !== expectedType) {
      toast.error(`Please select a ${expectedType} file`);
      return;
    }
    
    const maxSizes = {
      image: 10 * 1024 * 1024,
      video: 50 * 1024 * 1024,
      audio: 25 * 1024 * 1024,
      file: 15 * 1024 * 1024
    };

    const maxSize = maxSizes[actualType] || 15 * 1024 * 1024;
    
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      const typeNames = { image: 'Image', video: 'Video', audio: 'Audio', file: 'File' };
      toast.error(`${typeNames[actualType] || 'File'} size must be less than ${sizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    
    if (actualType === 'image') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    
    setShowPreview(true);
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
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-lg"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100/50 bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
            <h3 className="text-xl font-semibold text-gray-800">Share Photo</h3>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <FiX size={18} />
            </motion.button>
          </div>

          {uploading && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
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
            <div className="p-6 border-b border-gray-100/50">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                {selectedFile && getFileType(selectedFile) === 'image' ? (
                  <div className="relative group">
                    <div className="relative overflow-hidden bg-gray-100 rounded-xl">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="object-cover w-full transition-transform duration-300 cursor-pointer max-h-80 group-hover:scale-105"
                        onClick={() => setShowFullscreen(true)}
                      />
                      <div className="absolute inset-0 transition-all duration-300 opacity-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:opacity-100">
                        <div className="absolute flex space-x-2 top-3 right-3">

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFullscreen(true)}
                            className="p-2.5 bg-white/90 text-gray-700 rounded-full shadow-lg backdrop-blur-sm hover:bg-white transition-colors"
                          >
                            <FiMaximize2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-4 border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="p-3 mr-4 bg-white rounded-lg shadow-sm">
                      <FiFile className="text-gray-500" size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedFile?.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full p-4 text-gray-800 transition-all duration-200 border-2 border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50"
                  rows={3}
                />
              </motion.div>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelPreview}
                  className="flex-1 px-4 py-3 font-medium text-gray-700 transition-all duration-200 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400"
                >
                  Cancel
                </motion.button>
<motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEditor(true)}
                  className="flex items-center justify-center px-4 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600"
                >
                  <FiEdit3 className="mr-2" size={16} />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendMedia}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                >
                  Send Photo
                </motion.button>
              </div>
            </div>
          )}

          {!showPreview && (
            <div className="p-6">
              {/* Professional Drag & Drop Area */}
              <motion.div
                animate={{
                  borderColor: isDragOver ? '#6366f1' : '#e5e7eb',
                  backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.05)' : 'rgba(249, 250, 251, 0.5)'
                }}
                className={`mb-6 p-10 border-2 border-dashed rounded-2xl text-center transition-all duration-300 relative overflow-hidden ${
                  isDragOver ? 'border-indigo-400 shadow-lg' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>
                
                <motion.div
                  animate={{ 
                    scale: isDragOver ? 1.05 : 1,
                    y: isDragOver ? -5 : 0
                  }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isDragOver ? 'bg-indigo-100 shadow-lg' : 'bg-gray-100'
                  }`}>
                    <FiImage className={`w-8 h-8 ${isDragOver ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    isDragOver ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                    {isDragOver ? 'Drop your photo here' : 'Drag & drop your photo'}
                  </p>
                  <p className="text-sm text-gray-500">or choose from gallery below</p>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 gap-3">
                {mediaOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => option.ref.current?.click()}
                    disabled={uploading}
                    className={`flex items-center p-5 rounded-2xl bg-gradient-to-r ${option.color} text-white shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Enhanced shine effect */}
                    <motion.div
                      animate={{ x: [-120, 120] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                      className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:via-white/35"
                    />
                    
                    <div className="relative z-10 flex items-center w-full">
                      <div className="p-3 mr-4 bg-white/20 rounded-xl backdrop-blur-sm">
                        <option.icon size={22} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-lg font-semibold">{option.label}</h4>
                        <p className="text-sm opacity-90 mt-0.5">
                          Max 10MB • JPG, PNG, GIF, WebP
                        </p>
                      </div>
                      <div className="text-2xl opacity-60">
                        →
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
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
        </motion.div>
        
        {/* Fullscreen Viewer */}
        {showFullscreen && selectedFile && (
          <div className="fixed inset-0 z-[99999]" style={{ zIndex: 99999 }}>
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
          </div>
        )}

        {/* WhatsApp-Style Image Editor */}
        {showEditor && selectedFile && (
          <div className="fixed inset-0 z-[99999]" style={{ zIndex: 99999 }}>
            <ImageEditor
              image={{
                url: previewUrl,
                fileName: selectedFile.name
              }}
              onSend={async (caption, editedBlob) => {
                try {
                  const editedFile = new File([editedBlob], selectedFile.name, { type: 'image/jpeg' });
                  
                  setUploading(true);
                  setUploadProgress(0);
                  
                  const progressInterval = setInterval(() => {
                    setUploadProgress(prev => Math.min(prev + 10, 90));
                  }, 200);
                  
                  const uploadResult = await uploadToCloudinary(editedFile, 'auto');
                  
                  clearInterval(progressInterval);
                  setUploadProgress(100);
                  
                  const mediaData = {
                    type: 'image',
                    url: uploadResult.url,
                    publicId: uploadResult.publicId,
                    fileName: editedFile.name,
                    fileSize: uploadResult.bytes,
                    format: uploadResult.format,
                    originalType: editedFile.type,
                    width: uploadResult.width,
                    height: uploadResult.height
                  };
                  
                  setTimeout(() => {
                    onMediaSelect(mediaData, caption);
                    onClose();
                  }, 500);
                  
                  setShowEditor(false);
                } catch (error) {
                  console.error('Error uploading edited image:', error);
                  toast.error('Failed to upload edited image');
                  setUploading(false);
                  setUploadProgress(0);
                }
              }}
              onClose={() => setShowEditor(false)}
            />
          </div>
        )}

        

      </motion.div>
    </AnimatePresence>
  );
}