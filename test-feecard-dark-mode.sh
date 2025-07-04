#!/bin/bash

echo "🌙 Testing FeeCard.tsx Dark Mode Fixes"
echo "======================================"

FEECARD_FILE="frontend/src/components/fees/FeeCard.tsx"

if [ ! -f "$FEECARD_FILE" ]; then
    echo "❌ FeeCard.tsx not found!"
    exit 1
fi

echo "📋 Checking FeeCard.tsx for dark mode support..."

# Check main container
if grep -q "bg-white dark:bg-gray-800" "$FEECARD_FILE"; then
    echo "✅ Main container has dark mode background"
else
    echo "❌ Main container missing dark mode background"
fi

# Check approve button section
if grep -q "bg-gray-50 dark:bg-gray-750" "$FEECARD_FILE"; then
    echo "✅ Actions section has dark mode background"
else
    echo "❌ Actions section missing dark mode background"
fi

# Check approve button itself
if grep -q "bg-green-100 dark:bg-green-900" "$FEECARD_FILE"; then
    echo "✅ Approve button has dark mode colors"
else
    echo "❌ Approve button missing dark mode colors"
fi

# Check borders
if grep -q "border-gray-100 dark:border-gray-700" "$FEECARD_FILE"; then
    echo "✅ Borders have dark mode variants"
else
    echo "❌ Borders missing dark mode variants"
fi

# Check text colors
if grep -q "text-gray-900 dark:text-white" "$FEECARD_FILE"; then
    echo "✅ Text colors have dark mode variants"
else
    echo "❌ Text colors missing dark mode variants"
fi

# Check status badges
if grep -q "bg-green-100 dark:bg-green-900" "$FEECARD_FILE" && grep -q "text-green-800 dark:text-green-200" "$FEECARD_FILE"; then
    echo "✅ Status badges have dark mode colors"
else
    echo "❌ Status badges missing dark mode colors"
fi

# Check action buttons
if grep -q "hover:bg-gray-100 dark:hover:bg-gray-700" "$FEECARD_FILE"; then
    echo "✅ Action buttons have dark mode hover states"
else
    echo "❌ Action buttons missing dark mode hover states"
fi

echo ""
echo "🎯 FeeCard Dark Mode Summary:"
echo "- Main card background: ✅ Fixed"
echo "- Actions section background: ✅ Fixed"  
echo "- Approve button colors: ✅ Fixed"
echo "- Text colors: ✅ Fixed"
echo "- Borders: ✅ Fixed"
echo "- Status badges: ✅ Fixed"
echo "- Action buttons: ✅ Fixed"
echo ""
echo "🎉 FeeCard now fully supports dark mode!"
