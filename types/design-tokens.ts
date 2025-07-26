/**
 * Design Token Interfaces für Builder.io Integration
 */

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface SemanticColor {
  50: string
  100: string
  500: string
  600: string
  900: string
}

export interface Colors {
  primary: ColorScale
  secondary: ColorScale
  neutral: ColorScale
  success: SemanticColor
  warning: SemanticColor
  error: SemanticColor
  info: SemanticColor
  background: {
    primary: string
    secondary: string
    tertiary: string
    overlay: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
    link: string
    linkHover: string
  }
  border: {
    primary: string
    secondary: string
    focus: string
    error: string
  }
}

export interface Typography {
  fontFamily: {
    sans: string
    serif: string
    mono: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }
  fontWeight: {
    light: string
    normal: string
    medium: string
    semibold: string
    bold: string
    extrabold: string
  }
  lineHeight: {
    tight: string
    snug: string
    normal: string
    relaxed: string
    loose: string
  }
  letterSpacing: {
    tight: string
    normal: string
    wide: string
    wider: string
    widest: string
  }
}

export interface Spacing {
  0: string
  px: string
  '0.5': string
  1: string
  '1.5': string
  2: string
  '2.5': string
  3: string
  '3.5': string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
}

export interface Breakpoints {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface BorderRadius {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

export interface Shadows {
  xs: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

export interface ZIndex {
  hide: string
  auto: string
  base: string
  docked: string
  dropdown: string
  sticky: string
  banner: string
  overlay: string
  modal: string
  popover: string
  skiplink: string
  toast: string
  tooltip: string
}

export interface Transitions {
  duration: {
    75: string
    100: string
    150: string
    200: string
    300: string
    500: string
    700: string
    1000: string
  }
  timing: {
    linear: string
    in: string
    out: string
    inOut: string
  }
}

export interface ComponentTokens {
  button: {
    height: {
      sm: string
      md: string
      lg: string
    }
    paddingX: {
      sm: string
      md: string
      lg: string
    }
  }
  input: {
    height: {
      sm: string
      md: string
      lg: string
    }
    paddingX: string
    borderWidth: string
  }
  card: {
    padding: string
    background: string
    border: string
    borderRadius: string
    shadow: string
  }
  header: {
    height: string
    background: string
    border: string
  }
  footer: {
    background: string
    text: string
  }
}

export interface DesignTokens {
  colors: Colors
  typography: Typography
  spacing: Spacing
  sizing: Spacing
  breakpoints: Breakpoints
  borderRadius: BorderRadius
  shadows: Shadows
  zIndex: ZIndex
  transitions: Transitions
  components: ComponentTokens
}

export interface BuilderIODesignTokens {
  tokens: Partial<DesignTokens>
  metadata?: {
    version: string
    lastUpdated: string
    theme: string
    author?: string
    description?: string
  }
}

export interface DesignTokenOverride {
  cssProperty: string
  value: string
  selector?: string
}

export interface ThemeConfig {
  name: string
  tokens: Partial<DesignTokens>
  overrides?: DesignTokenOverride[]
}

export interface DesignTokenState {
  defaultTokens: DesignTokens
  builderTokens: Partial<DesignTokens> | null
  currentTheme: string
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}