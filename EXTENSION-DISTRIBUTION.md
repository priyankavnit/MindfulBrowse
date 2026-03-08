# Browser Extension Distribution Guide

## 🎉 Extension is Now Available for Download!

Your Mindful Browse browser extension has been uploaded to S3 and is publicly accessible via CloudFront CDN.

---

## 📥 Download Links

### For End Users:

**Download Page (Recommended):**
```
https://d3tuctcemzeygi.cloudfront.net/download.html
```

**Direct Download Link:**
```
https://d3tuctcemzeygi.cloudfront.net/downloads/mindful-browse-extension-latest.zip
```

### For Developers:

**Timestamped Version:**
```
https://d3tuctcemzeygi.cloudfront.net/downloads/mindful-browse-extension-dev-20260308-215409.zip
```

---

## 📋 Installation Instructions for Users

1. Visit the download page: `https://d3tuctcemzeygi.cloudfront.net/download.html`
2. Click "Download Extension" button
3. Extract the ZIP file to a folder
4. Open Chrome and go to `chrome://extensions`
5. Enable "Developer mode" (toggle in top-right)
6. Click "Load unpacked"
7. Select the extracted folder
8. Extension will appear in Chrome toolbar

---

## 🔄 Updating the Extension

When you make changes to the extension and want to distribute a new version:

### 1. Rebuild the Extension
```bash
npm run build --workspace=packages/browser-extension
```

### 2. Package the Extension
```bash
./scripts/package-extension.sh
```

### 3. Upload to S3
```bash
./scripts/upload-extension-to-s3.sh
```

This will:
- Upload the new version with a timestamp
- Update the "latest" version that users download
- Make it available via CloudFront CDN

---

## 🌐 Sharing with Users

### Option 1: Share the Download Page
Send users this link:
```
https://d3tuctcemzeygi.cloudfront.net/download.html
```

This page includes:
- Download button
- Installation instructions
- Feature highlights
- Privacy information

### Option 2: Share Direct Download Link
For advanced users or automated distribution:
```
https://d3tuctcemzeygi.cloudfront.net/downloads/mindful-browse-extension-latest.zip
```

---

## 📦 What's Included in the Extension

The extension package contains:
- `manifest.json` - Extension configuration
- `background.js` - Background service worker (4.2 KB)
- `content.js` - Content script for tracking (75 bytes)

**Total Size:** ~4 KB (very lightweight!)

---

## 🔐 Security & Privacy

- Extension is served over HTTPS via CloudFront
- Files are stored in encrypted S3 bucket
- No tracking or analytics on downloads
- Extension only tracks metadata, not content
- All data stays in your AWS account

---

## 🚀 Production Distribution Options

For production deployment, you have several options:

### Option 1: Chrome Web Store (Recommended for Public)
- Submit extension to Chrome Web Store
- Users can install with one click
- Automatic updates
- Better trust and discoverability
- Costs $5 one-time developer fee

### Option 2: Enterprise Distribution (Current Setup)
- Host on your own infrastructure (S3/CloudFront)
- Full control over distribution
- Good for internal/beta testing
- Users need to manually load extension
- Free (only AWS costs)

### Option 3: Firefox Add-ons
- Submit to Firefox Add-ons marketplace
- Similar benefits to Chrome Web Store
- Free submission

---

## 📊 Monitoring Downloads

To see download statistics:

```bash
# View S3 access logs (if enabled)
aws s3 ls s3://mindful-browse-dashboard-dev-387030538086/downloads/

# Check CloudFront metrics in AWS Console
# Go to CloudFront → Distributions → EA49SCU50KFON → Monitoring
```

---

## 🛠️ Troubleshooting

### Extension not downloading?
- Check CloudFront distribution status
- Verify S3 bucket permissions
- Try direct S3 URL as fallback

### Extension not loading in Chrome?
- Ensure ZIP was fully extracted
- Check that manifest.json exists in folder
- Verify Developer mode is enabled
- Check Chrome console for errors

### Users can't access download page?
- CloudFront may take 5-10 minutes to propagate
- Try invalidating cache: `aws cloudfront create-invalidation --distribution-id EA49SCU50KFON --paths "/*"`

---

## 💰 Cost Estimate

**Monthly costs for extension distribution:**
- S3 Storage: ~$0.01 (4 KB file)
- CloudFront Data Transfer: ~$0.10 per GB
- CloudFront Requests: ~$0.01 per 10,000 requests

**Estimated total:** $1-5/month for moderate usage (100-1000 downloads)

---

## 📝 Version Management

Current version: **1.0.0**

To update version:
1. Edit `packages/browser-extension/manifest.json`
2. Update `version` field
3. Rebuild and repackage
4. Upload to S3

The upload script automatically:
- Creates timestamped versions for history
- Updates the "latest" version for users
- Preserves old versions in S3

---

## 🎯 Next Steps

1. ✅ Extension uploaded to S3
2. ✅ Download page created
3. ✅ CloudFront distribution configured
4. ⏭️ Create test user in Cognito
5. ⏭️ Test end-to-end flow
6. ⏭️ Share download link with beta testers

---

## 📚 Related Documentation

- Main deployment guide: `DEPLOYMENT-SUCCESS.md`
- Extension setup: `packages/browser-extension/SETUP.md`
- Dashboard setup: `packages/web-dashboard/AUTH_SETUP.md`
- Project overview: `README.md`

---

## 🎊 Success!

Your browser extension is now publicly available for download. Users can install it and start tracking their browsing patterns immediately!

**Share this link:** `https://d3tuctcemzeygi.cloudfront.net/download.html`
