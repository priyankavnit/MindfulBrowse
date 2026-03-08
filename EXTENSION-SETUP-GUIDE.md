# Browser Extension Setup Guide

## Installation

1. **Download the extension**
   - Visit: https://d3tuctcemzeygi.cloudfront.net/downloads/mindful-browse-extension-latest.zip
   - Or use the download page: https://d3tuctcemzeygi.cloudfront.net/download.html

2. **Extract the ZIP file**
   - Extract to a folder on your computer
   - Remember the location

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the extracted folder

## Configuration

After installing the extension, you need to log in to connect it to your account:

1. **Click the extension icon** in your Chrome toolbar
   - Look for the Mindful Browse icon
   - If you don't see it, click the puzzle piece icon and pin Mindful Browse

2. **Log in with your credentials**
   - Email: `test@mindfulbrowse.com`
   - Password: `MindfulTest123!`
   - Click "Log In"

3. **Verify connection**
   - You should see "✓ Connected as test@mindfulbrowse.com"
   - The extension is now tracking your browsing activity

## How It Works

Once configured, the extension will:

- Track pages you visit (excluding sensitive URLs like banking sites)
- Record time spent on each page
- Monitor scroll behavior
- Send data to the backend for analysis
- Show nudges when doomscrolling is detected

## Viewing Your Data

- Click "Open Dashboard" in the extension popup
- Or visit: https://d3tuctcemzeygi.cloudfront.net
- Log in with the same credentials
- View your browsing insights and patterns

## Troubleshooting

### Extension not tracking events

1. Make sure you're logged in (click the extension icon to check)
2. Browse some websites for at least 60 seconds each
3. Wait a few minutes for data to sync
4. Refresh the dashboard

### Login fails

- Check your internet connection
- Verify you're using the correct credentials
- Try logging out and back in

### No data in dashboard

- Make sure the extension is installed and logged in
- Browse some websites (news sites work well for testing)
- Wait at least 60 seconds on each page
- Data syncs every 60 seconds while browsing
- Refresh the dashboard after a few minutes

## Test Credentials

For testing purposes, use:
- Email: `test@mindfulbrowse.com`
- Password: `MindfulTest123!`

## Support

If you encounter issues:
1. Check the browser console for errors (F12 → Console)
2. Check the extension's background page console (chrome://extensions → Details → Inspect views: background page)
3. Verify your auth token is stored (chrome://extensions → Details → Inspect views: background page → Application → Storage → Sync)
