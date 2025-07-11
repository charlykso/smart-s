const mongoose = require('mongoose')
require('dotenv').config()

async function dropTermNameIndex() {
  try {
    console.log('🔧 Dropping unique index on Term.name field...\n')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Get the Terms collection
    const db = mongoose.connection.db
    const termsCollection = db.collection('terms')

    // List current indexes
    console.log('\n📋 Current indexes on Terms collection:')
    const indexes = await termsCollection.indexes()
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`)
    })

    // Drop the name_1 index if it exists
    try {
      await termsCollection.dropIndex('name_1')
      console.log('\n✅ Successfully dropped unique index on name field')
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log(
          '\n⚠️ Index "name_1" not found (may have been already dropped)'
        )
      } else {
        throw error
      }
    }

    // List indexes after dropping
    console.log('\n📋 Indexes after dropping:')
    const indexesAfter = await termsCollection.indexes()
    indexesAfter.forEach((index, i) => {
      console.log(`   ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`)
    })

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    await mongoose.disconnect()
  }
}

// Execute if run directly
if (require.main === module) {
  dropTermNameIndex().then(() => {
    console.log('\n🔧 Index dropping completed!')
  })
}

module.exports = { dropTermNameIndex }
