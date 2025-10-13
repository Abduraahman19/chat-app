'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { toast } from 'react-hot-toast';

const GroupPhotoUpload = ({ groupId, currentPhoto, isAdmin, onClose, onPhotoUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!preview || !selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/upload-group-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const photoURL = result.url;
      
      // Update Firestore
      await updateDoc(doc(db, 'chats', groupId), {
        groupPhoto: photoURL
      });

      onPhotoUpdate(photoURL);
      toast.success('Group photo updated!');
      onClose();
    } catch (error) {
      console.error('Error updating group photo:', error);
      toast.error('Failed to update group photo');
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 bg-white rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Update Group Photo</h3>
          <button onClick={onClose} className="p-2 text-gray-800 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current/Preview Photo */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-100 rounded-full">
              {preview || currentPhoto ? (
                <img 
                  src={preview || currentPhoto} 
                  alt="Group" 
                  className="object-cover w-full h-full"
                />
              ) : (
                <CameraIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>

          {/* File Input */}
          <div className="flex justify-center">
            <label className="px-4 py-2 text-white transition-colors bg-indigo-500 rounded-lg cursor-pointer hover:bg-indigo-600">
              <CameraIcon className="inline w-5 h-5 mr-2" />
              Choose Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Action Buttons */}
          {preview && (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="flex-1 py-2 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={uploadPhoto}
                disabled={uploading}
                className="flex-1 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Update'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupPhotoUpload;