#!/bin/bash

# Image Optimization Script for PageSpeed Improvements
# This script optimizes the images flagged in PageSpeed Insights

echo "🚀 Starting Image Optimization..."
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ Error: cwebp is not installed"
    echo ""
    echo "To install cwebp:"
    echo "  - Ubuntu/Debian: sudo apt-get install webp"
    echo "  - macOS: brew install webp"
    echo "  - Windows: Download from https://developers.google.com/speed/webp/download"
    exit 1
fi

# Check if ImageMagick is installed (for resizing)
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed"
    echo ""
    echo "To install ImageMagick:"
    echo "  - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  - macOS: brew install imagemagick"
    echo "  - Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

echo "✅ All required tools are installed"
echo ""

# Backup original files
echo "📦 Creating backups..."
mkdir -p Assets/originals
cp Assets/after.webp Assets/originals/after.webp.backup 2>/dev/null || true
cp Assets/before.webp Assets/originals/before.webp.backup 2>/dev/null || true
cp Assets/logos/5.webp Assets/originals/5.webp.backup 2>/dev/null || true
echo "✅ Backups created in Assets/originals/"
echo ""

# Optimize after.webp (resize to display dimensions and compress)
echo "🖼️  Optimizing Assets/after.webp..."
echo "   Current size: 1602x943 → Target size: 800x471"
convert Assets/originals/after.webp.backup -resize 800x471 -quality 85 Assets/after-temp.webp
cwebp -q 85 Assets/after-temp.webp -o Assets/after.webp
rm Assets/after-temp.webp

BEFORE_SIZE=$(du -h Assets/originals/after.webp.backup | cut -f1)
AFTER_SIZE=$(du -h Assets/after.webp | cut -f1)
echo "   ✅ Before: $BEFORE_SIZE → After: $AFTER_SIZE"
echo ""

# Optimize before.webp (same dimensions as after.webp)
echo "🖼️  Optimizing Assets/before.webp..."
echo "   Resizing to match after.webp dimensions"
convert Assets/originals/before.webp.backup -resize 800x471 -quality 85 Assets/before-temp.webp
cwebp -q 85 Assets/before-temp.webp -o Assets/before.webp
rm Assets/before-temp.webp

BEFORE_SIZE=$(du -h Assets/originals/before.webp.backup | cut -f1)
AFTER_SIZE=$(du -h Assets/before.webp | cut -f1)
echo "   ✅ Before: $BEFORE_SIZE → After: $AFTER_SIZE"
echo ""

# Optimize logos/5.webp (compress without resizing)
echo "🖼️  Optimizing Assets/logos/5.webp..."
cwebp -q 75 Assets/originals/5.webp.backup -o Assets/logos/5.webp

BEFORE_SIZE=$(du -h Assets/originals/5.webp.backup | cut -f1)
AFTER_SIZE=$(du -h Assets/logos/5.webp | cut -f1)
echo "   ✅ Before: $BEFORE_SIZE → After: $AFTER_SIZE"
echo ""

# Optimize all other logos for good measure
echo "🖼️  Optimizing all other logo images..."
for logo in Assets/logos/*.webp; do
    if [ "$logo" != "Assets/logos/5.webp" ]; then
        filename=$(basename "$logo")
        cp "$logo" "Assets/originals/$filename.backup" 2>/dev/null || true
        cwebp -q 75 "$logo" -o "$logo.tmp"
        mv "$logo.tmp" "$logo"
        echo "   ✅ Optimized: $filename"
    fi
done
echo ""

# Optimize mobile.webp
echo "🖼️  Optimizing Assets/mobile.webp..."
if [ -f "Assets/mobile.webp" ]; then
    cp Assets/mobile.webp Assets/originals/mobile.webp.backup 2>/dev/null || true
    cwebp -q 85 Assets/mobile.webp -o Assets/mobile.webp.tmp
    mv Assets/mobile.webp.tmp Assets/mobile.webp
    
    BEFORE_SIZE=$(du -h Assets/originals/mobile.webp.backup | cut -f1)
    AFTER_SIZE=$(du -h Assets/mobile.webp | cut -f1)
    echo "   ✅ Before: $BEFORE_SIZE → After: $AFTER_SIZE"
fi
echo ""

# Optimize spotonlogo.webp
echo "🖼️  Optimizing Assets/spotonlogo.webp..."
if [ -f "Assets/spotonlogo.webp" ]; then
    cp Assets/spotonlogo.webp Assets/originals/spotonlogo.webp.backup 2>/dev/null || true
    cwebp -q 85 Assets/spotonlogo.webp -o Assets/spotonlogo.webp.tmp
    mv Assets/spotonlogo.webp.tmp Assets/spotonlogo.webp
    
    BEFORE_SIZE=$(du -h Assets/originals/spotonlogo.webp.backup | cut -f1)
    AFTER_SIZE=$(du -h Assets/spotonlogo.webp | cut -f1)
    echo "   ✅ Before: $BEFORE_SIZE → After: $AFTER_SIZE"
fi
echo ""

echo "🎉 Image optimization complete!"
echo ""
echo "📊 Next Steps:"
echo "   1. Test your website to ensure images display correctly"
echo "   2. Run PageSpeed Insights again to see improvements"
echo "   3. If happy with results, you can delete Assets/originals/ folder"
echo "   4. If not happy, restore from Assets/originals/"
echo ""
echo "🔄 To restore original images:"
echo "   cp Assets/originals/*.backup Assets/"
echo ""



