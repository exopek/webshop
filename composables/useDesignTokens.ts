import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRuntimeConfig } from '#app'
import { fetchOneEntry } from '@builder.io/sdk-vue'
import type { 
  DesignTokens, 
  BuilderIODesignTokens, 
  DesignTokenState
} from '~/types/design-tokens'

/**
 * Design Token Composable
 * Lädt Design Tokens aus Builder.io und wendet sie auf die CSS Custom Properties an
 */
export const useDesignTokens = () => {
  const config = useRuntimeConfig()
  const apiKey = config.public.BUILDER_API_KEY as string

  // State
  const state = ref<DesignTokenState>({
    defaultTokens: getDefaultTokens(),
    builderTokens: null,
    currentTheme: 'default',
    isLoading: false,
    error: null,
    lastUpdated: null
  })

  /**
   * Default Design Tokens basierend auf main.css
   */
  function getDefaultTokens(): DesignTokens {
    return {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a'
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d'
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          900: '#78350f'
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          900: '#7f1d1d'
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e'
        },
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          overlay: 'rgba(0, 0, 0, 0.5)'
        },
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
          inverse: '#ffffff',
          link: '#2563eb',
          linkHover: '#1d4ed8'
        },
        border: {
          primary: '#e5e7eb',
          secondary: '#d1d5db',
          focus: '#3b82f6',
          error: '#ef4444'
        }
      },
      typography: {
        fontFamily: {
          sans: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          serif: 'Playfair Display, Georgia, serif',
          mono: 'JetBrains Mono, Consolas, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem'
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800'
        },
        lineHeight: {
          tight: '1.25',
          snug: '1.375',
          normal: '1.5',
          relaxed: '1.625',
          loose: '2'
        },
        letterSpacing: {
          tight: '-0.025em',
          normal: '0',
          wide: '0.025em',
          wider: '0.05em',
          widest: '0.1em'
        }
      },
      spacing: {
        0: '0',
        px: '1px',
        '0.5': '0.125rem',
        1: '0.25rem',
        '1.5': '0.375rem',
        2: '0.5rem',
        '2.5': '0.625rem',
        3: '0.75rem',
        '3.5': '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem'
      },
      sizing: {
        0: '0',
        px: '1px',
        '0.5': '0.125rem',
        1: '0.25rem',
        '1.5': '0.375rem',
        2: '0.5rem',
        '2.5': '0.625rem',
        3: '0.75rem',
        '3.5': '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem'
      },
      breakpoints: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      shadows: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
      },
      zIndex: {
        hide: '-1',
        auto: 'auto',
        base: '0',
        docked: '10',
        dropdown: '1000',
        sticky: '1100',
        banner: '1200',
        overlay: '1300',
        modal: '1400',
        popover: '1500',
        skiplink: '1600',
        toast: '1700',
        tooltip: '1800'
      },
      transitions: {
        duration: {
          75: '75ms',
          100: '100ms',
          150: '150ms',
          200: '200ms',
          300: '300ms',
          500: '500ms',
          700: '700ms',
          1000: '1000ms'
        },
        timing: {
          linear: 'linear',
          in: 'cubic-bezier(0.4, 0, 1, 1)',
          out: 'cubic-bezier(0, 0, 0.2, 1)',
          inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      },
      components: {
        button: {
          height: {
            sm: '2rem',
            md: '2.5rem',
            lg: '3rem'
          },
          paddingX: {
            sm: '0.75rem',
            md: '1rem',
            lg: '1.5rem'
          }
        },
        input: {
          height: {
            sm: '2rem',
            md: '2.5rem',
            lg: '3rem'
          },
          paddingX: '0.75rem',
          borderWidth: '1px'
        },
        card: {
          padding: '1.5rem',
          background: '#ffffff',
          border: '#e5e7eb',
          borderRadius: '0.5rem',
          shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        },
        header: {
          height: '4rem',
          background: '#ffffff',
          border: '#e5e7eb'
        },
        footer: {
          background: '#171717',
          text: '#f5f5f5'
        }
      }
    }
  }

  /**
   * Design Tokens von Builder.io laden
   */
  async function loadBuilderTokens(model: string = 'design-tokens'): Promise<void> {
    if (!apiKey) {
      console.warn('Builder.io API Key nicht gefunden')
      return
    }

    state.value.isLoading = true
    state.value.error = null

    try {
      console.log('Loading design tokens from Builder.io...', { model, apiKey })

      const content = await fetchOneEntry({
        model,
        apiKey,
        options: {
          includeRefs: true,
          cachebust: true
        }
      })

      if (content?.data) {
        const builderTokens = content.data as BuilderIODesignTokens
        state.value.builderTokens = builderTokens.tokens || {}
        state.value.lastUpdated = new Date()
        
        console.log('🚀 Design tokens loaded successfully:', {
          rawData: content.data,
          extractedTokens: builderTokens.tokens,
          hasColors: !!(builderTokens.tokens?.colors),
          primaryColors: builderTokens.tokens?.colors?.primary
        })
        
        // CSS Custom Properties aktualisieren
        applyTokensToCSS()
      } else {
        console.log('❌ No design tokens found in Builder.io - content:', content)
      }
    } catch (error) {
      console.error('Error loading design tokens from Builder.io:', error)
      state.value.error = `Failed to load design tokens: ${error}`
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Design Tokens auf CSS Custom Properties anwenden
   */
  function applyTokensToCSS(): void {
    const mergedTokens = getCurrentTokens()
    const root = document.documentElement

    console.log('🎨 Applying design tokens to CSS:', {
      hasBuilderTokens: !!state.value.builderTokens,
      mergedTokens: mergedTokens,
      builderTokens: state.value.builderTokens
    })

    // Colors
    if (mergedTokens.colors) {
      console.log('Applying colors:', mergedTokens.colors)
      applyColorTokens(root, mergedTokens.colors)
    }

    // Typography
    if (mergedTokens.typography) {
      console.log('Applying typography:', mergedTokens.typography)
      applyTypographyTokens(root, mergedTokens.typography)
    }

    // Spacing
    if (mergedTokens.spacing) {
      applySpacingTokens(root, mergedTokens.spacing, 'space')
    }

    // Sizing
    if (mergedTokens.sizing) {
      applySpacingTokens(root, mergedTokens.sizing, 'size')
    }

    // Border Radius
    if (mergedTokens.borderRadius) {
      applyBorderRadiusTokens(root, mergedTokens.borderRadius)
    }

    // Shadows
    if (mergedTokens.shadows) {
      applyShadowTokens(root, mergedTokens.shadows)
    }

    // Z-Index
    if (mergedTokens.zIndex) {
      applyZIndexTokens(root, mergedTokens.zIndex)
    }

    // Transitions
    if (mergedTokens.transitions) {
      applyTransitionTokens(root, mergedTokens.transitions)
    }

    // Components
    if (mergedTokens.components) {
      applyComponentTokens(root, mergedTokens.components)
    }

    // Debug: Log was tatsächlich auf das DOM angewendet wurde
    const appliedValues = {
      primary500: root.style.getPropertyValue('--color-primary-500'),
      background: root.style.getPropertyValue('--color-background-primary'),
      textPrimary: root.style.getPropertyValue('--color-text-primary')
    }
    console.log('✅ Applied CSS values:', appliedValues)
    console.log('Design tokens applied to CSS custom properties')
  }

  /**
   * Color Tokens anwenden
   */
  function applyColorTokens(root: HTMLElement, colors: any): void {
    console.log('🎨 applyColorTokens called with:', colors)
    
    // Primary Colors
    if (colors.primary) {
      console.log('Setting primary colors:', colors.primary)
      Object.entries(colors.primary).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const cssProperty = `--color-primary-${key}`
          console.log(`Setting ${cssProperty} = ${value}`)
          root.style.setProperty(cssProperty, value as string)
        }
      })
    }

    // Secondary Colors
    if (colors.secondary) {
      Object.entries(colors.secondary).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--color-secondary-${key}`, value as string)
        }
      })
    }

    // Neutral Colors
    if (colors.neutral) {
      Object.entries(colors.neutral).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--color-neutral-${key}`, value as string)
        }
      })
    }

    // Semantic Colors
    const semanticColors = ['success', 'warning', 'error', 'info']
    semanticColors.forEach(colorName => {
      const colorGroup = colors[colorName as keyof typeof colors]
      if (colorGroup && typeof colorGroup === 'object') {
        Object.entries(colorGroup).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            root.style.setProperty(`--color-${colorName}-${key}`, value as string)
          }
        })
      }
    })

    // Background Colors
    if (colors.background) {
      Object.entries(colors.background).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--color-background-${key}`, value as string)
        }
      })
    }

    // Text Colors
    if (colors.text) {
      Object.entries(colors.text).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const cssKey = key === 'linkHover' ? 'link-hover' : key
          root.style.setProperty(`--color-text-${cssKey}`, value as string)
        }
      })
    }

    // Border Colors
    if (colors.border) {
      Object.entries(colors.border).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--color-border-${key}`, value as string)
        }
      })
    }
  }

  /**
   * Typography Tokens anwenden
   */
  function applyTypographyTokens(root: HTMLElement, typography: any): void {
    if (typography.fontFamily) {
      Object.entries(typography.fontFamily).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--font-family-${key}`, value as string)
        }
      })
    }

    if (typography.fontSize) {
      Object.entries(typography.fontSize).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--font-size-${key}`, value as string)
        }
      })
    }

    if (typography.fontWeight) {
      Object.entries(typography.fontWeight).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--font-weight-${key}`, value as string)
        }
      })
    }

    if (typography.lineHeight) {
      Object.entries(typography.lineHeight).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--line-height-${key}`, value as string)
        }
      })
    }

    if (typography.letterSpacing) {
      Object.entries(typography.letterSpacing).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--letter-spacing-${key}`, value as string)
        }
      })
    }
  }

  /**
   * Spacing/Sizing Tokens anwenden
   */
  function applySpacingTokens(root: HTMLElement, spacing: any, prefix: string): void {
    if (spacing && typeof spacing === 'object') {
      Object.entries(spacing).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--${prefix}-${key}`, value as string)
        }
      })
    }
  }

  /**
   * Border Radius Tokens anwenden
   */
  function applyBorderRadiusTokens(root: HTMLElement, borderRadius: any): void {
    if (borderRadius && typeof borderRadius === 'object') {
      Object.entries(borderRadius).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--border-radius-${key}`, value as string)
        }
      })
    }
  }

  /**
   * Shadow Tokens anwenden
   */
  function applyShadowTokens(root: HTMLElement, shadows: any): void {
    if (shadows && typeof shadows === 'object') {
      Object.entries(shadows).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--shadow-${key}`, value as string)
        }
      })
    }
  }

  /**
   * Z-Index Tokens anwenden
   */
  function applyZIndexTokens(root: HTMLElement, zIndex: any): void {
    if (zIndex && typeof zIndex === 'object') {
      Object.entries(zIndex).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          root.style.setProperty(`--z-index-${key}`, value as string)
        }
      })
    }
  }

  /**
   * Transition Tokens anwenden
   */
  function applyTransitionTokens(root: HTMLElement, transitions: any): void {
    if (transitions && typeof transitions === 'object') {
      if (transitions.duration && typeof transitions.duration === 'object') {
        Object.entries(transitions.duration).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            root.style.setProperty(`--transition-duration-${key}`, value as string)
          }
        })
      }

      if (transitions.timing && typeof transitions.timing === 'object') {
        Object.entries(transitions.timing).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            const cssKey = key === 'inOut' ? 'in-out' : key
            root.style.setProperty(`--transition-timing-${cssKey}`, value as string)
          }
        })
      }
    }
  }

  /**
   * Component Tokens anwenden
   */
  function applyComponentTokens(root: HTMLElement, components: any): void {
    if (components && typeof components === 'object') {
      Object.entries(components).forEach(([componentName, componentTokens]) => {
        if (componentTokens && typeof componentTokens === 'object') {
          Object.entries(componentTokens as any).forEach(([tokenKey, tokenValue]) => {
            if (tokenValue !== null && tokenValue !== undefined) {
              if (typeof tokenValue === 'object') {
                Object.entries(tokenValue).forEach(([subKey, subValue]) => {
                  if (subValue !== null && subValue !== undefined) {
                    root.style.setProperty(`--${componentName}-${tokenKey}-${subKey}`, subValue as string)
                  }
                })
              } else {
                const cssKey = tokenKey === 'paddingX' ? 'padding-x' : 
                              tokenKey === 'borderWidth' ? 'border-width' : tokenKey
                root.style.setProperty(`--${componentName}-${cssKey}`, tokenValue as string)
              }
            }
          })
        }
      })
    }
  }

  /**
   * Aktuelle Design Tokens (Default + Builder.io Overrides)
   */
  function getCurrentTokens(): DesignTokens {
    const defaultTokens = state.value.defaultTokens
    const builderTokens = state.value.builderTokens

    console.log('🔄 getCurrentTokens called:', {
      hasDefaultTokens: !!defaultTokens,
      hasBuilderTokens: !!builderTokens,
      builderTokensKeys: builderTokens ? Object.keys(builderTokens) : [],
      builderColors: builderTokens?.colors
    })

    if (!builderTokens) {
      console.log('⚠️ No builder tokens, returning defaults')
      return defaultTokens
    }

    // Deep merge der Tokens
    const merged = mergeDeep(defaultTokens, builderTokens) as DesignTokens
    console.log('🔀 Merged tokens result:', {
      hasColors: !!merged.colors,
      primaryColors: merged.colors?.primary,
      mergedPrimary500: merged.colors?.primary?.[500]
    })
    
    return merged
  }

  /**
   * Deep merge von Objekten
   */
  function mergeDeep(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = mergeDeep(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  /**
   * Design Tokens für Builder.io Data Context
   */
  const designTokensData = computed(() => ({
    designTokens: getCurrentTokens(),
    isLoading: state.value.isLoading,
    error: state.value.error,
    lastUpdated: state.value.lastUpdated,
    currentTheme: state.value.currentTheme
  }))

  // CSS anwenden wenn Tokens sich ändern
  watch(() => state.value.builderTokens, async () => {
    if (typeof window !== 'undefined') {
      await nextTick()
      applyTokensToCSS()
    }
  }, { deep: true })

  // Initial load
  onMounted(() => {
    if (typeof window !== 'undefined') {
      // Immer zuerst die Default Tokens anwenden
      applyTokensToCSS()
      
      // Dann versuchen Builder.io Tokens zu laden
      loadBuilderTokens()
    }
  })

  return {
    // State
    state: readonly(state),
    
    // Computed
    currentTokens: computed(() => getCurrentTokens()),
    designTokensData,
    
    // Methods
    loadBuilderTokens,
    applyTokensToCSS,
    
    // Utilities
    getTokenValue: (path: string) => {
      const tokens = getCurrentTokens()
      return path.split('.').reduce((obj: any, key: string) => obj?.[key], tokens)
    }
  }
}