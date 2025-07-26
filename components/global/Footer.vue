<template>
  <footer class="bg-primary text-tertiary">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-main">
        <!-- Company Info -->
        <div class="footer-section">
          <div class="footer-logo">
            <img v-if="logo" :src="logo" :alt="siteName" class="logo-image" />
            <span v-else class="logo-text">{{ siteName }}</span>
          </div>
          <p class="footer-description">{{ description }}</p>
          
          <!-- Social Media -->
          <div v-if="socialLinks.length > 0" class="social-links">
            <a 
              v-for="(social, index) in socialLinks"
              :key="index"
              :href="social.url"
              :title="social.name"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <component :is="social.icon" class="social-icon" />
            </a>
          </div>
        </div>

        <!-- Navigation Links -->
        <div 
          v-for="(section, index) in footerSections"
          :key="index"
          class="footer-section"
        >
          <h3 class="section-title">{{ section.title }}</h3>
          <ul class="section-links">
            <li v-for="(link, linkIndex) in section.links" :key="linkIndex">
              <NuxtLink :to="link.url" class="section-link">
                {{ link.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter Signup -->
        <div v-if="showNewsletter" class="footer-section newsletter-section">
          <h3 class="section-title">{{ newsletterTitle }}</h3>
          <p class="newsletter-description">{{ newsletterDescription }}</p>
          <form @submit.prevent="handleNewsletterSubmit" class="newsletter-form">
            <div class="input-group">
              <input
                v-model="newsletterEmail"
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                class="newsletter-input"
                required
              />
              <button type="submit" class="newsletter-btn" :disabled="isSubmitting">
                <svg v-if="!isSubmitting" class="newsletter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                <svg v-else class="newsletter-icon spinner" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>
            <p v-if="newsletterMessage" class="newsletter-message" :class="{ 'error': newsletterError }">
              {{ newsletterMessage }}
            </p>
          </form>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            © {{ currentYear }} {{ siteName }}. {{ copyrightText }}
          </p>
          
          <!-- Legal Links -->
          <div v-if="legalLinks.length > 0" class="legal-links">
            <NuxtLink 
              v-for="(link, index) in legalLinks"
              :key="index"
              :to="link.url"
              class="legal-link"
            >
              {{ link.title }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // Logo Configuration
  logo: {
    type: String,
    default: ''
  },
  siteName: {
    type: String,
    default: 'My Store'
  },
  description: {
    type: String,
    default: 'Ihr vertrauensvoller Online-Shop für hochwertige Produkte und erstklassigen Service.'
  },
  
  // Newsletter
  showNewsletter: {
    type: Boolean,
    default: true
  },
  newsletterTitle: {
    type: String,
    default: 'Newsletter'
  },
  newsletterDescription: {
    type: String,
    default: 'Bleiben Sie über neue Produkte und Angebote informiert.'
  },
  
  // Copyright
  copyrightText: {
    type: String,
    default: 'Alle Rechte vorbehalten.'
  },
  
  // Styling
  backgroundColor: {
    type: String,
    default: '#1f2937'
  },
  textColor: {
    type: String,
    default: '#f9fafb'
  },
  accentColor: {
    type: String,
    default: '#3b82f6'
  }
})

const emit = defineEmits(['newsletter-submit'])

// Static Footer Sections - einfacher für Builder.io zu verwenden
const footerSections = [
  {
    title: 'Shop',
    links: [
      { title: 'Alle Produkte', url: '/shop' },
      { title: 'Kategorien', url: '/categories' },
      { title: 'Marken', url: '/brands' },
      { title: 'Angebote', url: '/deals' }
    ]
  },
  {
    title: 'Kundenservice',
    links: [
      { title: 'Kontakt', url: '/contact' },
      { title: 'FAQ', url: '/faq' },
      { title: 'Versand & Lieferung', url: '/shipping' },
      { title: 'Rückgabe & Umtausch', url: '/returns' }
    ]
  },
  {
    title: 'Unternehmen',
    links: [
      { title: 'Über uns', url: '/about' },
      { title: 'Karriere', url: '/careers' },
      { title: 'Presse', url: '/press' },
      { title: 'Nachhaltigkeit', url: '/sustainability' }
    ]
  }
]

// Legal Links
const legalLinks = [
  { title: 'Impressum', url: '/impressum' },
  { title: 'Datenschutz', url: '/privacy' },
  { title: 'AGB', url: '/terms' },
  { title: 'Cookies', url: '/cookies' }
]

// Social Links with SVG icons
const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://facebook.com',
    icon: {
      template: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    }
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com',
    icon: {
      template: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.324c.876-.807 2.027-1.297 3.324-1.297s2.448.49 3.324 1.297c.807.876 1.297 2.027 1.297 3.324s-.49 2.448-1.297 3.324c-.876.807-2.027 1.297-3.324 1.297zm7.098 0c-1.297 0-2.448-.49-3.324-1.297-.807-.876-1.297-2.027-1.297-3.324s.49-2.448 1.297-3.324c.876-.807 2.027-1.297 3.324-1.297s2.448.49 3.324 1.297c.807.876 1.297 2.027 1.297 3.324s-.49 2.448-1.297 3.324c-.876.807-2.027 1.297-3.324 1.297z"/></svg>`
    }
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com',
    icon: {
      template: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`
    }
  }
]

// State
const newsletterEmail = ref('')
const isSubmitting = ref(false)
const newsletterMessage = ref('')
const newsletterError = ref(false)

// Computed
const currentYear = computed(() => new Date().getFullYear())

// Methods
const handleNewsletterSubmit = async () => {
  if (!newsletterEmail.value.trim()) return
  
  isSubmitting.value = true
  newsletterMessage.value = ''
  newsletterError.value = false
  
  try {
    // Emit event to parent component
    emit('newsletter-submit', newsletterEmail.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    newsletterMessage.value = 'Vielen Dank für Ihre Anmeldung!'
    newsletterEmail.value = ''
  } catch (error) {
    newsletterError.value = true
    newsletterMessage.value = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.footer {
  background: var(--color-background-primary);
  color: v-bind(textColor);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem 0;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Logo Section */
.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.logo-image {
  height: 40px;
  width: auto;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: v-bind(textColor);
}

.footer-description {
  color: #9ca3af;
  line-height: 1.6;
  margin: 0;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: v-bind(textColor);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: v-bind(accentColor);
  transform: translateY(-2px);
}

.social-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Navigation Sections */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind(textColor);
  margin: 0 0 1rem 0;
  border-bottom: 2px solid v-bind(accentColor);
  padding-bottom: 0.5rem;
}

.section-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-link {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  line-height: 1.5;
}

.section-link:hover {
  color: v-bind(accentColor);
}

/* Newsletter Section */
.newsletter-section {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.newsletter-description {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.newsletter-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: v-bind(textColor);
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.newsletter-input::placeholder {
  color: #9ca3af;
}

.newsletter-input:focus {
  border-color: v-bind(accentColor);
  background: rgba(255, 255, 255, 0.15);
}

.newsletter-btn {
  padding: 0.75rem;
  background: v-bind(accentColor);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
}

.newsletter-btn:hover:not(:disabled) {
  background: color-mix(in srgb, v-bind(accentColor) 90%, black);
  transform: translateY(-1px);
}

.newsletter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.newsletter-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.newsletter-message {
  font-size: 0.875rem;
  margin: 0;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
}

.newsletter-message:not(.error) {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.newsletter-message.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 0;
}

.footer-bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.copyright {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.legal-link {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.legal-link:hover {
  color: v-bind(accentColor);
}

/* Responsive */
@media (min-width: 768px) {
  .footer-main {
    grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  }
  
  .footer-bottom-content {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
  
  .input-group {
    flex-direction: row;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
}

@media (min-width: 1024px) {
  .footer-container {
    padding: 4rem 1rem 0;
  }
  
  .footer-main {
    gap: 3rem;
  }
}

@media (max-width: 767px) {
  .footer-container {
    padding: 2rem 0.5rem 0;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .legal-links {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>