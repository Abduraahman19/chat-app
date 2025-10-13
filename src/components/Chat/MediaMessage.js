'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDownload, 
  FiPlay, 
  FiPause, 
  FiFile, 
  FiImage,
  FiVideo,
  FiMaximize2,
  FiX,
  FiEye
} from 'react-icons/fi';
import FullscreenViewer from './FullscreenViewer';
import { toast } from 'react-hot-toast';

export default function MediaMessage({ media, isOwn, messageText }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    
    const downloadUrl = `/api/download-file?url=${encodeURIComponent(media.url)}&filename=${encodeURIComponent(media.fileName)}&contentType=${encodeURIComponent(media.originalType || 'application/octet-stream')}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = media.fileName;
    a.click();
  };

  const handleOpenFile = (e) => {
    e.stopPropagation();
    
    const viewUrl = `/api/download-file?url=${encodeURIComponent(media.url)}&filename=${encodeURIComponent(media.fileName)}&contentType=${encodeURIComponent(media.originalType || 'application/octet-stream')}`;
    
    window.open(viewUrl, '_blank');
  };

  // Handle all image formats
  if (media.type === 'image' || (media.originalType && media.originalType.startsWith('image/'))) {
    return (
      <div className="relative group max-w-sm">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
          onClick={() => setShowFullscreen(true)}
        >
          <img
            src={media.url}
            alt={media.fileName}
            className="w-full h-auto max-h-80 object-cover"
            loading="lazy"
          />
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFullscreen(true)}
                className="p-2 bg-white/90 text-gray-800 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <FiMaximize2 size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleDownload(e)}
                className="p-2 bg-white/90 text-gray-800 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <FiDownload size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* File Info */}
        <div className={`mt-2 text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          <div className="flex items-center justify-between">
            <span className="truncate">{media.fileName}</span>
            <span>{formatFileSize(media.fileSize || 0)}</span>
          </div>
        </div>
        
        {/* Message Text */}
        {messageText && (
          <div className={`mt-2 text-sm ${isOwn ? 'text-white' : 'text-gray-800'}`}>
            {messageText}
          </div>
        )}

        {/* Fullscreen Viewer */}
        {showFullscreen && (
          <FullscreenViewer
            media={media}
            messageText={messageText}
            onClose={() => setShowFullscreen(false)}
          />
        )}
      </div>
    );
  }

  // Handle all video formats
  if (media.type === 'video' || (media.originalType && media.originalType.startsWith('video/'))) {
    return (
      <div className="relative group max-w-sm">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl shadow-lg bg-black"
        >
          <video
            src={media.url}
            className="w-full h-auto max-h-80 object-cover"
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Video Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-4 bg-white/90 text-gray-800 rounded-full shadow-lg"
              >
                <FiPlay size={24} />
              </motion.div>
            </div>
          )}

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiDownload size={16} />
          </motion.button>
        </motion.div>

        {/* Video Info */}
        <div className={`mt-2 text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          <div className="flex items-center justify-between">
            <span className="truncate">{media.fileName}</span>
            <div className="flex items-center space-x-2">
              {media.duration && <span>{formatDuration(media.duration)}</span>}
              <span>{formatFileSize(media.fileSize)}</span>
            </div>
          </div>
        </div>
        
        {/* Message Text */}
        {messageText && (
          <div className={`mt-2 text-sm ${isOwn ? 'text-white' : 'text-gray-800'}`}>
            {messageText}
          </div>
        )}
      </div>
    );
  }

  // Handle all other file types (audio, documents, etc.)
  const getFileIcon = () => {
    if (media.originalType) {
      if (media.originalType.startsWith('audio/')) return '🎵';
      if (media.originalType.startsWith('video/')) return '🎬';
      if (media.originalType.includes('pdf')) return '📄';
      if (media.originalType.includes('word') || media.originalType.includes('doc')) return '📝';
      if (media.originalType.includes('excel') || media.originalType.includes('sheet')) return '📊';
      if (media.originalType.includes('powerpoint') || media.originalType.includes('presentation')) return '📋';
      if (media.originalType.includes('zip') || media.originalType.includes('rar')) return '🗜️';
      if (media.originalType.includes('text')) return '📄';
    }
    return '📎';
  };

  const getFileTypeLabel = () => {
    if (media.originalType) {
      if (media.originalType.startsWith('audio/')) return 'Audio';
      if (media.originalType.startsWith('video/')) return 'Video';
      if (media.originalType.includes('pdf')) return 'PDF';
      if (media.originalType.includes('word') || media.originalType.includes('doc')) return 'Document';
      if (media.originalType.includes('excel') || media.originalType.includes('sheet')) return 'Spreadsheet';
      if (media.originalType.includes('powerpoint') || media.originalType.includes('presentation')) return 'Presentation';
      if (media.originalType.includes('zip') || media.originalType.includes('rar')) return 'Archive';
      if (media.originalType.includes('text')) return 'Text';
    }
    return 'File';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center p-4 rounded-xl shadow-lg max-w-sm cursor-pointer ${
        isOwn 
          ? 'bg-green-600 text-white' 
          : 'bg-white border border-gray-200 text-gray-800'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        // For PDFs and documents, use file manager to open
        if (media.originalType && (media.originalType.includes('pdf') || media.originalType.includes('document'))) {
          handleOpenFile(e);
        } else {
          setShowFullscreen(true);
        }
      }}
    >
      <div className={`p-3 rounded-lg mr-4 flex items-center justify-center text-2xl ${
        isOwn ? 'bg-white/20' : 'bg-gray-100'
      }`}>
        <span>{getFileIcon()}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>
          {media.fileName}
        </h4>
        <p className={`text-sm ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          {getFileTypeLabel()} • {formatFileSize(media.fileSize)}
        </p>
        
        {/* Message Text for Files */}
        {messageText && (
          <p className={`text-sm mt-1 ${isOwn ? 'text-white/90' : 'text-gray-700'}`}>
            {messageText}
          </p>
        )}
      </div>

      <div className="flex space-x-2">
        {/* Open File Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => handleOpenFile(e)}
          className={`p-2 rounded-full transition-colors ${
            isOwn 
              ? 'hover:bg-white/20 text-white' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Open file"
        >
          <FiEye size={16} />
        </motion.button>
        
        {/* Download Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => handleDownload(e)}
          className={`p-2 rounded-full transition-colors ${
            isOwn 
              ? 'hover:bg-white/20 text-white' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Download file"
        >
          <FiDownload size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}