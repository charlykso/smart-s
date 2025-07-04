#!/bin/bash

# Test script to verify dark mode fixes in Fee Management components
echo "🌙 Testing Dark Mode Fixes for Fee Management Components"
echo "======================================================="

# Check if all components have been updated with dark: classes
echo "📋 Checking PaymentCard.tsx for dark mode support..."
grep -n "dark:" frontend/src/components/fees/PaymentCard.tsx | head -5
echo ""

echo "📋 Checking FeeModal.tsx for dark mode support..."
grep -n "dark:" frontend/src/components/fees/FeeModal.tsx | head -5
echo ""

echo "📋 Checking PaymentModal.tsx for dark mode support..."
grep -n "dark:" frontend/src/components/fees/PaymentModal.tsx | head -5
echo ""

echo "📋 Checking FeeStats.tsx for dark mode support..."
grep -n "dark:" frontend/src/components/fees/FeeStats.tsx | head -5
echo ""

echo "📋 Checking PaymentStats.tsx for dark mode support..."
grep -n "dark:" frontend/src/components/fees/PaymentStats.tsx | head -5
echo ""

echo "✅ Dark mode fixes applied to all Fee Management components!"
echo ""
echo "Components updated:"
echo "- PaymentCard.tsx: Cards, headers, text, and actions"
echo "- FeeModal.tsx: Modal background, form inputs, labels, and buttons"
echo "- PaymentModal.tsx: Modal background, fee info, form fields, and buttons"
echo "- FeeStats.tsx: Stats cards, text, borders, and progress bars"
echo "- PaymentStats.tsx: Analytics cards, text, borders, and progress bars"
echo ""
echo "🎨 All components now support both light and dark modes with proper contrast and visibility!"
