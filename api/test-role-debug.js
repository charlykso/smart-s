const roleList = require('./helpers/roleList')

console.log('Role List Debug:')
console.log('- roleList.Admin:', roleList.Admin)
console.log('- roleList.Bursar:', roleList.Bursar)
console.log('- roleList.ICT_administrator:', roleList.ICT_administrator)
console.log('- roleList.Principal:', roleList.Principal)
console.log('- roleList.Auditor:', roleList.Auditor)

console.log('\nAll roles:', Object.keys(roleList))
