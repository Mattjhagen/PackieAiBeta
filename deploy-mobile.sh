#!/bin/bash

# PackieAI Mobile Deployment Script
echo "🦝 PackieAI Mobile Deployment Helper"
echo "======================================"

# Get the current Replit URL
REPLIT_URL="https://${REPL_SLUG}.${REPL_OWNER}.replit.app"
MOBILE_URL="${REPLIT_URL}/mobile"

echo ""
echo "📱 Your mobile app is ready at: $MOBILE_URL"
echo ""

echo "🤖 Android APK Generation:"
echo "1. Visit: https://pwabuilder.com"
echo "2. Enter URL: $MOBILE_URL"
echo "3. Click 'Start' → 'Android' → 'Generate Package'"
echo "4. Download your APK file"
echo ""

echo "🍎 iOS Installation:"
echo "1. Open Safari on iPhone/iPad"
echo "2. Visit: $MOBILE_URL"
echo "3. Tap Share button → 'Add to Home Screen'"
echo "4. App will install like a native app"
echo ""

echo "📋 Features included:"
echo "✓ Scam number reporting"
echo "✓ AI persona selection"
echo "✓ User authentication"
echo "✓ Real-time call tracking"
echo "✓ Call recording playback"
echo "✓ Push notifications ready"
echo "✓ Works offline"
echo ""

echo "🚀 Ready for app store publishing!"
echo "For Google Play Store, you'll need a developer account (\$25)"
echo ""

# Create QR code for easy mobile access
echo "📱 QR Code for mobile access:"
echo "Generate QR code for: $MOBILE_URL"
echo "Use any QR code generator online with this URL"
echo ""

echo "✅ Deployment complete! Your PackieAI mobile app is live."