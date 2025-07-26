<template>
  <div class="design-tokens-demo">
    <!-- Header Section -->
    <section class="demo-header">
      <div class="container">
        <h1 class="demo-title">Design Tokens Demo</h1>
        <p class="demo-description">
          Diese Seite demonstriert die Design Token Integration mit Builder.io.
          Alle Styles verwenden CSS Custom Properties die von Builder.io überschrieben werden können.
        </p>
      </div>
    </section>

    <!-- Color Palette -->
    <section class="demo-section">
      <div class="container">
        <h2 class="section-title">Farbpalette</h2>
        
        <!-- Primary Colors -->
        <div class="color-group">
          <h3 class="color-group-title">Primary Colors</h3>
          <div class="color-swatches">
            <div v-for="shade in ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']" 
                 :key="shade" 
                 :class="`color-swatch primary-${shade}`">
              <span class="color-label">{{ shade }}</span>
            </div>
          </div>
        </div>

        <!-- Secondary Colors -->
        <div class="color-group">
          <h3 class="color-group-title">Secondary Colors</h3>
          <div class="color-swatches">
            <div v-for="shade in ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']" 
                 :key="shade" 
                 :class="`color-swatch secondary-${shade}`">
              <span class="color-label">{{ shade }}</span>
            </div>
          </div>
        </div>

        <!-- Semantic Colors -->
        <div class="color-group">
          <h3 class="color-group-title">Semantic Colors</h3>
          <div class="semantic-colors">
            <div class="semantic-color-row">
              <span class="semantic-label">Success:</span>
              <div class="color-swatch success-50"><span class="color-label">50</span></div>
              <div class="color-swatch success-100"><span class="color-label">100</span></div>
              <div class="color-swatch success-500"><span class="color-label">500</span></div>
              <div class="color-swatch success-600"><span class="color-label">600</span></div>
              <div class="color-swatch success-900"><span class="color-label">900</span></div>
            </div>
            <div class="semantic-color-row">
              <span class="semantic-label">Warning:</span>
              <div class="color-swatch warning-50"><span class="color-label">50</span></div>
              <div class="color-swatch warning-100"><span class="color-label">100</span></div>
              <div class="color-swatch warning-500"><span class="color-label">500</span></div>
              <div class="color-swatch warning-600"><span class="color-label">600</span></div>
              <div class="color-swatch warning-900"><span class="color-label">900</span></div>
            </div>
            <div class="semantic-color-row">
              <span class="semantic-label">Error:</span>
              <div class="color-swatch error-50"><span class="color-label">50</span></div>
              <div class="color-swatch error-100"><span class="color-label">100</span></div>
              <div class="color-swatch error-500"><span class="color-label">500</span></div>
              <div class="color-swatch error-600"><span class="color-label">600</span></div>
              <div class="color-swatch error-900"><span class="color-label">900</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Typography -->
    <section class="demo-section">
      <div class="container">
        <h2 class="section-title">Typography</h2>
        
        <div class="typography-demo">
          <div class="font-sizes">
            <h3 class="subsection-title">Font Sizes</h3>
            <div class="text-xs">Extra Small Text (xs)</div>
            <div class="text-sm">Small Text (sm)</div>
            <div class="text-base">Base Text (base)</div>
            <div class="text-lg">Large Text (lg)</div>
            <div class="text-xl">Extra Large Text (xl)</div>
            <div class="text-2xl">2X Large Text (2xl)</div>
            <div class="text-3xl">3X Large Text (3xl)</div>
            <div class="text-4xl">4X Large Text (4xl)</div>
          </div>

          <div class="font-weights">
            <h3 class="subsection-title">Font Weights</h3>
            <div class="font-light">Light Weight Text</div>
            <div class="font-normal">Normal Weight Text</div>
            <div class="font-medium">Medium Weight Text</div>
            <div class="font-semibold">Semibold Weight Text</div>
            <div class="font-bold">Bold Weight Text</div>
            <div class="font-extrabold">Extra Bold Weight Text</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Components -->
    <section class="demo-section">
      <div class="container">
        <h2 class="section-title">Components</h2>
        
        <div class="components-demo">
          <!-- Buttons -->
          <div class="component-group">
            <h3 class="subsection-title">Buttons</h3>
            <div class="button-group">
              <button class="btn btn-primary btn-sm">Small Button</button>
              <button class="btn btn-primary btn-md">Medium Button</button>
              <button class="btn btn-primary btn-lg">Large Button</button>
            </div>
            <div class="button-group">
              <button class="btn btn-secondary btn-md">Secondary</button>
              <button class="btn btn-success btn-md">Success</button>
              <button class="btn btn-warning btn-md">Warning</button>
              <button class="btn btn-error btn-md">Error</button>
            </div>
          </div>

          <!-- Form Elements -->
          <div class="component-group">
            <h3 class="subsection-title">Form Elements</h3>
            <div class="form-group">
              <label class="form-label">Input Small</label>
              <input type="text" class="form-input input-sm" placeholder="Small input">
            </div>
            <div class="form-group">
              <label class="form-label">Input Medium</label>
              <input type="text" class="form-input input-md" placeholder="Medium input">
            </div>
            <div class="form-group">
              <label class="form-label">Input Large</label>
              <input type="text" class="form-input input-lg" placeholder="Large input">
            </div>
          </div>

          <!-- Cards -->
          <div class="component-group">
            <h3 class="subsection-title">Cards</h3>
            <div class="cards-demo">
              <div class="demo-card">
                <h4 class="card-title">Card Title</h4>
                <p class="card-text">
                  This is a demo card using CSS custom properties for styling.
                  All properties can be overridden via Builder.io design tokens.
                </p>
                <button class="btn btn-primary btn-sm">Card Action</button>
              </div>
              <div class="demo-card">
                <h4 class="card-title">Another Card</h4>
                <p class="card-text">
                  Cards use consistent spacing, colors, and shadows defined 
                  in our design token system.
                </p>
                <button class="btn btn-secondary btn-sm">Secondary Action</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Design Token Info -->
    <section class="demo-section">
      <div class="container">
        <h2 class="section-title">Design Token Status</h2>
        <div class="token-status">
          <div class="status-card">
            <h3 class="status-title">Current Theme</h3>
            <p class="status-value">{{ designTokensData.currentTheme }}</p>
          </div>
          <div class="status-card">
            <h3 class="status-title">Loading Status</h3>
            <p class="status-value" :class="{ 'loading': designTokensData.isLoading }">
              {{ designTokensData.isLoading ? 'Loading...' : 'Loaded' }}
            </p>
          </div>
          <div class="status-card">
            <h3 class="status-title">Last Updated</h3>
            <p class="status-value">{{ formatDate(designTokensData.lastUpdated) }}</p>
          </div>
          <div v-if="designTokensData.error" class="status-card error">
            <h3 class="status-title">Error</h3>
            <p class="status-value">{{ designTokensData.error }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Builder.io Integration -->
    <section class="demo-section">
      <div class="container">
        <Content 
          :api-key="apiKey"
          model="design-token-demo" 
          :data="designTokensData"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { Content } from '@builder.io/sdk-vue'

const config = useRuntimeConfig()
const apiKey = config.public.BUILDER_API_KEY

// Design Tokens laden
const { designTokensData } = useDesignTokens()

function formatDate(date) {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>

<style scoped>
/* Demo Specific Styles using Design Tokens */
.design-tokens-demo {
  min-height: 100vh;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* Header */
.demo-header {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
  color: white;
  padding: var(--space-16) 0;
  text-align: center;
}

.demo-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-4) 0;
}

.demo-description {
  font-size: var(--font-size-lg);
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
  line-height: var(--line-height-relaxed);
}

/* Sections */
.demo-section {
  padding: var(--space-16) 0;
  border-bottom: 1px solid var(--color-border-primary);
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-8) 0;
  color: var(--color-text-primary);
}

