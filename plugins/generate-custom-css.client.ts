/**
 * Client-Plugin für Design Token CSS Generation
 * Lädt Design Tokens von Builder.io beim App-Start und schreibt CSS direkt in den DOM
 */

import { fetchOneEntry } from '@builder.io/sdk-vue'

interface DesignTokens {
  colors?: any
  typography?: any
  spacing?: any
  sizing?: any
  borderRadius?: any
  shadows?: any
  zIndex?: any
  transitions?: any
  components?: any
}

export default defineNuxtPlugin(async () => {
  // Nur im Client ausführen
  if (process.server) return

  const config = useRuntimeConfig()
  const apiKey = config.public.BUILDER_API_KEY as string

  if (!apiKey) {
    console.warn('[Design Tokens] No Builder.io API key found')
    return
  }

  try {
    console.log('[Design Tokens] Loading tokens from Builder.io...')
    
    // Design Tokens von Builder.io laden
    const builderContent = await fetchOneEntry({
      model: 'design-tokens',
      apiKey: apiKey,
      options: {
        includeRefs: true
      }
    })

    if (!builderContent?.data) {
      console.log('[Design Tokens] No design tokens found in Builder.io')
      return
    }

    console.log('[Design Tokens] Design tokens loaded:', builderContent.data)

    // Die Tokens können in verschiedenen Strukturen kommen
    let tokens: DesignTokens
    
    if (builderContent.data.tokens?.tokens) {
      // Structure: { tokens: { tokens: {...}, metadata: {...} } }
      tokens = builderContent.data.tokens.tokens
    } else if (builderContent.data.tokens) {
      // Structure: { tokens: {...} }
      tokens = builderContent.data.tokens
    } else {
      // Direct structure: {...}
      tokens = builderContent.data as DesignTokens
    }
    
    if (!tokens || typeof tokens !== 'object') {
      console.log('[Design Tokens] Invalid token structure')
      return
    }

    console.log('[Design Tokens] ✅ Tokens loaded, generating CSS...', Object.keys(tokens))
    console.log('[Design Tokens] 🔍 Full token structure:', JSON.stringify(tokens, null, 2))

    // CSS generieren
    const css = generateTokenCSS(tokens)

    console.log('[Design Tokens] Generated CSS finish:', css)
    
    // CSS in den DOM einfügen
    injectCSS(css)

    console.log('[Design Tokens] ✅ Custom CSS injected successfully')

  } catch (error) {
    console.error('[Design Tokens] Error loading tokens:', error)
  }
})

/**
 * Generiere Tailwind-Class-Overrides basierend auf aktuellen CSS Custom Properties
 */
function generateTailwindOverrides(): string {
  // Diese Funktion wird zur Runtime ausgeführt und kann die echten CSS Custom Property Werte lesen
  return `

/* === DYNAMIC TAILWIND OVERRIDES FROM BUILDER.IO === */
/* Diese verwenden die echten Builder.io Werte aus den CSS Custom Properties */

/* Primary Colors */
.text-primary {
  color: var(--color-primary-500) !important;
}

.bg-primary {
  background-color: var(--color-primary-500) !important;
}

.text-primary-400 {
  color: var(--color-primary-400) !important;
}

.text-primary-500 {
  color: var(--color-primary-500) !important;
}

.text-primary-600 {
  color: var(--color-primary-600) !important;
}

.bg-primary-400 {
  background-color: var(--color-primary-400) !important;
}

.bg-primary-500 {
  background-color: var(--color-primary-500) !important;
}

.bg-primary-600 {
  background-color: var(--color-primary-600) !important;
}

.bg-primary-700 {
  background-color: var(--color-primary-700) !important;
}

/* Neutral Colors */
.text-neutral-100 {
  color: var(--color-neutral-100) !important;
}

.text-neutral-300 {
  color: var(--color-neutral-300) !important;
}

.text-neutral-700 {
  color: var(--color-neutral-700) !important;
}

.text-neutral-900 {
  color: var(--color-neutral-900) !important;
}

.bg-neutral-100 {
  background-color: var(--color-neutral-100) !important;
}

.bg-neutral-800 {
  background-color: var(--color-neutral-800) !important;
}

.bg-neutral-900 {
  background-color: var(--color-neutral-900) !important;
}

.border-neutral-700 {
  border-color: var(--color-neutral-700) !important;
}

/* Hover States */
.hover\\:text-primary-400:hover {
  color: var(--color-primary-400) !important;
}

.hover\\:bg-primary-700:hover {
  background-color: var(--color-primary-700) !important;
}

/* === END TAILWIND OVERRIDES === */
`
}

