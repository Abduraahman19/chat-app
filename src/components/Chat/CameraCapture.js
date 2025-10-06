'use client'
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCamera, FiRotateCw, FiCheck, FiRefreshCw } from 'react-icons/fi';
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
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Camera access denied or not available');
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

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setCapturedImage({
        blob,
        url,
        width: canvas.width,
        height: canvas.height
      });
      setIsCapturing(false);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    startCamera();
  };

  const sendPhoto = () => {
    if (capturedImage) {
      // Create file from blob
      const file = new File([capturedImage.blob], `camera-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });
      
      onCapture(file, capturedImage.url);
      onClose();
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
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm text-white relative z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <FiX size={24} />
          </motion.button>
          
          <h3 className="text-lg font-semibold">
            {capturedImage ? 'Photo Preview' : 'Take Photo'}
          </h3>
          
          {!capturedImage && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={switchCamera}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <FiRotateCw size={24} />
            </motion.button>
          )}
        </div>

        {/* Camera/Preview Area */}
        <div className="flex-1 relative overflow-hidden">
          {!capturedImage ? (
            // Live Camera View
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
                
                {/* Center Focus Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 border-2 border-white/60 rounded-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Captured Photo Preview
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage.url}
                alt="Captured"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-black/80 backdrop-blur-sm">
          {!capturedImage ? (
            // Camera Controls
            <div className="flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={capturePhoto}
                disabled={isCapturing || !stream}
                className={`w-20 h-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center ${
                  isCapturing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCapturing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiRefreshCw size={32} className="text-white" />
                  </motion.div>
                ) : (
                  <FiCamera size={32} className="text-white" />
                )}
              </motion.button>
            </div>
          ) : (
            // Preview Controls
            <div className="flex items-center justify-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={retakePhoto}
                className="flex items-center px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <FiRefreshCw className="mr-2" size={20} />
                Retake
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendPhoto}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <FiCheck className="mr-2" size={20} />
                Send
              </motion.button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!capturedImage && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white/60 text-center">
            <p className="text-sm">Tap the camera button to take a photo</p>
          </div>
        )}

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </AnimatePresence>
  );
}