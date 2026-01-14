#!/bin/bash

# Script to fix Metro bundler reload issues
echo "🔧 Fixing Metro Bundler Reload Issues..."
echo ""

# Kill any existing Metro processes
echo "1. Killing existing Metro processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "   No existing Metro process found"
echo ""

# Clear Metro cache
echo "2. Clearing Metro cache..."
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-* 2>/dev/null
echo "   Cache cleared"
echo ""

# Clear watchman
echo "3. Clearing Watchman..."
watchman watch-del-all 2>/dev/null || echo "   Watchman not installed (optional)"
echo ""

# Get Mac IP address
echo "4. Your Mac's IP addresses:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "   " $2}'
echo ""

echo "5. Starting Metro bundler with reset cache..."
echo "   Run this command in a separate terminal:"
echo "   cd $(pwd) && yarn start --reset-cache"
echo ""
echo "6. For physical device connection:"
echo "   - Make sure your iPhone and Mac are on the same WiFi network"
echo "   - Shake device → Settings → Enter your Mac's IP address"
echo ""

