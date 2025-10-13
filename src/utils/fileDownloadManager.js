// File Download Manager with localStorage caching and format conversion
class FileDownloadManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB cache limit
  }

  // Generate cache key from file URL and metadata
  generateCacheKey(media) {
    return `file_${media.publicId || btoa(media.url)}_${media.fileName}`;
  }

  // Store file in memory cache only (localStorage corrupts binary files)
  async storeInCache(cacheKey, blob, metadata) {
    try {
      const cacheData = {
        blob: blob,
        metadata: metadata,
        timestamp: Date.now(),
        size: blob.size
      };
      
      // Check cache size limit
      if (this.getCacheSize() + blob.size > this.maxCacheSize) {
        this.clearOldestCache();
      }
      
      this.cache.set(cacheKey, cacheData);
      return cacheData;
    } catch (error) {
      console.error('Cache storage failed:', error);
      throw error;
    }
  }

  // Get file from memory cache
  getFromCache(cacheKey) {
    try {
      return this.cache.get(cacheKey) || null;
    } catch (error) {
      console.error('Cache retrieval failed:', error);
      return null;
    }
  }

  // Create blob with proper MIME type
  createBlobWithMimeType(originalBlob, mimeType) {
    return new Blob([originalBlob], { type: mimeType });
  }

  // Get proper MIME type based on original file type
  getMimeType(media) {
    if (media.originalType) {
      return media.originalType;
    }
    
    // Fallback based on file extension
    const ext = media.fileName?.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'mp4': 'video/mp4',
      'avi': 'video/avi',
      'mov': 'video/quicktime'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Get raw file URL for proper download
  getRawFileUrl(media) {
    if (!media.url || !media.publicId) return media.url;
    
    // For raw files (PDFs, docs), ensure we get the original file
    if (media.url.includes('/raw/upload/')) {
      return media.url;
    }
    
    // Convert to raw URL if it's not already
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/raw/upload/${media.publicId}`;
  }

  // Download file directly from Cloudinary URL
  async downloadFile(media) {
    try {
      const downloadUrl = this.getRawFileUrl(media);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = media.fileName || 'download';
      a.target = '_blank';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      console.log(`File downloaded: ${media.fileName}`);
      return true;
      
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Open file directly from Cloudinary URL
  async openFile(media) {
    try {
      const fileUrl = this.getRawFileUrl(media);
      window.open(fileUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Open failed:', error);
      throw error;
    }
  }

  // Get current cache size
  getCacheSize() {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      totalSize += value.size || 0;
    }
    return totalSize;
  }

  // Clear oldest cache entries
  clearOldestCache() {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      localStorage.removeItem(key);
    }
  }

  // Clear all cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache info
  getCacheInfo() {
    return {
      size: this.getCacheSize(),
      count: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}

// Create singleton instance
const fileDownloadManager = new FileDownloadManager();

export default fileDownloadManager;