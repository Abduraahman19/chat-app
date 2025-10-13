export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, filename, contentType } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch the file from Cloudinary
    const response = await fetch(decodeURIComponent(url));
    
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }

    const buffer = await response.arrayBuffer();
    const decodedFilename = filename ? decodeURIComponent(filename) : 'download';
    const decodedContentType = contentType ? decodeURIComponent(contentType) : 'application/octet-stream';
    
    // Set proper headers for download
    res.setHeader('Content-Type', decodedContentType);
    res.setHeader('Content-Disposition', `attachment; filename="${decodedFilename}"`);
    res.setHeader('Content-Length', buffer.byteLength);
    
    // Send the file
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}