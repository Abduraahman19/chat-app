'use client'
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiX, FiRotateCw, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function CameraCapture({ onCapture, onClose }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        setIsCapturing(true);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    setIsCapturing(false);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      // Convert blob URL to file
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        });
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col"
      >
        {/* Professional Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 bg-black/70 backdrop-blur-xl border-b border-white/20"
        >
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2.5 text-white/90 rounded-xl hover:bg-red-500/20 transition-all duration-200"
          >
            <FiX size={20} />
          </motion.button>
          
          <h3 className="text-white font-medium text-lg">Camera</h3>
          
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={switchCamera}
            className="p-2.5 text-white/90 rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <FiRotateCw size={18} />
          </motion.button>
        </motion.div>

        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden">
          {!isCapturing ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Professional Camera Controls */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-8 left-0 right-0 flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-4 border-white">
                    <FiCamera size={28} className="text-gray-700" />
                  </div>
                  {/* Pulse animation */}
                  <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                </motion.button>
              </motion.div>
            </>
          ) : (
            <>
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
              
              {/* Professional Confirm Controls */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={retakePhoto}
                  className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500/30 transition-all duration-200 border border-white/20"
                >
                  <FiX size={22} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmPhoto}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-2xl"
                >
                  <FiCheck size={24} />
                </motion.button>
              </motion.div>
            </>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </AnimatePresence>
  );
}