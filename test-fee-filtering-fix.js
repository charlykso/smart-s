// Test for the fee filtering fix
const fees = [
  {
    _id: 'fee1',
    name: 'Debug Fee 1751293363194',
    school: { _id: '6856ca374de0e2d916dc329c', name: 'Smart School Academy' },
    isApproved: true,
    isActive: true,
    amount: 1000,
  },
  {
    _id: 'fee2',
    name: 'Test Fee 1751293758412',
    school: { _id: '6856ca374de0e2d916dc329c', name: 'Smart School Academy' },
    isApproved: true,
    isActive: true,
    amount: 1000,
  },
  {
    _id: 'fee3',
    name: 'Frontend Test Fee 1751296689161',
    school: { _id: '6856ca374de0e2d916dc329c', name: 'Smart School Academy' },
    isApproved: false, // This should be filtered out
    isActive: true,
    amount: 15000,
  },
]

const student = {
  _id: '6856ca394de0e2d916dc32ac',
  school: { _id: '6856ca374de0e2d916dc329c', name: 'Smart School Academy' },
  firstname: 'Bob',
  lastname: 'Wilson',
  regNo: 'STU002',
}

// Original (broken) filtering logic
const originalFilteredFees = fees.filter(
  (fee) =>
    fee.isApproved &&
    fee.isActive &&
    (typeof fee.school === 'object' && fee.school?._id
      ? fee.school._id === student.school
      : true)
)

// Fixed filtering logic
const fixedFilteredFees = fees.filter((fee) => {
  if (!fee.isApproved || !fee.isActive) return false

  // Handle both string and object school IDs
  const feeSchoolId =
    typeof fee.school === 'object' ? fee.school?._id : fee.school
  const studentSchoolId =
    typeof student.school === 'object' ? student.school?._id : student.school

  return feeSchoolId === studentSchoolId
})

console.log('=== Fee Filtering Test ===')
console.log('Total fees:', fees.length)
console.log('Original logic result:', originalFilteredFees.length, 'fees')
console.log('Fixed logic result:', fixedFilteredFees.length, 'fees')
console.log('\nFixed filtered fees:')
fixedFilteredFees.forEach((fee, index) => {
  console.log(`  ${index + 1}. ${fee.name} - $${fee.amount}`)
})

// Verify the fix works
if (fixedFilteredFees.length === 2 && originalFilteredFees.length === 0) {
  console.log('\n✓ Fee filtering fix is working correctly!')
} else {
  console.log('\n✗ Fee filtering fix needs more work')
}