.subsection-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-secondary);
}

/* Color Swatches */
.color-group {
  margin-bottom: var(--space-8);
}

.color-group-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--space-4) 0;
}

.color-swatches {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.color-swatch {
  width: var(--space-16);
  height: var(--space-16);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-primary);
  position: relative;
}

.color-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  color: white;
}

/* Primary Colors */
.primary-50 { background: var(--color-primary-50); }
.primary-100 { background: var(--color-primary-100); }
.primary-200 { background: var(--color-primary-200); }
.primary-300 { background: var(--color-primary-300); }
.primary-400 { background: var(--color-primary-400); }
.primary-500 { background: var(--color-primary-500); }
.primary-600 { background: var(--color-primary-600); }
.primary-700 { background: var(--color-primary-700); }
.primary-800 { background: var(--color-primary-800); }
.primary-900 { background: var(--color-primary-900); }
.primary-950 { background: var(--color-primary-950); }

/* Secondary Colors */
.secondary-50 { background: var(--color-secondary-50); }
.secondary-100 { background: var(--color-secondary-100); }
.secondary-200 { background: var(--color-secondary-200); }
.secondary-300 { background: var(--color-secondary-300); }
.secondary-400 { background: var(--color-secondary-400); }
.secondary-500 { background: var(--color-secondary-500); }
.secondary-600 { background: var(--color-secondary-600); }
.secondary-700 { background: var(--color-secondary-700); }
.secondary-800 { background: var(--color-secondary-800); }
.secondary-900 { background: var(--color-secondary-900); }
.secondary-950 { background: var(--color-secondary-950); }