/**
 * CSS aus Design Tokens generieren
 */
function generateTokenCSS(tokens: DesignTokens): string {
  const cssRules: string[] = []
  
  cssRules.push('/* Generated Design Tokens from Builder.io */')
  cssRules.push(':root {')

  // Colors
  if (tokens.colors) {
    cssRules.push('  /* === COLORS === */')
    generateColorCSS(tokens.colors, cssRules)
  }

  // Typography
  if (tokens.typography) {
    cssRules.push('  /* === TYPOGRAPHY === */')
    generateTypographyCSS(tokens.typography, cssRules)
  }

  // Spacing
  if (tokens.spacing) {
    cssRules.push('  /* === SPACING === */')
    generateSpacingCSS(tokens.spacing, 'space', cssRules)
  }

  // Sizing
  if (tokens.sizing) {
    cssRules.push('  /* === SIZING === */')
    generateSpacingCSS(tokens.sizing, 'size', cssRules)
  }

  // Border Radius
  if (tokens.borderRadius) {
    cssRules.push('  /* === BORDER RADIUS === */')
    generateBorderRadiusCSS(tokens.borderRadius, cssRules)
  }

  // Shadows
  if (tokens.shadows) {
    cssRules.push('  /* === SHADOWS === */')
    generateShadowCSS(tokens.shadows, cssRules)
  }

  // Z-Index
  if (tokens.zIndex) {
    cssRules.push('  /* === Z-INDEX === */')
    generateZIndexCSS(tokens.zIndex, cssRules)
  }

  // Transitions
  if (tokens.transitions) {
    cssRules.push('  /* === TRANSITIONS === */')
    generateTransitionCSS(tokens.transitions, cssRules)
  }

  // Components
  if (tokens.components) {
    cssRules.push('  /* === COMPONENTS === */')
    generateComponentCSS(tokens.components, cssRules)
  }

  cssRules.push('}')
  cssRules.push('')
  cssRules.push(`/* Generated at: ${new Date().toISOString()} */`)

  console.log('[Design Tokens] Generated CSS:', cssRules.join('\n'))

  return cssRules.join('\n')
}

/**
 * Color CSS generieren
 */
function generateColorCSS(colors: any, cssRules: string[]) {
  // Primary Colors
  if (colors.primary) {
    cssRules.push('  /* Primary Colors */')
    Object.entries(colors.primary).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --color-primary-${key}: ${value} !important;`)
      }
    })
  }

  // Secondary Colors
  if (colors.secondary) {
    cssRules.push('  /* Secondary Colors */')
    Object.entries(colors.secondary).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --color-secondary-${key}: ${value} !important;`)
      }
    })
  }

  // Neutral Colors
  if (colors.neutral) {
    cssRules.push('  /* Neutral Colors */')
    Object.entries(colors.neutral).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --color-neutral-${key}: ${value} !important;`)
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
          cssRules.push(`  --color-${colorName}-${key}: ${value} !important;`)
        }
      })
    }
  })

  // Background Colors
  if (colors.background) {
    cssRules.push('  /* Background Colors */')
    Object.entries(colors.background).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --color-background-${key}: ${value} !important;`)
      }
    })
  }

  // Text Colors
  if (colors.text) {
    cssRules.push('  /* Text Colors */')
    Object.entries(colors.text).forEach(([key, value]) => {
      if (value) {
        const cssKey = key === 'linkHover' ? 'link-hover' : key
        cssRules.push(`  --color-text-${cssKey}: ${value} !important;`)
      }
    })
  }

  // Border Colors
  if (colors.border) {
    cssRules.push('  /* Border Colors */')
    Object.entries(colors.border).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --color-border-${key}: ${value} !important;`)
      }
    })
  }
}

/**
 * Typography CSS generieren
 */
function generateTypographyCSS(typography: any, cssRules: string[]) {
  if (typography.fontFamily) {
    cssRules.push('  /* Font Families */')
    Object.entries(typography.fontFamily).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --font-family-${key}: ${value} !important;`)
      }
    })
  }

  if (typography.fontSize) {
    cssRules.push('  /* Font Sizes */')
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --font-size-${key}: ${value} !important;`)
      }
    })
  }

  if (typography.fontWeight) {
    cssRules.push('  /* Font Weights */')
    Object.entries(typography.fontWeight).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --font-weight-${key}: ${value} !important;`)
      }
    })
  }

  if (typography.lineHeight) {
    cssRules.push('  /* Line Heights */')
    Object.entries(typography.lineHeight).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --line-height-${key}: ${value} !important;`)
      }
    })
  }

  if (typography.letterSpacing) {
    cssRules.push('  /* Letter Spacing */')
    Object.entries(typography.letterSpacing).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --letter-spacing-${key}: ${value} !important;`)
      }
    })
  }
}

