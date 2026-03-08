# Browser Extension Setup Guide

## Quick Start

### 1. Build the Extension

```bash
# From project root
npm install

# Build extension
npm run build --workspace=packages/browser-extension
```

### 2. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Navigate to `packages/browser-extension/dist/`
5. Click "Select Folder"

The extension should now appear in your extensions list!

### 3. Configure API Settings

After deploying your infrastructure, you need to configure the extension with your API URL and auth token.

**Option A: Via Console**

1. Right-click the extension icon → "Inspect popup" (or open any page and press F12)
2. In the Console tab, run:

```javascript
chrome.storage.sync.set({
  apiUrl: 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod',
  authToken: 'your-cognito-jwt-token-here'
}, () => {
  console.log('Configuration saved!');
});
```

**Option B: Via Background Script**

1. Go to `chrome://extensions/`
2. Find "Mindful Browse"
3. Click "service worker" link
4. In the console, run the same code as Option A

### 4. Get Your Configuration Values

**API URL:**
```bash
# After deploying infrastructure
aws cloudformation describe-stacks \
  --stack-name MindfulBrowseStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

**Auth Token:**
```bash
# Create test user and get token
./scripts/create-test-user.sh dev testuser@example.com

# Copy the token from the output
```

### 5. Test the Extension

1. Browse to any website (e.g., https://example.com)
2. Stay on the page for at least 5 seconds
3. Switch to another tab or close the tab
4. Check the background script console for logs:
   - Go to `chrome://extensions/`
   - Click "service worker" under Mindful Browse
   - Look for "Event sent successfully" or similar messages

### 6. Verify Events in DynamoDB

```bash
# Query DynamoDB to see stored events
aws dynamodb scan \
  --table-name MindfulBrowse-dev \
  --limit 5
```

## Troubleshooting

### Extension not loading
- **Error:** "Manifest file is missing or unreadable"
- **Solution:** Make sure you selected the `dist/` folder, not the root folder

### No events being sent
- **Check 1:** Verify API URL is set
  ```javascript
  chrome.storage.sync.get(['apiUrl'], console.log);
  ```
- **Check 2:** Verify auth token is set
  ```javascript
  chrome.storage.sync.get(['authToken'], console.log);
  ```
- **Check 3:** Check background script logs for errors

### "Failed to fetch" errors
- **Cause:** API URL is incorrect or API Gateway is not deployed
- **Solution:** Verify API URL and ensure infrastructure is deployed

### 401 Unauthorized errors
- **Cause:** Auth token is invalid or expired
- **Solution:** Get a new token with `./scripts/create-test-user.sh`

### Scroll tracking not working
- **Cause:** Script injection failed (common on chrome:// pages)
- **Solution:** This is expected - we filter out chrome:// pages for privacy

## Development Mode

### Watch mode (auto-rebuild):
```bash
npm run dev --workspace=packages/browser-extension
```

### View logs:
1. Go to `chrome://extensions/`
2. Find "Mindful Browse"
3. Click "service worker" to open DevTools
4. View console logs

### Reload extension after changes:
1. Go to `chrome://extensions/`
2. Click the reload icon on the Mindful Browse card
3. Or use keyboard shortcut: Ctrl+R (when focused on extensions page)

## Testing Checklist

- [ ] Extension loads without errors
- [ ] API URL configured
- [ ] Auth token configured
- [ ] Events sent when browsing websites
- [ ] Events NOT sent for chrome:// pages
- [ ] Scroll tracking works on regular websites
- [ ] Queue stores events when API is down
- [ ] Periodic transmission works (60s intervals)
- [ ] Nudges appear when doomscrolling detected

## Next Steps

After the extension is working:

1. **Test doomscroll detection:**
   - Browse multiple negative news articles
   - Scroll rapidly through content
   - Stay on news sites for 15+ minutes
   - You should receive a nudge notification

2. **Check insights:**
   - Open the web dashboard
   - Verify your browsing data appears
   - Check sentiment and category distributions

3. **Test offline mode:**
   - Disable your internet connection
   - Browse some pages
   - Re-enable internet
   - Events should be sent from queue

## Production Deployment

When ready for production:

1. Update manifest.json version
2. Build for production: `npm run build`
3. Create icons (16x16, 48x48, 128x128)
4. Package dist/ folder as ZIP
5. Upload to Chrome Web Store
6. Submit for review

## Support

For issues:
- Check background script console logs
- Check Network tab in DevTools
- Verify API Gateway is accessible
- Check CloudWatch logs for Lambda errors
