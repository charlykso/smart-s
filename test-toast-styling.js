// Quick test to verify payment success toast styling
// This can be run in browser console on the cash payment page

console.log('Testing Payment Success Toast Styling...')

// Import showToast if available
if (typeof showToast !== 'undefined') {
  console.log('✓ showToast utility found')

  // Test success toast
  showToast.success('Payment processed successfully!')
  console.log('✓ Success toast triggered')

  setTimeout(() => {
    // Test error toast for comparison
    showToast.error('This is how an error looks')
    console.log('✓ Error toast triggered for comparison')
  }, 2000)
} else {
  console.log(
    '⚠️ showToast utility not found - testing with direct toast calls'
  )

  // Fallback test with direct toast
  if (typeof toast !== 'undefined') {
    toast.success('Payment processed successfully!', {
      icon: '✅',
      style: {
        background: '#059669',
        color: '#ffffff',
        fontWeight: '600',
        border: '2px solid #10b981',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    })
    console.log('✓ Direct success toast triggered')
  }
}

console.log('Expected: Green background with checkmark icon for success')
console.log('Expected: Red background with X icon for errors')
