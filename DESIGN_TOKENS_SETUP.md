# Builder.io Design Tokens Setup Guide

## 🎨 Design Token Integration für Webshop Builder

### 1. Builder.io Model erstellen

1. **In Builder.io Dashboard gehen**
2. **Neues Model erstellen:**
   - Name: `design-tokens`
   - Type: `Data Model`
   - Preview URL: `https://your-domain.com/design-tokens-demo`

### 2. JSON Content anlegen

**Kopiere eine der folgenden JSON-Dateien in Builder.io:**

#### Option A: Sky Blue Theme (Hell)
```json
// Inhalt aus: builder-io-design-tokens-example.json
```

#### Option B: Dark Purple Theme (Dunkel) 
```json
// Inhalt aus: builder-io-design-tokens-dark.json
```

### 3. Builder.io Einstellungen

**Model Configuration:**
- **Model Name**: `design-tokens`
- **Preview URL**: `https://your-domain.com/design-tokens-demo`
- **Auto-publish**: ✅ Aktiviert
- **Cache TTL**: 300 seconds (5 minutes)

**Content Entry:**
- **Name**: `default-theme` oder `dark-theme`
- **JSON Content**: Paste one of the above JSONs
- **Status**: Published

### 4. Verwendung im Code

Das System lädt automatisch die Design Tokens:

```typescript
// Automatisch geladen in layouts/default.vue
const { designTokensData } = useDesignTokensOptimized()

// Verfügbar in allen Builder.io Components via :data
<Content 
  :model="'header'" 
  :data="designTokensData"
/>
```

### 5. CSS Custom Properties

Nach dem Laden sind alle Tokens als CSS Variablen verfügbar:

```css
.my-component {
  background: var(--color-primary-500);
  color: var(--color-text-primary);
  padding: var(--space-4);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}
```

### 6. Theme Switching

Für verschiedene Themes:

```typescript
// Theme laden
await loadBuilderTokens('design-tokens', 'dark-theme')

// Theme wechseln
await loadBuilderTokens('design-tokens', 'light-theme')
```

### 7. Performance Monitoring

```typescript
// Cache Statistics
const stats = getCacheStats()
console.log(`Cache Hit Rate: ${stats.hitRate}%`)

// Performance Metrics
console.log(`Last Load Time: ${performanceMetrics.value.lastLoadTime}ms`)
console.log(`Last Apply Time: ${performanceMetrics.value.lastApplyTime}ms`)
```

## 🔧 Erweiterte Konfiguration

### Custom Theme erstellen

1. **Neue JSON Datei erstellen** basierend auf dem Schema
2. **In Builder.io uploaden** mit eindeutigem Namen
3. **Theme laden:**
   ```typescript
   await loadBuilderTokens('design-tokens', 'my-custom-theme')
   ```

### Partielle Token Updates

Nur bestimmte Token überschreiben:

```json
{
  "tokens": {
    "colors": {
      "primary": {
        "500": "#ff6b35",
        "600": "#e55a2b"
      }
    },
    "components": {
      "button": {
        "height": {
          "md": "3rem"
        }
      }
    }
  },
  "metadata": {
    "theme": "orange-accent",
    "description": "Nur orange Akzentfarben ändern"
  }
}
```

### Multiple Environments

**Development:**
```json
{
  "tokens": { /* Debug-freundliche Farben */ },
  "metadata": { "theme": "dev" }
}
```

**Production:**
```json
{
  "tokens": { /* Brand-konforme Farben */ },
  "metadata": { "theme": "prod" }
}
```

## 🚀 Best Practices

1. **Naming Convention**: Verwende semantische Namen (`primary`, `secondary`) statt konkrete (`blue`, `red`)
2. **Granularity**: Definiere Farbskalen (50-950) für maximale Flexibilität
3. **Components**: Definiere component-spezifische Tokens für Konsistenz
4. **Metadata**: Immer Version und Beschreibung hinzufügen
5. **Cache**: Nutze das eingebaute Caching für bessere Performance

## 🎯 Demo

Besuche `/design-tokens-demo` um alle verfügbaren Tokens zu sehen und live zu testen.

## 🐛 Troubleshooting

**Problem**: Tokens werden nicht geladen
- ✅ Check Builder.io API Key in `.env`
- ✅ Check Model Name: `design-tokens`
- ✅ Check JSON Syntax

**Problem**: Performance Issues
- ✅ Verwende `useDesignTokensOptimized` statt `useDesignTokens`
- ✅ Check Cache Hit Rate mit `getCacheStats()`
- ✅ Reduziere Token-Komplexität

**Problem**: TypeScript Errors
- ✅ Check `types/design-tokens.ts` für korrekte Interfaces
- ✅ Stelle sicher dass alle required Properties gesetzt sind