export default defineNuxtPlugin(() => {
  console.log('🎨 Design Tokens Plugin loaded!')
  
  // Nur im Client
  if (process.server) {
    console.log('🎨 Running on server, skipping...')
    return
  }

  console.log('🎨 Running on client, starting CSS injection...')

  const config = useRuntimeConfig()
  const apiKey = config.public.BUILDER_API_KEY as string

  if (!apiKey) {
    console.warn('🎨 No Builder.io API key found')
    return
  }

  // CSS direkt in DOM einfügen
  nextTick(() => {
    console.log('🎨 Injecting high-priority CSS...')
    
    const style = document.createElement('style')
    style.id = 'builder-design-tokens-override'
    style.innerHTML = `
      /* High Priority Design Token Overrides */
      :root {
        --color-primary-500: #ff0000 !important; /* Test: Rot */
        --color-neutral-900: #00ff00 !important; /* Test: Grün */
        --font-size-xl: 2rem !important; /* Test: Groß */
      }
    `
    
    // Am Ende des head einfügen für höchste Priorität
    document.head.appendChild(style)
    
    console.log('🎨 ✅ Test CSS injected with !important')
  })
})