<template>
  <div class="debug-page">
    <div class="container">
      <h1>Design Token Debug Page</h1>
      
      <!-- API Key Status -->
      <section class="debug-section">
        <h2>API Key Status</h2>
        <div class="status-item">
          <strong>API Key:</strong> 
          <span :class="apiKey ? 'success' : 'error'">
            {{ apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-8)}` : 'NOT SET' }}
          </span>
        </div>
      </section>

      <!-- Design Token Status -->
      <section class="debug-section">
        <h2>Design Token Status</h2>
        <div class="status-item">
          <strong>Loading:</strong> 
          <span :class="designTokensData.isLoading ? 'warning' : 'success'">
            {{ designTokensData.isLoading ? 'Loading...' : 'Ready' }}
          </span>
        </div>
        <div class="status-item">
          <strong>Error:</strong> 
          <span :class="designTokensData.error ? 'error' : 'success'">
            {{ designTokensData.error || 'None' }}
          </span>
        </div>
        <div class="status-item">
          <strong>Last Updated:</strong> 
          <span>{{ formatDate(designTokensData.lastUpdated) }}</span>
        </div>
        <div class="status-item">
          <strong>Current Theme:</strong> 
          <span>{{ designTokensData.currentTheme }}</span>
        </div>
      </section>

      <!-- CSS Custom Properties Test -->
      <section class="debug-section">
        <h2>CSS Custom Properties Test</h2>
        <div class="css-test">
          <div class="test-item">
            <strong>Primary Color (--color-primary-500):</strong>
            <div class="color-box primary-test" />
            <span class="css-value">{{ getCSSValue('--color-primary-500') }}</span>
          </div>
          <div class="test-item">
            <strong>Background Color (--color-background-primary):</strong>
            <div class="color-box bg-test" />
            <span class="css-value">{{ getCSSValue('--color-background-primary') }}</span>
          </div>
          <div class="test-item">
            <strong>Text Color (--color-text-primary):</strong>
            <div class="color-box text-test" />
            <span class="css-value">{{ getCSSValue('--color-text-primary') }}</span>
          </div>
        </div>
      </section>

      <!-- Manual Token Application -->
      <section class="debug-section">
        <h2>Manual Controls</h2>
        <div class="controls">
          <button @click="manualApplyTokens" class="debug-btn">Apply Default Tokens</button>
          <button @click="manualLoadBuilder" class="debug-btn">Load Builder.io Tokens</button>
          <button @click="testColorChange" class="debug-btn">Test Color Change</button>
        </div>
      </section>

      <!-- Footer Test -->
      <section class="debug-section">
        <h2>Footer Component Test</h2>
        <div class="footer-test">
          <Footer />
        </div>
      </section>

      <!-- Raw Token Data -->
      <section class="debug-section">
        <h2>Raw Token Data</h2>
        <details>
          <summary>Current Design Tokens (Click to expand)</summary>
          <pre class="token-data">{{ JSON.stringify(designTokensData.designTokens, null, 2) }}</pre>
        </details>
      </section>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const apiKey = config.public.BUILDER_API_KEY

// Design Tokens laden
const { designTokensData, applyTokensToCSS, loadBuilderTokens } = useDesignTokens()

// CSS Values dynamisch lesen
const cssValues = ref({})

function getCSSValue(property) {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(property) || 'Not set'
  }
  return 'Loading...'
}

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

// Manual Controls
function manualApplyTokens() {
  console.log('Manually applying design tokens...')
  applyTokensToCSS()
  
  // Update CSS values
  nextTick(() => {
    cssValues.value = {
      primary: getCSSValue('--color-primary-500'),
      background: getCSSValue('--color-background-primary'),
      text: getCSSValue('--color-text-primary')
    }
  })
}

function manualLoadBuilder() {
  console.log('Manually loading Builder.io tokens...')
  loadBuilderTokens()
}

function testColorChange() {
  console.log('Testing manual color change...')
  const root = document.documentElement
  root.style.setProperty('--color-primary-500', '#ff6b35')
  root.style.setProperty('--color-background-primary', '#f0f0f0')
  console.log('Applied test colors: primary=#ff6b35, background=#f0f0f0')
}

// Auto-refresh CSS values
onMounted(() => {
  const interval = setInterval(() => {
    cssValues.value = {
      primary: getCSSValue('--color-primary-500'),
      background: getCSSValue('--color-background-primary'),
      text: getCSSValue('--color-text-primary')
    }
  }, 1000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background: var(--color-background-secondary);
  padding: var(--space-8) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-8);
  text-align: center;
}

h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  border-bottom: 2px solid var(--color-primary-500);
  padding-bottom: var(--space-2);
}

.debug-section {
  background: var(--color-background-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-md);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-family: var(--font-family-mono);
}

.status-item strong {
  min-width: 120px;
  color: var(--color-text-secondary);
}

.success {
  color: var(--color-success-600);
  font-weight: var(--font-weight-medium);
}

.error {
  color: var(--color-error-600);
  font-weight: var(--font-weight-medium);
}

.warning {
  color: var(--color-warning-600);
  font-weight: var(--font-weight-medium);
}

.css-test {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.test-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.test-item strong {
  min-width: 250px;
  font-size: var(--font-size-sm);
}

.color-box {
  width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--color-border-primary);
}

.primary-test {
  background: var(--color-primary-500);
}

.bg-test {
  background: var(--color-background-primary);
  border: 2px solid var(--color-border-primary);
}

.text-test {
  background: var(--color-text-primary);
}

.css-value {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-background-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--border-radius-base);
}

.controls {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.debug-btn {
  background: var(--color-primary-500);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-duration-200) var(--transition-timing-in-out);
}

.debug-btn:hover {
  background: var(--color-primary-600);
}

.footer-test {
  border: 2px dashed var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.token-data {
  background: var(--color-background-secondary);
  padding: var(--space-4);
  border-radius: var(--border-radius-base);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-relaxed);
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

details {
  margin-top: var(--space-4);
}

summary {
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  padding: var(--space-2);
}

summary:hover {
  color: var(--color-primary-700);
}

/* Responsive */
@media (max-width: 768px) {
  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .test-item strong {
    min-width: auto;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .debug-btn {
    width: 100%;
  }
}
</style>