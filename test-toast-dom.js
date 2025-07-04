const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

async function testToastDOM() {
  console.log('🔍 Testing Toast DOM Structure...')

  // Set up Chrome driver with options
  const options = new chrome.Options()
  options.addArguments('--headless')
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  try {
    // Navigate to the app
    await driver.get('http://localhost:3000')
    await driver.sleep(2000)

    // Look for toast containers and inspect their structure
    const toastContainer = await driver.findElements({
      css: '[data-hot-toast]',
    })
    console.log(`Found ${toastContainer.length} toast containers`)

    if (toastContainer.length > 0) {
      const html = await toastContainer[0].getAttribute('outerHTML')
      console.log('Toast Container HTML:', html)
    }

    // Check for any existing toasts
    const toasts = await driver.findElements({ css: '[role="status"]' })
    console.log(`Found ${toasts.length} existing toasts`)

    for (let i = 0; i < toasts.length; i++) {
      const toast = toasts[i]
      const html = await toast.getAttribute('outerHTML')
      const dataType = await toast.getAttribute('data-type')
      console.log(`Toast ${i + 1}:`, { html, dataType })
    }
  } catch (error) {
    console.error('Error testing toast DOM:', error.message)
  } finally {
    await driver.quit()
  }
}

if (require.main === module) {
  testToastDOM()
}

module.exports = { testToastDOM }
