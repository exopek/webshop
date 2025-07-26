<template>
  <div class="debug-container">
    <h1>Design Token Debug</h1>
    
    <div class="test-box">
      <h2>Test Box</h2>
      <p>Diese Box sollte die Design Tokens verwenden</p>
      <button @click="testOverride">Test Override</button>
    </div>

    <div class="debug-info">
      <h3>Debug Info:</h3>
      <pre>{{ debugInfo }}</pre>
    </div>

    <div class="manual-test">
      <button @click="manualOverride">Manual CSS Override</button>
      <button @click="logCurrentValues">Log Current CSS Values</button>
    </div>
  </div>
</template>

<script setup>
const debugInfo = ref({})

function updateDebugInfo() {
  if (typeof window !== 'undefined') {
    const root = document.documentElement
    debugInfo.value = {
      primaryColor: getComputedStyle(root).getPropertyValue('--color-primary-500'),
      backgroundColor: getComputedStyle(root).getPropertyValue('--color-background-primary'),
      textColor: getComputedStyle(root).getPropertyValue('--color-text-primary'),
      timestamp: new Date().toISOString()
    }
  }
}

function testOverride() {
  console.log('Testing CSS override...')
  const root = document.documentElement
  
  // Direkt CSS Properties setzen
  root.style.setProperty('--color-primary-500', '#ff0000')
  root.style.setProperty('--color-background-primary', '#00ff00')
  
  console.log('Set primary to red, background to green')
  updateDebugInfo()
}

function manualOverride() {
  console.log('Manual override test...')
  const root = document.documentElement
  
  // Verschiedene Werte testen
  root.style.setProperty('--color-primary-500', '#purple')
  root.style.setProperty('--color-neutral-900', '#orange')
  
  console.log('Applied manual colors')
  updateDebugInfo()
}

function logCurrentValues() {
  const root = document.documentElement
  const allProperties = []
  
  // Alle CSS Custom Properties finden
  const styles = getComputedStyle(root)
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i]
    if (prop.startsWith('--color') || prop.startsWith('--font') || prop.startsWith('--space')) {
      allProperties.push({
        property: prop,
        value: styles.getPropertyValue(prop)
      })
    }
  }
  
  console.log('All Design Token Properties:', allProperties)
  updateDebugInfo()
}

onMounted(() => {
  updateDebugInfo()
  
  // Auto-update every 2 seconds
  const interval = setInterval(updateDebugInfo, 2000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.debug-container {
  padding: var(--space-8);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  min-height: 100vh;
}

.test-box {
  background: var(--color-primary-500);
  color: white;
  padding: var(--space-6);
  border-radius: var(--border-radius-lg);
  margin: var(--space-4) 0;
}

.test-box h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-2);
}

.test-box button {
  background: white;
  color: var(--color-primary-500);
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--border-radius-base);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.debug-info {
  background: var(--color-background-secondary);
  padding: var(--space-4);
  border-radius: var(--border-radius-base);
  margin: var(--space-4) 0;
}

.debug-info pre {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
}

.manual-test {
  display: flex;
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.manual-test button {
  background: var(--color-secondary-500);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

.manual-test button:hover {
  background: var(--color-secondary-600);
}
</style>