# 🎨 Design Token CSS Generation System

Ein Build-Time System zur Generierung von CSS Design Tokens aus Builder.io JSON Daten.

## 🔧 Wie es funktioniert

### 1. **Build-Time Generation**
```bash
# Automatisch bei jedem Build
npm run build

# Manuell generieren
npm run tokens:generate

# Generieren + Dev Server starten
npm run tokens:dev
```

### 2. **CSS Priorität**
```typescript
// nuxt.config.ts
css: [
  '~/assets/css/main.css',           // ← Fallback Design Tokens
  '~/assets/css/builder-tokens.css'  // ← Builder.io Overrides (höhere Priorität)
]
```

### 3. **Automatischer Workflow**
1. **Build Hook** lädt Design Tokens von Builder.io
2. **CSS Generator** konvertiert JSON → CSS Custom Properties
3. **builder-tokens.css** wird geschrieben
4. **Nuxt** lädt CSS mit korrekter Priorität

## 📁 Dateien

### `utils/generateTokenCSS.ts`
- `DesignTokenCSSGenerator` Klasse
- JSON → CSS Konvertierung
- Builder.io API Integration

### `build-scripts/generateTokens.mjs`
- Standalone Build Script
- Environment Variable Support
- Error Handling

### `assets/css/builder-tokens.css`
- **Auto-generiert** - nicht manuell bearbeiten!
- Höhere CSS Priorität als main.css
- Überschreibt Default Design Tokens

### `nuxt.config.ts`
- Build Hook Integration
- CSS Load Order konfiguration

## 🎯 Usage

### Builder.io Setup
1. **Model erstellen:** `design-tokens`
2. **JSON Structure:**
```json
{
  "tokens": {
    "colors": {
      "primary": {
        "500": "#0ea5e9",
        "600": "#0284c7"
      }
    },
    "typography": {
      "fontSize": {
        "xl": "1.25rem"
      }
    }
  },
  "metadata": {
    "theme": "custom-theme",
    "version": "1.0.0"
  }
}
```

### CSS Usage
```css
.my-component {
  /* Diese Werte werden automatisch von Builder.io überschrieben */
  background: var(--color-primary-500);
  font-size: var(--font-size-xl);
}
```

### Development Workflow
```bash
# 1. Tokens in Builder.io ändern
# 2. CSS neu generieren
npm run tokens:generate

# 3. Dev Server neu starten (oder tokens:dev nutzen)
npm run dev
```

## 🚀 Vorteile

### ✅ **Performance**
- **Build-Time Generation** → Keine Runtime API Calls
- **Native CSS** → Keine JavaScript CSS Updates
- **Optimized Loading** → CSS wird mit Seite geladen

### ✅ **Developer Experience**
- **Automatic Builds** → Integriert in Nuxt Build Process
- **Fallback System** → main.css als Backup
- **Hot Reloading** → Änderungen sofort sichtbar

### ✅ **Maintainability**
- **Single Source of Truth** → Builder.io als Token Storage
- **Version Control** → Generated CSS tracked
- **Type Safety** → TypeScript Support

## 🐛 Troubleshooting

### Problem: CSS wird nicht überschrieben
```bash
# Check if builder-tokens.css exists and has content
cat assets/css/builder-tokens.css

# Regenerate tokens
npm run tokens:generate

# Check Builder.io API
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://builder.io/api/v1/query/design-tokens?apiKey=YOUR_API_KEY"
```

### Problem: Build Hook fails
```bash
# Check environment variables
echo $BUILDER_API_KEY

# Test manual generation
node build-scripts/generateTokens.mjs
```

### Problem: Tokens not loading
1. ✅ Check Builder.io Model exists: `design-tokens`
2. ✅ Check API Key in `.env`
3. ✅ Check JSON structure matches interface
4. ✅ Check CSS file order in nuxt.config.ts

## 📊 Generated CSS Example

```css
/* Generated Design Tokens from Builder.io */
:root {
  /* === COLORS === */
  /* Primary Colors */
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  
  /* === TYPOGRAPHY === */
  /* Font Sizes */
  --font-size-xl: 1.25rem;
  
  /* === COMPONENTS === */
  /* Button Component */
  --button-height-md: 2.5rem;
}

/* Generated at: 2025-01-25T15:30:00.000Z */
```

## 🔄 CI/CD Integration

```yaml
# GitHub Actions example
- name: Generate Design Tokens
  run: npm run tokens:generate
  env:
    BUILDER_API_KEY: ${{ secrets.BUILDER_API_KEY }}

- name: Build Nuxt App
  run: npm run build
```

Das System stellt sicher, dass Design Tokens zur Build-Zeit generiert werden und CSS Priorität korrekt funktioniert!