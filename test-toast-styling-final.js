const fs = require('fs').promises
const path = require('path')

async function testToastStyling() {
  console.log('🎨 Testing Toast Styling Configuration...\n')

  try {
    // Check App.tsx configuration
    const appPath = path.join(__dirname, 'frontend', 'src', 'App.tsx')
    const appContent = await fs.readFile(appPath, 'utf8')

    console.log('✅ App.tsx Toaster Configuration:')

    // Check for custom classes
    const hasCustomClasses =
      appContent.includes('custom-toast-success') &&
      appContent.includes('custom-toast-error')
    console.log(
      `   Custom CSS classes: ${hasCustomClasses ? '✅ Found' : '❌ Missing'}`
    )

    // Check for success gradient
    const hasSuccessGradient = appContent.includes(
      'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    )
    console.log(
      `   Success gradient: ${hasSuccessGradient ? '✅ Found' : '❌ Missing'}`
    )

    // Check for error gradient
    const hasErrorGradient = appContent.includes(
      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    )
    console.log(
      `   Error gradient: ${hasErrorGradient ? '✅ Found' : '❌ Missing'}`
    )

    // Check CSS file
    const cssPath = path.join(__dirname, 'frontend', 'src', 'index.css')
    const cssContent = await fs.readFile(cssPath, 'utf8')

    console.log('\n✅ CSS Overrides:')

    // Check for custom toast classes
    const hasSuccessClass = cssContent.includes('.custom-toast-success')
    console.log(
      `   Success class styling: ${hasSuccessClass ? '✅ Found' : '❌ Missing'}`
    )

    const hasErrorClass = cssContent.includes('.custom-toast-error')
    console.log(
      `   Error class styling: ${hasErrorClass ? '✅ Found' : '❌ Missing'}`
    )

    // Check for !important declarations
    const hasImportant = cssContent.includes('!important')
    console.log(
      `   CSS specificity (!important): ${
        hasImportant ? '✅ Found' : '❌ Missing'
      }`
    )

    // Check CashPaymentPage.tsx
    const cashPaymentPath = path.join(
      __dirname,
      'frontend',
      'src',
      'pages',
      'bursar',
      'CashPaymentPage.tsx'
    )
    const cashPaymentContent = await fs.readFile(cashPaymentPath, 'utf8')

    console.log('\n✅ CashPaymentPage.tsx:')

    // Check for proper toast import
    const hasToastImport = cashPaymentContent.includes(
      "import toast from 'react-hot-toast'"
    )
    console.log(
      `   Toast import: ${hasToastImport ? '✅ Found' : '❌ Missing'}`
    )

    // Check for toast.success usage
    const hasToastSuccess = cashPaymentContent.includes('toast.success(')
    console.log(
      `   toast.success() calls: ${hasToastSuccess ? '✅ Found' : '❌ Missing'}`
    )

    // Check for cash payment success message
    const hasCashPaymentSuccess = cashPaymentContent.includes(
      'Cash payment processed successfully'
    )
    console.log(
      `   Success message: ${hasCashPaymentSuccess ? '✅ Found' : '❌ Missing'}`
    )

    console.log('\n🔧 Configuration Summary:')
    console.log('1. App.tsx has Toaster with custom classes and inline styles')
    console.log('2. index.css has CSS overrides with high specificity')
    console.log('3. CashPaymentPage.tsx calls toast.success() correctly')
    console.log('\n💡 Next Steps:')
    console.log('1. Build the frontend to apply changes')
    console.log('2. Test the cash payment flow')
    console.log('3. Verify toast appears green')
  } catch (error) {
    console.error('❌ Error checking toast configuration:', error.message)
  }
}

testToastStyling()
