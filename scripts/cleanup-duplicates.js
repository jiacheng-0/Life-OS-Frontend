/**
 * Script to clean up duplicate goals and constraints in the database
 * 
 * Usage:
 * 1. Make sure your app is running (npm run dev)
 * 2. Login to your app in the browser
 * 3. Open the browser console and run:
 *    fetch('/api/memory/cleanup', { method: 'POST' }).then(r => r.json()).then(console.log)
 * 
 * Or run this script with node after setting NEXT_PUBLIC_API_URL:
 * node scripts/cleanup-duplicates.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function cleanupDuplicates() {
  try {
    console.log('Cleaning up duplicates...')
    
    const response = await fetch(`${API_URL}/api/memory/cleanup`, {
      method: 'POST',
      credentials: 'include', // Important for cookie-based auth
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Cleanup complete!')
    console.log('Results:', data)
    console.log(`Removed ${data.removed.goals} duplicate goals`)
    console.log(`Removed ${data.removed.constraints} duplicate constraints`)
    console.log(`Removed ${data.removed.routines} duplicate routines`)
    
  } catch (error) {
    console.error('Error cleaning up duplicates:', error)
  }
}

// Run if executed directly
if (require.main === module) {
  cleanupDuplicates()
}

module.exports = { cleanupDuplicates }

