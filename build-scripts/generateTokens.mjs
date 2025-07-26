#!/usr/bin/env node

/**
 * Build Script für Design Token CSS Generation
 * Lädt Tokens von Builder.io und generiert CSS-Datei
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

// Load environment variables
dotenv.config({ path: resolve(projectRoot, '.env') })

// Dynamic imports (convert .ts to .js for runtime)
const { generateDesignTokenCSS } = await import('../utils/generateTokenCSS.js')

async function main() {
  console.log('🚀 Starting Design Token CSS Generation...')
  console.log('📁 Project Root:', projectRoot)
  
  const apiKey = process.env.BUILDER_API_KEY
  if (!apiKey) {
    console.error('❌ BUILDER_API_KEY not found in environment variables')
    process.exit(1)
  }

  console.log('🔑 Using Builder.io API Key:', `${apiKey.slice(0, 8)}...${apiKey.slice(-8)}`)

  const outputPath = resolve(projectRoot, 'assets/css/builder-tokens.css')
  console.log('📄 Output Path:', outputPath)

  try {
    const success = await generateDesignTokenCSS(apiKey, outputPath)
    
    if (success) {
      console.log('✅ Design token CSS generation completed successfully!')
      console.log('🎯 Next step: Add the CSS file to your nuxt.config.ts')
      process.exit(0)
    } else {
      console.log('⚠️ No tokens found, but empty CSS file created')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Failed to generate design token CSS:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})