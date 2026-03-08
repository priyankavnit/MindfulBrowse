# Mindful Browse - Browser Extension

Privacy-first browser extension that tracks browsing patterns and provides gentle nudges for healthier digital habits.

## Features

- **Automatic tracking** - Captures browsing metadata (domain, title, duration, scroll behavior)
- **Privacy filters** - Excludes sensitive pages (chrome://, passwords, etc.)
- **Offline support** - Queues events when API is unavailable (max 100 events)
- **Doomscroll detection** - Identifies prolonged negative content consumption
- **Gentle nudges** - Non-judgmental reflection prompts when needed
- **Periodic transmission** - Sends events every 60 seconds for long page views

## Installation

### Development Mode

1. **Build the extension:**
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `packages/browser-extension/dist/` directory

3. **Configure API settings:**
   - Open Chrome DevTools Console
   - Run:
     ```javascript
     chrome.storage.sync.set({
       apiUrl: 'https://your-api-url.com',
       authToken: 'your-jwt-token'
     });
     ```

### Production Mode

1. Build for production:
   ```bash
   npm run build
   ```

2. Package the `dist/` folder as a ZIP file

3. Upload to Chrome Web Store

## Configuration

The extension requires two configuration values stored in `chrome.storage.sync`:

- `apiUrl` - API Gateway endpoint URL (from infrastructure deployment)
- `authToken` - Cognito JWT token (get from dashboard login)

## Privacy

### What We Track
- Domain name (e.g., "example.com")
- Page title
- Duration on page
- Scroll count and velocity
- Timestamp

### What We DON'T Track
- Full page content
- Passwords or credentials
- Personal messages
- Form data
- Cookies

### Excluded URLs
- `chrome://` pages
- `about:` pages
- Browser extension pages
- Local files (`file://`)
- Data URLs

## Architecture

```
Background Script (Service Worker)
├── Tab Activity Tracking
│   ├── chrome.tabs.onActivated
│   ├── chrome.tabs.onUpdated
│   └── chrome.windows.onFocusChanged
├── Scroll Tracking
│   └── Injected script via chrome.scripting
├── Event Queue (Offline Support)
│   ├── Max 100 events
│   └── Flush every 5 minutes
├── API Client
│   ├── Send events to backend
│   ├── Handle authentication
│   └── Show nudges
└── Periodic Transmission
    └── Every 60 seconds for long views
```

## Development

### Watch mode (auto-rebuild on changes):
```bash
npm run dev
```

### Lint code:
```bash
npm run lint
```

### View logs:
1. Open `chrome://extensions/`
2. Find "Mindful Browse"
3. Click "service worker" link
4. View console logs

## Troubleshooting

### Events not being sent
- Check API URL is configured: `chrome.storage.sync.get(['apiUrl'])`
- Check auth token exists: `chrome.storage.sync.get(['authToken'])`
- View background script logs for errors
- Check Network tab in DevTools

### Scroll tracking not working
- Ensure page is HTTP/HTTPS (not chrome://)
- Check console for script injection errors
- Verify `scripting` permission in manifest

### Queue filling up
- Check API connectivity
- Verify auth token is valid
- Queue flushes every 5 minutes automatically

## Files

- `src/background.ts` - Main service worker (tab tracking, event management)
- `src/content.ts` - Content script (minimal, scroll tracking via injection)
- `src/services/api-client.ts` - API communication
- `src/services/event-queue.ts` - Offline event queue
- `src/utils/privacy-filters.ts` - URL filtering logic
- `manifest.json` - Extension configuration
- `webpack.config.js` - Build configuration

## Permissions

- `tabs` - Track active tab and navigation
- `storage` - Store queue and configuration
- `activeTab` - Access current tab URL and title
- `notifications` - Show nudge notifications
- `scripting` - Inject scroll tracking script
- `host_permissions` - Access HTTP/HTTPS pages

## License

MIT
