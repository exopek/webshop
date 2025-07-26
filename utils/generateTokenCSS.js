/**
 * JavaScript version of Design Token CSS Generator
 * Compatible with Node.js runtime without TypeScript compilation
 */

/**
 * CSS Generator für Design Tokens aus Builder.io JSON
 */
export class DesignTokenCSSGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  /**
   * Design Tokens von Builder.io laden
   */
  async loadTokensFromBuilder(model = 'design-tokens') {
    // Try multiple possible model names
    const possibleModels = [model, 'design-token', 'tokens', 'designtokens', 'theme']
    
    for (const modelName of possibleModels) {
      console.log(`Trying model: ${modelName}`)
      const result = await this.tryModelName(modelName)
      if (result) {
        console.log(`✅ Found design tokens in model: ${modelName}`)
        return result
      }
    }
    
    return null
  }

  /**
   * Versuche einen spezifischen Model-Namen zu laden
   */
  async tryModelName(model) {
    if (!this.apiKey) {
      return null
    }

    try {
      // Try different API endpoints that might work
      const urls = [
        `https://builder.io/api/v1/query/${model}?apiKey=${this.apiKey}&limit=1`,
        `https://builder.io/api/v2/content/${model}?apiKey=${this.apiKey}&limit=1`,
        `https://cdn.builder.io/api/v1/query/${model}?apiKey=${this.apiKey}&limit=1`
      ]
      
      for (const url of urls) {
        console.log(`🔍 Trying URL: ${url}`)
        const response = await fetch(url)
        
        if (response.ok) {
          console.log(`✅ API endpoint works: ${url}`)
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            const content = data.results[0].data
            const builderTokens = content
            
            // Check if this contains design tokens
            if (builderTokens.tokens || builderTokens.colors || builderTokens.typography) {
              console.log('✅ Design tokens structure found:', Object.keys(builderTokens))
              return builderTokens.tokens || builderTokens
            } else {
              console.log(`⚠️ Model '${model}' exists but doesn't contain design tokens`)
              console.log('Available keys:', Object.keys(builderTokens))
              return null
            }
          } else {
            console.log(`⚠️ Model '${model}' exists but has no content`)
            return null
          }
        } else {
          console.log(`❌ URL failed (${response.status}): ${url}`)
        }
      }
      
      return null
    } catch (error) {
      console.log(`❌ Error loading model '${model}':`, error.message)
      return null
    }
  }

  /**
   * CSS aus Design Tokens generieren
   */
  generateCSS(tokens) {
    const cssRules = []
    
    cssRules.push('/* Generated Design Tokens from Builder.io */')
    cssRules.push(':root {')

    // Colors
    if (tokens.colors) {
      cssRules.push('  /* === COLORS === */')
      this.generateColorCSS(tokens.colors, cssRules)
    }

    // Typography
    if (tokens.typography) {
      cssRules.push('  /* === TYPOGRAPHY === */')
      this.generateTypographyCSS(tokens.typography, cssRules)
    }

    // Spacing
    if (tokens.spacing) {
      cssRules.push('  /* === SPACING === */')
      this.generateSpacingCSS(tokens.spacing, 'space', cssRules)
    }

    // Sizing
    if (tokens.sizing) {
      cssRules.push('  /* === SIZING === */')
      this.generateSpacingCSS(tokens.sizing, 'size', cssRules)
    }

    // Border Radius
    if (tokens.borderRadius) {
      cssRules.push('  /* === BORDER RADIUS === */')
      this.generateBorderRadiusCSS(tokens.borderRadius, cssRules)
    }

    // Shadows
    if (tokens.shadows) {
      cssRules.push('  /* === SHADOWS === */')
      this.generateShadowCSS(tokens.shadows, cssRules)
    }

    // Z-Index
    if (tokens.zIndex) {
      cssRules.push('  /* === Z-INDEX === */')
      this.generateZIndexCSS(tokens.zIndex, cssRules)
    }

    // Transitions
    if (tokens.transitions) {
      cssRules.push('  /* === TRANSITIONS === */')
      this.generateTransitionCSS(tokens.transitions, cssRules)
    }

    // Components
    if (tokens.components) {
      cssRules.push('  /* === COMPONENTS === */')
      this.generateComponentCSS(tokens.components, cssRules)
    }

    cssRules.push('}')
    cssRules.push('')
    cssRules.push(`/* Generated at: ${new Date().toISOString()} */`)

    return cssRules.join('\n')
  }

  /**
   * Color CSS generieren
   */
  generateColorCSS(colors, cssRules) {
    // Primary Colors
    if (colors.primary) {
      cssRules.push('  /* Primary Colors */')
      Object.entries(colors.primary).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --color-primary-${key}: ${value};`)
        }
      })
    }

    // Secondary Colors
    if (colors.secondary) {
      cssRules.push('  /* Secondary Colors */')
      Object.entries(colors.secondary).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --color-secondary-${key}: ${value};`)
        }
      })
    }

    // Neutral Colors
    if (colors.neutral) {
      cssRules.push('  /* Neutral Colors */')
      Object.entries(colors.neutral).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --color-neutral-${key}: ${value};`)
        }
      })
    }

    // Semantic Colors
    const semanticColors = ['success', 'warning', 'error', 'info']
    semanticColors.forEach(colorName => {
      if (colors[colorName]) {
        cssRules.push(`  /* ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} Colors */`)
        Object.entries(colors[colorName]).forEach(([key, value]) => {
          if (value) {
            cssRules.push(`  --color-${colorName}-${key}: ${value};`)
          }
        })
      }
    })

    // Background Colors
    if (colors.background) {
      cssRules.push('  /* Background Colors */')
      Object.entries(colors.background).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --color-background-${key}: ${value};`)
        }
      })
    }

    // Text Colors
    if (colors.text) {
      cssRules.push('  /* Text Colors */')
      Object.entries(colors.text).forEach(([key, value]) => {
        if (value) {
          const cssKey = key === 'linkHover' ? 'link-hover' : key
          cssRules.push(`  --color-text-${cssKey}: ${value};`)
        }
      })
    }

    // Border Colors
    if (colors.border) {
      cssRules.push('  /* Border Colors */')
      Object.entries(colors.border).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --color-border-${key}: ${value};`)
        }
      })
    }
  }

  /**
   * Typography CSS generieren
   */
  generateTypographyCSS(typography, cssRules) {
    if (typography.fontFamily) {
      cssRules.push('  /* Font Families */')
      Object.entries(typography.fontFamily).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --font-family-${key}: ${value};`)
        }
      })
    }

    if (typography.fontSize) {
      cssRules.push('  /* Font Sizes */')
      Object.entries(typography.fontSize).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --font-size-${key}: ${value};`)
        }
      })
    }

    if (typography.fontWeight) {
      cssRules.push('  /* Font Weights */')
      Object.entries(typography.fontWeight).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --font-weight-${key}: ${value};`)
        }
      })
    }

    if (typography.lineHeight) {
      cssRules.push('  /* Line Heights */')
      Object.entries(typography.lineHeight).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --line-height-${key}: ${value};`)
        }
      })
    }

    if (typography.letterSpacing) {
      cssRules.push('  /* Letter Spacing */')
      Object.entries(typography.letterSpacing).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --letter-spacing-${key}: ${value};`)
        }
      })
    }
  }

  /**
   * Spacing/Sizing CSS generieren
   */
  generateSpacingCSS(spacing, prefix, cssRules) {
    if (spacing && typeof spacing === 'object') {
      Object.entries(spacing).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --${prefix}-${key}: ${value};`)
        }
      })
    }
  }

  /**
   * Border Radius CSS generieren
   */
  generateBorderRadiusCSS(borderRadius, cssRules) {
    if (borderRadius && typeof borderRadius === 'object') {
      Object.entries(borderRadius).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --border-radius-${key}: ${value};`)
        }
      })
    }
  }

  /**
   * Shadow CSS generieren
   */
  generateShadowCSS(shadows, cssRules) {
    if (shadows && typeof shadows === 'object') {
      Object.entries(shadows).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --shadow-${key}: ${value};`)
        }
      })
    }
  }

  /**
   * Z-Index CSS generieren
   */
  generateZIndexCSS(zIndex, cssRules) {
    if (zIndex && typeof zIndex === 'object') {
      Object.entries(zIndex).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --z-index-${key}: ${value};`)
        }
      })
    }
  }

  /**
   * Transition CSS generieren
   */
  generateTransitionCSS(transitions, cssRules) {
    if (transitions && typeof transitions === 'object') {
      if (transitions.duration && typeof transitions.duration === 'object') {
        cssRules.push('  /* Transition Durations */')
        Object.entries(transitions.duration).forEach(([key, value]) => {
          if (value) {
            cssRules.push(`  --transition-duration-${key}: ${value};`)
          }
        })
      }

      if (transitions.timing && typeof transitions.timing === 'object') {
        cssRules.push('  /* Transition Timings */')
        Object.entries(transitions.timing).forEach(([key, value]) => {
          if (value) {
            const cssKey = key === 'inOut' ? 'in-out' : key
            cssRules.push(`  --transition-timing-${cssKey}: ${value};`)
          }
        })
      }
    }
  }

  /**
   * Component CSS generieren
   */
  generateComponentCSS(components, cssRules) {
    if (components && typeof components === 'object') {
      Object.entries(components).forEach(([componentName, componentTokens]) => {
        if (componentTokens && typeof componentTokens === 'object') {
          cssRules.push(`  /* ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Component */`)
          
          Object.entries(componentTokens).forEach(([tokenKey, tokenValue]) => {
            if (tokenValue !== null && tokenValue !== undefined) {
              if (typeof tokenValue === 'object') {
                Object.entries(tokenValue).forEach(([subKey, subValue]) => {
                  if (subValue) {
                    cssRules.push(`  --${componentName}-${tokenKey}-${subKey}: ${subValue};`)
                  }
                })
              } else {
                const cssKey = tokenKey === 'paddingX' ? 'padding-x' : 
                              tokenKey === 'borderWidth' ? 'border-width' : tokenKey
                cssRules.push(`  --${componentName}-${cssKey}: ${tokenValue};`)
              }
            }
          })
        }
      })
    }
  }

  /**
   * Kompletten Workflow ausführen: Builder.io laden → CSS generieren → Datei schreiben
   */
  async generateCSSFile(outputPath, model = 'design-tokens') {
    try {
      console.log(`🎨 Generating CSS file from Builder.io tokens...`)
      
      // Tokens von Builder.io laden
      const tokens = await this.loadTokensFromBuilder(model)
      
      if (!tokens) {
        console.log('⚠️ No tokens found, generating empty CSS file')
        const emptyCSS = `/* No design tokens found in Builder.io */\n/* Using fallback tokens from main.css */\n:root {\n  /* Placeholder for Builder.io design tokens */\n}\n`
        
        // File schreiben
        const fs = await import('fs/promises')
        await fs.writeFile(outputPath, emptyCSS, 'utf8')
        return false
      }

      // CSS generieren
      const css = this.generateCSS(tokens)
      
      // File schreiben
      const fs = await import('fs/promises')
      await fs.writeFile(outputPath, css, 'utf8')
      
      console.log(`✅ Design token CSS generated successfully: ${outputPath}`)
      console.log(`📊 Generated ${css.split('\n').length} lines of CSS`)
      
      return true
    } catch (error) {
      console.error('❌ Error generating CSS file:', error)
      return false
    }
  }
}

/**
 * Helper function für Nuxt Build Hook
 */
export async function generateDesignTokenCSS(apiKey, outputPath) {
  const generator = new DesignTokenCSSGenerator(apiKey)
  return await generator.generateCSSFile(outputPath)
}