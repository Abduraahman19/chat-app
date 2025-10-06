'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';

export default function TestCloudinary() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50"
        >
          <h1 className="text-2xl font-bold text-center mb-8 text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
            Test Cloudinary Upload
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image to Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center p-4 bg-blue-50 rounded-xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"
                />
                <span className="text-blue-700 font-medium">Uploading...</span>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 rounded-xl border border-green-200"
              >
                <div className="flex items-center mb-3">
                  <FiCheck className="text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Upload Successful!</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{result.url}</a></p>
                  <p><strong>Public ID:</strong> {result.public_id}</p>
                </div>
                {result.url && (
                  <div className="mt-4">
                    <img 
                      src={result.url} 
                      alt="Uploaded" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto shadow-lg"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 rounded-xl border border-red-200"
              >
                <div className="flex items-center">
                  <FiX className="text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Upload Failed</span>
                </div>
                <p className="text-red-700 text-sm mt-2">{error}</p>
              </motion.div>
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-2">Setup Instructions:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Create a Cloudinary account</li>
              <li>2. Update your .env.local with credentials</li>
              <li>3. Test upload here</li>
              <li>4. Check CLOUDINARY_SETUP.md for details</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}