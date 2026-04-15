# Image Optimization Script for Windows PowerShell
# This script optimizes the images flagged in PageSpeed Insights

Write-Host "🚀 Starting Image Optimization..." -ForegroundColor Green
Write-Host ""

# Check if ImageMagick is installed
$magickPath = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magickPath) {
    Write-Host "❌ Error: ImageMagick is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "To install ImageMagick:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    Write-Host "  2. Install and add to PATH" -ForegroundColor Yellow
    Write-Host "  3. Restart PowerShell and run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OR use online tools:" -ForegroundColor Yellow
    Write-Host "  - https://squoosh.app/ (Google's image optimizer)" -ForegroundColor Yellow
    Write-Host "  - Upload your images and download optimized versions" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ ImageMagick is installed" -ForegroundColor Green
Write-Host ""

# Create backups directory
Write-Host "📦 Creating backups..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "Assets\originals" | Out-Null

# Backup original files
Copy-Item "Assets\after.webp" "Assets\originals\after.webp.backup" -ErrorAction SilentlyContinue
Copy-Item "Assets\before.webp" "Assets\originals\before.webp.backup" -ErrorAction SilentlyContinue
Copy-Item "Assets\logos\5.webp" "Assets\originals\5.webp.backup" -ErrorAction SilentlyContinue

Write-Host "✅ Backups created in Assets\originals\" -ForegroundColor Green
Write-Host ""

# Function to get file size
function Get-FileSize {
    param($filePath)
    if (Test-Path $filePath) {
        $size = (Get-Item $filePath).Length
        if ($size -lt 1KB) {
            return "{0:N2} B" -f $size
        } elseif ($size -lt 1MB) {
            return "{0:N2} KB" -f ($size / 1KB)
        } else {
            return "{0:N2} MB" -f ($size / 1MB)
        }
    }
    return "N/A"
}

# Optimize after.webp
Write-Host "🖼️  Optimizing Assets\after.webp..." -ForegroundColor Cyan
Write-Host "   Current size: 1602x943 → Target size: 800x471" -ForegroundColor Gray

$beforeSize = Get-FileSize "Assets\originals\after.webp.backup"

& magick "Assets\originals\after.webp.backup" -resize 800x471 -quality 85 "Assets\after.webp"

$afterSize = Get-FileSize "Assets\after.webp"
Write-Host "   ✅ Before: $beforeSize → After: $afterSize" -ForegroundColor Green
Write-Host ""

# Optimize before.webp
Write-Host "🖼️  Optimizing Assets\before.webp..." -ForegroundColor Cyan
Write-Host "   Resizing to match after.webp dimensions" -ForegroundColor Gray

$beforeSize = Get-FileSize "Assets\originals\before.webp.backup"

& magick "Assets\originals\before.webp.backup" -resize 800x471 -quality 85 "Assets\before.webp"

$afterSize = Get-FileSize "Assets\before.webp"
Write-Host "   ✅ Before: $beforeSize → After: $afterSize" -ForegroundColor Green
Write-Host ""

# Optimize logos/5.webp
Write-Host "🖼️  Optimizing Assets\logos\5.webp..." -ForegroundColor Cyan

$beforeSize = Get-FileSize "Assets\originals\5.webp.backup"

& magick "Assets\originals\5.webp.backup" -quality 75 "Assets\logos\5.webp"

$afterSize = Get-FileSize "Assets\logos\5.webp"
Write-Host "   ✅ Before: $beforeSize → After: $afterSize" -ForegroundColor Green
Write-Host ""

# Optimize all other logos
Write-Host "🖼️  Optimizing all other logo images..." -ForegroundColor Cyan
$logos = Get-ChildItem "Assets\logos\*.webp" -Exclude "5.webp"

foreach ($logo in $logos) {
    $filename = $logo.Name
    Copy-Item $logo.FullName "Assets\originals\$filename.backup" -ErrorAction SilentlyContinue
    & magick $logo.FullName -quality 75 "$($logo.FullName).tmp"
    Move-Item "$($logo.FullName).tmp" $logo.FullName -Force
    Write-Host "   ✅ Optimized: $filename" -ForegroundColor Green
}
Write-Host ""

# Optimize mobile.webp
Write-Host "🖼️  Optimizing Assets\mobile.webp..." -ForegroundColor Cyan
if (Test-Path "Assets\mobile.webp") {
    Copy-Item "Assets\mobile.webp" "Assets\originals\mobile.webp.backup" -ErrorAction SilentlyContinue
    
    $beforeSize = Get-FileSize "Assets\originals\mobile.webp.backup"
    
    & magick "Assets\mobile.webp" -quality 85 "Assets\mobile.webp.tmp"
    Move-Item "Assets\mobile.webp.tmp" "Assets\mobile.webp" -Force
    
    $afterSize = Get-FileSize "Assets\mobile.webp"
    Write-Host "   ✅ Before: $beforeSize → After: $afterSize" -ForegroundColor Green
}
Write-Host ""

# Optimize spotonlogo.webp
Write-Host "🖼️  Optimizing Assets\spotonlogo.webp..." -ForegroundColor Cyan
if (Test-Path "Assets\spotonlogo.webp") {
    Copy-Item "Assets\spotonlogo.webp" "Assets\originals\spotonlogo.webp.backup" -ErrorAction SilentlyContinue
    
    $beforeSize = Get-FileSize "Assets\originals\spotonlogo.webp.backup"
    
    & magick "Assets\spotonlogo.webp" -quality 85 "Assets\spotonlogo.webp.tmp"
    Move-Item "Assets\spotonlogo.webp.tmp" "Assets\spotonlogo.webp" -Force
    
    $afterSize = Get-FileSize "Assets\spotonlogo.webp"
    Write-Host "   ✅ Before: $beforeSize → After: $afterSize" -ForegroundColor Green
}
Write-Host ""

Write-Host "🎉 Image optimization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test your website to ensure images display correctly" -ForegroundColor White
Write-Host "   2. Run PageSpeed Insights again to see improvements" -ForegroundColor White
Write-Host "   3. If happy with results, you can delete Assets\originals\ folder" -ForegroundColor White
Write-Host "   4. If not happy, restore from Assets\originals\" -ForegroundColor White
Write-Host ""
Write-Host "🔄 To restore original images:" -ForegroundColor Cyan
Write-Host "   Copy-Item Assets\originals\*.backup Assets\" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Now upload the optimized files to your server!" -ForegroundColor Green
Write-Host ""



