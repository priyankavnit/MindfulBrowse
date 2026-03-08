export function shouldTrackUrl(url: string): boolean {
  // Exclude internal browser pages
  if (url.startsWith('chrome://')) return false;
  if (url.startsWith('about:')) return false;
  if (url.startsWith('edge://')) return false;
  if (url.startsWith('firefox://')) return false;
  if (url.startsWith('brave://')) return false;
  
  // Exclude extension pages
  if (url.startsWith('chrome-extension://')) return false;
  if (url.startsWith('moz-extension://')) return false;
  if (url.startsWith('extension://')) return false;
  
  // Exclude local files
  if (url.startsWith('file://')) return false;
  
  // Exclude data URLs
  if (url.startsWith('data:')) return false;
  
  // Only track HTTP and HTTPS
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  return true;
}