/* Semantic Colors */
.semantic-colors {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.semantic-color-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.semantic-label {
  min-width: var(--space-20);
  font-weight: var(--font-weight-medium);
}

.success-50 { background: var(--color-success-50); }
.success-100 { background: var(--color-success-100); }
.success-500 { background: var(--color-success-500); }
.success-600 { background: var(--color-success-600); }
.success-900 { background: var(--color-success-900); }

.warning-50 { background: var(--color-warning-50); }
.warning-100 { background: var(--color-warning-100); }
.warning-500 { background: var(--color-warning-500); }
.warning-600 { background: var(--color-warning-600); }
.warning-900 { background: var(--color-warning-900); }

.error-50 { background: var(--color-error-50); }
.error-100 { background: var(--color-error-100); }
.error-500 { background: var(--color-error-500); }
.error-600 { background: var(--color-error-600); }
.error-900 { background: var(--color-error-900); }

/* Typography */
.typography-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.font-sizes > div,
.font-weights > div {
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-base);
}

/* Components */
.components-demo {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.component-group {
  padding: var(--space-6);
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
}

/* Buttons */
.button-group {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-duration-200) var(--transition-timing-in-out);
}

.btn-sm {
  height: var(--button-height-sm);
  padding: 0 var(--button-padding-x-sm);
  font-size: var(--font-size-sm);
}

.btn-md {
  height: var(--button-height-md);
  padding: 0 var(--button-padding-x-md);
  font-size: var(--font-size-base);
}

.btn-lg {
  height: var(--button-height-lg);
  padding: 0 var(--button-padding-x-lg);
  font-size: var(--font-size-lg);
}

.btn-primary {
  background: var(--color-primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-600);
}

.btn-secondary {
  background: var(--color-secondary-500);
  color: white;
}

.btn-secondary:hover {
  background: var(--color-secondary-600);
}

.btn-success {
  background: var(--color-success-500);
  color: white;
}

.btn-success:hover {
  background: var(--color-success-600);
}

.btn-warning {
  background: var(--color-warning-500);
  color: white;
}

.btn-warning:hover {
  background: var(--color-warning-600);
}

.btn-error {
  background: var(--color-error-500);
  color: white;
}

.btn-error:hover {
  background: var(--color-error-600);
}

/* Form Elements */
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  border: var(--input-border-width) solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  padding: 0 var(--input-padding-x);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-duration-200) var(--transition-timing-in-out);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.input-sm {
  height: var(--input-height-sm);
  font-size: var(--font-size-sm);
}

.input-md {
  height: var(--input-height-md);
  font-size: var(--font-size-base);
}

.input-lg {
  height: var(--input-height-lg);
  font-size: var(--font-size-lg);
}

/* Cards */
.cards-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.demo-card {
  background: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: var(--card-border-radius);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-3) 0;
  color: var(--color-text-primary);
}

.card-text {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--space-4) 0;
}

/* Token Status */
.token-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.status-card {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-4);
}

.status-card.error {
  border-color: var(--color-error-500);
  background: var(--color-error-50);
}

.status-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.status-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.status-value.loading {
  color: var(--color-warning-600);
}

.status-card.error .status-value {
  color: var(--color-error-600);
}

/* Responsive */
@media (max-width: 768px) {
  .typography-demo {
    grid-template-columns: 1fr;
  }
  
  .cards-demo {
    grid-template-columns: 1fr;
  }
  
  .token-status {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .semantic-color-row {
    flex-wrap: wrap;
  }
}
</style>