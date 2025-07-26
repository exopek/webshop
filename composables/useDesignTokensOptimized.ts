import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRuntimeConfig } from '#app'
import { fetchOneEntry } from '@builder.io/sdk-vue'
import type { 
  DesignTokens, 
  BuilderIODesignTokens, 
  DesignTokenState
} from '~/types/design-tokens'

/**
 * Optimierte Version des Design Token Composables
 * Fokus auf Performance durch Caching, Debouncing und effiziente DOM-Updates
 */
export const useDesignTokensOptimized = () => {
  const config = useRuntimeConfig()
  const apiKey = config.public.BUILDER_API_KEY as string

  // Performance Tracking
  const performanceMetrics = ref({
    lastLoadTime: 0,
    lastApplyTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalUpdates: 0
  })

  // State mit erweiterten Caching-Funktionen
  const state = ref<DesignTokenState & {
    cachedTokens: Map<string, { data: Partial<DesignTokens>, timestamp: number }>,
    lastCacheKey: string | null,
    isApplying: boolean
  }>({
    defaultTokens: getDefaultTokens(),
    builderTokens: null,
    currentTheme: 'default',
    isLoading: false,
    error: null,
    lastUpdated: null,
    cachedTokens: new Map(),
    lastCacheKey: null,
    isApplying: false
  })

  // Cache TTL (5 Minuten)
  const CACHE_TTL = 5 * 60 * 1000

  // Debounce Timer für DOM Updates
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Default Design Tokens - Optimiert mit lazy loading
   */
  function getDefaultTokens(): DesignTokens {
    // Nur die wichtigsten Tokens initial laden
    return {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554'
        },
        secondary: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
          500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
        },
        neutral: {
          50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3',
          500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a'
        },
        success: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 900: '#14532d' },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706', 900: '#78350f' },
        error: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 900: '#7f1d1d' },
        info: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 900: '#0c4a6e' },
        background: { primary: '#ffffff', secondary: '#f8fafc', tertiary: '#f1f5f9', overlay: 'rgba(0, 0, 0, 0.5)' },
        text: { primary: '#1f2937', secondary: '#6b7280', tertiary: '#9ca3af', inverse: '#ffffff', link: '#2563eb', linkHover: '#1d4ed8' },
        border: { primary: '#e5e7eb', secondary: '#d1d5db', focus: '#3b82f6', error: '#ef4444' }
      },
      typography: {
        fontFamily: {
          sans: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          serif: 'Playfair Display, Georgia, serif',
          mono: 'JetBrains Mono, Consolas, monospace'
        },
        fontSize: {
          xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem',
          '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '3.75rem'
        },
        fontWeight: { light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800' },
        lineHeight: { tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2' },
        letterSpacing: { tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em' }
      },
      spacing: {
        0: '0', px: '1px', '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
        '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem',
        7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem',
        14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem',
        40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem',
        64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem'
      },
      sizing: {
        0: '0', px: '1px', '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem',
        '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem',
        7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem',
        14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem',
        40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem',
        64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem'
      },
      breakpoints: { xs: '475px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
      borderRadius: {
        none: '0', sm: '0.125rem', base: '0.25rem', md: '0.375rem', lg: '0.5rem',
        xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px'
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
        hide: '-1', auto: 'auto', base: '0', docked: '10', dropdown: '1000', sticky: '1100',
        banner: '1200', overlay: '1300', modal: '1400', popover: '1500', skiplink: '1600',
        toast: '1700', tooltip: '1800'
      },
      transitions: {
        duration: { 75: '75ms', 100: '100ms', 150: '150ms', 200: '200ms', 300: '300ms', 500: '500ms', 700: '700ms', 1000: '1000ms' },
        timing: { linear: 'linear', in: 'cubic-bezier(0.4, 0, 1, 1)', out: 'cubic-bezier(0, 0, 0.2, 1)', inOut: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      },
      components: {
        button: {
          height: { sm: '2rem', md: '2.5rem', lg: '3rem' },
          paddingX: { sm: '0.75rem', md: '1rem', lg: '1.5rem' }
        },
        input: {
          height: { sm: '2rem', md: '2.5rem', lg: '3rem' },
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
        header: { height: '4rem', background: '#ffffff', border: '#e5e7eb' },
        footer: { background: '#171717', text: '#f5f5f5' }
      }
    }
  }

  /**
   * Cache Key generieren basierend auf Model und Theme
   */
  function generateCacheKey(model: string, theme: string = 'default'): string {
    return `${model}-${theme}-${apiKey?.slice(-8) || 'nokey'}`
  }

  /**
   * Cached Design Tokens laden
   */
  function getCachedTokens(cacheKey: string): Partial<DesignTokens> | null {
    const cached = state.value.cachedTokens.get(cacheKey)
    if (!cached) {
      performanceMetrics.value.cacheMisses++
      return null
    }

    // TTL Check
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      state.value.cachedTokens.delete(cacheKey)
      performanceMetrics.value.cacheMisses++
      return null
    }

    performanceMetrics.value.cacheHits++
    return cached.data
  }

  /**
   * Tokens in Cache speichern
   */
  function setCachedTokens(cacheKey: string, tokens: Partial<DesignTokens>): void {
    state.value.cachedTokens.set(cacheKey, {
      data: tokens,
      timestamp: Date.now()
    })

    // Cache cleanup - nur die letzten 10 Einträge behalten
    if (state.value.cachedTokens.size > 10) {
      const firstKey = state.value.cachedTokens.keys().next().value as string
      state.value.cachedTokens.delete(firstKey)
    }
  }

  /**
   * Design Tokens von Builder.io laden - mit Caching
   */
  async function loadBuilderTokens(model: string = 'design-tokens', theme: string = 'default'): Promise<void> {
    if (!apiKey) {
      console.warn('Builder.io API Key nicht gefunden')
      return
    }

    const startTime = performance.now()
    const cacheKey = generateCacheKey(model, theme)

    // Cache prüfen
    const cachedTokens = getCachedTokens(cacheKey)
    if (cachedTokens) {
      state.value.builderTokens = cachedTokens
      state.value.lastCacheKey = cacheKey
      console.log('Design tokens loaded from cache:', { cacheKey, tokens: cachedTokens })
      return
    }

    state.value.isLoading = true
    state.value.error = null

    try {
      console.log('Loading design tokens from Builder.io...', { model, theme, apiKey: apiKey.slice(-8) })

      const content = await fetchOneEntry({
        model,
        apiKey,
        userAttributes: theme !== 'default' ? { theme } : undefined,
        options: {
          includeRefs: true,
          cachebust: false // Browser Caching aktivieren
        }
      })

      if (content?.data) {
        const builderTokens = content.data as BuilderIODesignTokens
        const tokens = builderTokens.tokens || {}
        
        // In Cache speichern
        setCachedTokens(cacheKey, tokens)
        
        state.value.builderTokens = tokens
        state.value.lastCacheKey = cacheKey
        state.value.lastUpdated = new Date()
        state.value.currentTheme = theme
        
        console.log('Design tokens loaded and cached:', { cacheKey, tokens })
      } else {
        console.log('No design tokens found in Builder.io')
      }
    } catch (error) {
      console.error('Error loading design tokens from Builder.io:', error)
      state.value.error = `Failed to load design tokens: ${error}`
    } finally {
      state.value.isLoading = false
      performanceMetrics.value.lastLoadTime = performance.now() - startTime
    }
  }

  /**
   * Optimierte CSS Token Application mit Batching
   */
  function applyTokensToCSS(): void {
    if (state.value.isApplying || typeof window === 'undefined') return

    const startTime = performance.now()
    state.value.isApplying = true

    try {
      const mergedTokens = getCurrentTokens()
      const root = document.documentElement
      
      // Batch CSS Updates für bessere Performance
      const cssUpdates: Array<[string, string]> = []

      // Alle Token-Updates sammeln
      collectCSSUpdates(mergedTokens, cssUpdates)

      // Batch Update mit requestAnimationFrame für smooth UI
      requestAnimationFrame(() => {
        cssUpdates.forEach(([property, value]) => {
          root.style.setProperty(property, value)
        })

        performanceMetrics.value.lastApplyTime = performance.now() - startTime
        performanceMetrics.value.totalUpdates++
        
        console.log(`Applied ${cssUpdates.length} CSS custom properties in ${performanceMetrics.value.lastApplyTime.toFixed(2)}ms`)
      })
    } finally {
      state.value.isApplying = false
    }
  }

  /**
   * CSS Updates sammeln (ohne DOM-Manipulation)
   */
  function collectCSSUpdates(tokens: DesignTokens, updates: Array<[string, string]>): void {
    // Colors
    if (tokens.colors) {
      collectColorUpdates(tokens.colors, updates)
    }

    // Typography
    if (tokens.typography) {
      collectTypographyUpdates(tokens.typography, updates)
    }

    // Spacing & Sizing
    if (tokens.spacing) {
      collectSpacingUpdates(tokens.spacing, 'space', updates)
    }
    if (tokens.sizing) {
      collectSpacingUpdates(tokens.sizing, 'size', updates)
    }

    // Other tokens
    collectObjectUpdates(tokens.borderRadius, 'border-radius', updates)
    collectObjectUpdates(tokens.shadows, 'shadow', updates)
    collectObjectUpdates(tokens.zIndex, 'z-index', updates)
    
    if (tokens.transitions) {
      collectObjectUpdates(tokens.transitions.duration, 'transition-duration', updates)
      if (tokens.transitions.timing) {
        Object.entries(tokens.transitions.timing).forEach(([key, value]) => {
          if (value) {
            const cssKey = key === 'inOut' ? 'in-out' : key
            updates.push([`--transition-timing-${cssKey}`, value])
          }
        })
      }
    }

    // Components
    if (tokens.components) {
      collectComponentUpdates(tokens.components, updates)
    }
  }

  /**
   * Color Updates sammeln
   */
  function collectColorUpdates(colors: any, updates: Array<[string, string]>): void {
    const colorGroups = ['primary', 'secondary', 'neutral', 'success', 'warning', 'error', 'info']
    
    colorGroups.forEach(group => {
      if (colors[group]) {
        Object.entries(colors[group]).forEach(([shade, value]) => {
          if (value) updates.push([`--color-${group}-${shade}`, value as string])
        })
      }
    })

    // Background, Text, Border Colors
    const specialGroups = ['background', 'text', 'border']
    specialGroups.forEach(group => {
      if (colors[group]) {
        Object.entries(colors[group]).forEach(([key, value]) => {
          if (value) {
            const cssKey = key === 'linkHover' ? 'link-hover' : key
            updates.push([`--color-${group}-${cssKey}`, value as string])
          }
        })
      }
    })
  }

  /**
   * Typography Updates sammeln
   */
  function collectTypographyUpdates(typography: any, updates: Array<[string, string]>): void {
    const typoGroups = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']
    
    typoGroups.forEach(group => {
      if (typography[group]) {
        Object.entries(typography[group]).forEach(([key, value]) => {
          if (value) {
            const prefix = group.replace(/([A-Z])/g, '-$1').toLowerCase()
            updates.push([`--${prefix}-${key}`, value as string])
          }
        })
      }
    })
  }

  /**
   * Spacing Updates sammeln
   */
  function collectSpacingUpdates(spacing: any, prefix: string, updates: Array<[string, string]>): void {
    if (spacing) {
      Object.entries(spacing).forEach(([key, value]) => {
        if (value) updates.push([`--${prefix}-${key}`, value as string])
      })
    }
  }

  /**
   * Generic Object Updates sammeln
   */
  function collectObjectUpdates(obj: any, prefix: string, updates: Array<[string, string]>): void {
    if (obj) {
      Object.entries(obj).forEach(([key, value]) => {
        if (value) updates.push([`--${prefix}-${key}`, value as string])
      })
    }
  }

  /**
   * Component Updates sammeln
   */
  function collectComponentUpdates(components: any, updates: Array<[string, string]>): void {
    Object.entries(components).forEach(([componentName, componentTokens]) => {
      if (componentTokens && typeof componentTokens === 'object') {
        Object.entries(componentTokens as any).forEach(([tokenKey, tokenValue]) => {
          if (tokenValue !== null && tokenValue !== undefined) {
            if (typeof tokenValue === 'object') {
              Object.entries(tokenValue).forEach(([subKey, subValue]) => {
                if (subValue) {
                  updates.push([`--${componentName}-${tokenKey}-${subKey}`, subValue as string])
                }
              })
            } else {
              const cssKey = tokenKey === 'paddingX' ? 'padding-x' : 
                            tokenKey === 'borderWidth' ? 'border-width' : tokenKey
              updates.push([`--${componentName}-${cssKey}`, tokenValue as string])
            }
          }
        })
      }
    })
  }

  /**
   * Debounced CSS Application
   */
  function debouncedApplyTokens(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      applyTokensToCSS()
    }, 100) // 100ms debounce
  }

  /**
   * Aktuelle Design Tokens mit Memoization
   */
  const memoizedTokens = ref<DesignTokens | null>(null)
  const memoizedCacheKey = ref<string | null>(null)

  function getCurrentTokens(): DesignTokens {
    const currentCacheKey = state.value.lastCacheKey || 'default'
    
    // Memoization check
    if (memoizedTokens.value && memoizedCacheKey.value === currentCacheKey) {
      return memoizedTokens.value
    }

    const defaultTokens = state.value.defaultTokens
    const builderTokens = state.value.builderTokens

    let result: DesignTokens
    if (!builderTokens) {
      result = defaultTokens
    } else {
      result = mergeDeepOptimized(defaultTokens, builderTokens) as DesignTokens
    }

    // Memoize result
    memoizedTokens.value = result
    memoizedCacheKey.value = currentCacheKey

    return result
  }

  /**
   * Optimierter Deep Merge
   */
  function mergeDeepOptimized(target: any, source: any): any {
    if (!source || typeof source !== 'object') return target
    
    const result = { ...target }
    
    for (const key in source) {
      const sourceValue = source[key]
      if (sourceValue !== null && sourceValue !== undefined) {
        if (typeof sourceValue === 'object' && !Array.isArray(sourceValue) && target[key]) {
          result[key] = mergeDeepOptimized(target[key], sourceValue)
        } else {
          result[key] = sourceValue
        }
      }
    }
    
    return result
  }

  /**
   * Cache invalidation
   */
  function invalidateCache(): void {
    state.value.cachedTokens.clear()
    memoizedTokens.value = null
    memoizedCacheKey.value = null
    performanceMetrics.value.cacheHits = 0
    performanceMetrics.value.cacheMisses = 0
  }

  /**
   * Design Tokens für Builder.io Data Context
   */
  const designTokensData = computed(() => ({
    designTokens: getCurrentTokens(),
    isLoading: state.value.isLoading,
    error: state.value.error,
    lastUpdated: state.value.lastUpdated,
    currentTheme: state.value.currentTheme,
    performance: performanceMetrics.value
  }))

  // Optimierte Watchers
  watch(() => state.value.builderTokens, async () => {
    if (typeof window !== 'undefined') {
      await nextTick()
      debouncedApplyTokens()
    }
  }, { deep: false }) // Shallow watch für bessere Performance

  // Initial load
  onMounted(() => {
    if (typeof window !== 'undefined') {
      loadBuilderTokens()
    }
  })

  return {
    // State (readonly für bessere Performance)
    state: readonly(state),
    
    // Computed
    currentTokens: computed(() => getCurrentTokens()),
    designTokensData,
    performanceMetrics: readonly(performanceMetrics),
    
    // Methods
    loadBuilderTokens,
    applyTokensToCSS: debouncedApplyTokens,
    invalidateCache,
    
    // Utilities
    getTokenValue: (path: string) => {
      const tokens = getCurrentTokens()
      return path.split('.').reduce((obj: any, key: string) => obj?.[key], tokens)
    },
    
    // Performance Utilities
    getCacheStats: () => ({
      size: state.value.cachedTokens.size,
      hits: performanceMetrics.value.cacheHits,
      misses: performanceMetrics.value.cacheMisses,
      hitRate: performanceMetrics.value.cacheHits / (performanceMetrics.value.cacheHits + performanceMetrics.value.cacheMisses) * 100
    })
  }
}