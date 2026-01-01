/**
 * IMAGE UTILITIES
 * 
 * Provides image compression and hashing for API cost optimization.
 */

const MAX_DIMENSION = 1024;
const COMPRESSION_QUALITY = 0.8;

/**
 * Compress and resize an image for API submission
 * Reduces API costs by 50-70% through smaller image sizes
 */
export async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions, maintaining aspect ratio
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with compression (WebP has inconsistent browser support for toDataURL)
        const compressedUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
        
        console.log(`[ImageUtils] Compressed from ${dataUrl.length} to ${compressedUrl.length} chars (${Math.round((1 - compressedUrl.length / dataUrl.length) * 100)}% reduction)`);
        
        resolve(compressedUrl);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Generate a simple hash from image data for caching
 * Uses a fast non-cryptographic hash suitable for duplicate detection
 */
export async function hashImage(dataUrl: string): Promise<string> {
  // Extract base64 data
  const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.*)$/);
  if (!base64Match) {
    throw new Error('Invalid image data URL');
  }
  
  const base64Data = base64Match[1];
  
  // Use SubtleCrypto for SHA-256 hash (available in all modern browsers)
  const encoder = new TextEncoder();
  const data = encoder.encode(base64Data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return first 16 characters for a compact but unique identifier
  return hashHex.substring(0, 16);
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(dataUrls: string[]): Promise<string[]> {
  return Promise.all(dataUrls.map(compressImage));
}