/**
 * Spacing/Sizing CSS generieren
 */
function generateSpacingCSS(spacing: any, prefix: string, cssRules: string[]) {
  if (spacing && typeof spacing === 'object') {
    Object.entries(spacing).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --${prefix}-${key}: ${value} !important;`)
      }
    })
  }
}

/**
 * Border Radius CSS generieren
 */
function generateBorderRadiusCSS(borderRadius: any, cssRules: string[]) {
  if (borderRadius && typeof borderRadius === 'object') {
    Object.entries(borderRadius).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --border-radius-${key}: ${value} !important;`)
      }
    })
  }
}

/**
 * Shadow CSS generieren
 */
function generateShadowCSS(shadows: any, cssRules: string[]) {
  if (shadows && typeof shadows === 'object') {
    Object.entries(shadows).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --shadow-${key}: ${value} !important;`)
      }
    })
  }
}

/**
 * Z-Index CSS generieren
 */
function generateZIndexCSS(zIndex: any, cssRules: string[]) {
  if (zIndex && typeof zIndex === 'object') {
    Object.entries(zIndex).forEach(([key, value]) => {
      if (value) {
        cssRules.push(`  --z-index-${key}: ${value} !important;`)
      }
    })
  }
}

/**
 * Transition CSS generieren
 */
function generateTransitionCSS(transitions: any, cssRules: string[]) {
  if (transitions && typeof transitions === 'object') {
    if (transitions.duration && typeof transitions.duration === 'object') {
      cssRules.push('  /* Transition Durations */')
      Object.entries(transitions.duration).forEach(([key, value]) => {
        if (value) {
          cssRules.push(`  --transition-duration-${key}: ${value} !important;`)
        }
      })
    }

    if (transitions.timing && typeof transitions.timing === 'object') {
      cssRules.push('  /* Transition Timings */')
      Object.entries(transitions.timing).forEach(([key, value]) => {
        if (value) {
          const cssKey = key === 'inOut' ? 'in-out' : key
          cssRules.push(`  --transition-timing-${cssKey}: ${value} !important;`)
        }
      })
    }
  }
}

/**
 * Component CSS generieren
 */
function generateComponentCSS(components: any, cssRules: string[]) {
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
 * CSS in den DOM einfügen mit höchster Priorität + direkte Klassen-Overrides
 */
function injectCSS(css: string) {
  // Vorherige Builder.io CSS entfernen
  const existingStyle = document.getElementById('builder-design-tokens')
  if (existingStyle) {
    existingStyle.remove()
  }

  // Neues Style-Element erstellen
  const style = document.createElement('style')
  style.id = 'builder-design-tokens'
  
  // CSS + zusätzliche direkte Component-Overrides mit echten Builder.io Werten
  const enhancedCSS = css + generateTailwindOverrides() + `

/* Direct Component Overrides for Footer */
.footer {
  background-color: var(--color-neutral-900) !important;
  color: var(--color-neutral-100) !important;
}

.footer h3 {
  color: var(--color-primary-500) !important;
}

.footer a {
  color: var(--color-neutral-300) !important;
}

.footer a:hover {
  color: var(--color-primary-400) !important;
}

.footer input {
  background-color: var(--color-neutral-800) !important;
  border-color: var(--color-neutral-700) !important;
  color: var(--color-neutral-100) !important;
}

.footer button {
  background-color: var(--color-primary-600) !important;
  color: white !important;
}

.footer button:hover {
  background-color: var(--color-primary-700) !important;
}

/* Ende der Component Overrides */
`
  
  style.textContent = enhancedCSS
  
  // CSS mit höchster Priorität einfügen (am Ende des head)
  document.head.appendChild(style)
  
  console.log('[Design Tokens] ✅ Enhanced CSS injected with', enhancedCSS.split('\n').length, 'lines')
  console.log('[Design Tokens] 🎯 Added direct component overrides for Footer')
}