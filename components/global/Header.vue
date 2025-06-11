<template>
  <header class="header" :class="{ 'header-scrolled': isScrolled }">
    <div class="header-container">
      <!-- Logo Section -->
      <div class="header-logo">
        <NuxtLink to="/" class="logo-link">
          <img v-if="logo" :src="logo" :alt="siteName" class="logo-image" />
          <span v-else class="logo-text">{{ siteName }}</span>
        </NuxtLink>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav" :class="{ 'nav-hidden': isMobileMenuOpen }">
        <ul class="nav-list">
          <li 
            v-for="(item, index) in navigationItems" 
            :key="index"
            class="nav-item"
            :class="{ 'has-dropdown': item.children && item.children.length > 0 }"
            @mouseenter="showMegaMenu(index)"
            @mouseleave="hideMegaMenu()"
          >
            <NuxtLink 
              v-if="!item.children || item.children.length === 0"
              :to="item.url || '/'"
              class="nav-link"
              :class="{ 'active': isActiveRoute(item.url) }"
            >
              {{ item.title }}
            </NuxtLink>
            
            <button 
              v-else
              class="nav-link dropdown-trigger"
              :class="{ 'active': activeMegaMenu === index }"
              @click="toggleMegaMenu(index)"
            >
              {{ item.title }}
              <svg class="dropdown-icon" :class="{ 'rotated': activeMegaMenu === index }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Mega Menu -->
            <div 
              v-if="item.children && item.children.length > 0"
              class="mega-menu"
              :class="{ 'mega-menu-active': activeMegaMenu === index }"
            >
              <div class="mega-menu-container">
                <div class="mega-menu-grid">
                  <div 
                    v-for="(category, catIndex) in item.children" 
                    :key="catIndex"
                    class="mega-menu-category"
                  >
                    <h3 class="category-title">{{ category.title }}</h3>
                    <ul class="category-links">
                      <li v-for="(link, linkIndex) in category.children" :key="linkIndex">
                        <NuxtLink :to="link.url || '/'" class="category-link">
                          {{ link.title }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <!-- Featured Content -->
                <div v-if="item.featured" class="mega-menu-featured">
                  <div class="featured-content">
                    <img v-if="item.featured.image" :src="item.featured.image" :alt="item.featured.title" class="featured-image" />
                    <div class="featured-text">
                      <h4 class="featured-title">{{ item.featured.title }}</h4>
                      <p class="featured-description">{{ item.featured.description }}</p>
                      <NuxtLink v-if="item.featured.url" :to="item.featured.url" class="featured-link">
                        {{ item.featured.buttonText || 'Mehr erfahren' }}
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      <!-- Header Actions -->
      <div class="header-actions">
        <!-- Search -->
        <button v-if="showSearch" @click="toggleSearch" class="action-btn search-btn">
          <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>

        <!-- User Account -->
        <button v-if="showAccount" @click="toggleAccount" class="action-btn account-btn">
          <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </button>

        <!-- Shopping Cart -->
        <button v-if="showCart" @click="toggleCart" class="action-btn cart-btn">
          <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8L5 7m2 6l3 8m-3-8h10m-10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"/>
          </svg>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </button>

        <!-- Mobile Menu Toggle -->
        <button @click="toggleMobileMenu" class="mobile-menu-toggle">
          <svg v-if="!isMobileMenuOpen" class="hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Overlay -->
    <Transition name="search-fade">
      <div v-if="isSearchOpen" class="search-overlay">
        <div class="search-container">
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text" 
            placeholder="Nach Produkten suchen..."
            class="search-input"
            @keyup.enter="performSearch"
          />
          <button @click="performSearch" class="search-submit">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
          <button @click="toggleSearch" class="search-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Mobile Sidebar -->
    <Transition name="sidebar">
      <div v-if="isMobileMenuOpen" class="mobile-sidebar-overlay" @click="closeMobileMenu">
        <nav class="mobile-sidebar" @click.stop>
          <div class="mobile-sidebar-header">
            <div class="mobile-logo">
              <img v-if="logo" :src="logo" :alt="siteName" class="logo-image" />
              <span v-else class="logo-text">{{ siteName }}</span>
            </div>
            <button @click="closeMobileMenu" class="mobile-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="mobile-nav-content">
            <ul class="mobile-nav-list">
              <li v-for="(item, index) in navigationItems" :key="index" class="mobile-nav-item">
                <div class="mobile-nav-group">
                  <NuxtLink 
                    v-if="!item.children || item.children.length === 0"
                    :to="item.url || '/'"
                    class="mobile-nav-link"
                    @click="closeMobileMenu"
                  >
                    {{ item.title }}
                  </NuxtLink>
                  
                  <button 
                    v-else
                    class="mobile-nav-link mobile-dropdown-trigger"
                    :class="{ 'active': activeMobileDropdown === index }"
                    @click="toggleMobileDropdown(index)"
                  >
                    {{ item.title }}
                    <svg class="mobile-dropdown-icon" :class="{ 'rotated': activeMobileDropdown === index }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <!-- Mobile Dropdown -->
                  <div 
                    v-if="item.children && item.children.length > 0"
                    class="mobile-dropdown"
                    :class="{ 'mobile-dropdown-active': activeMobileDropdown === index }"
                  >
                    <div v-for="(category, catIndex) in item.children" :key="catIndex" class="mobile-category">
                      <h4 class="mobile-category-title">{{ category.title }}</h4>
                      <ul class="mobile-category-links">
                        <li v-for="(link, linkIndex) in category.children" :key="linkIndex">
                          <NuxtLink 
                            :to="link.url || '/'" 
                            class="mobile-category-link"
                            @click="closeMobileMenu"
                          >
                            {{ link.title }}
                          </NuxtLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <!-- Mobile Actions -->
            <div class="mobile-actions">
              <button v-if="showSearch" @click="openMobileSearch" class="mobile-action-btn">
                <svg class="mobile-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Suchen
              </button>
              
              <button v-if="showAccount" @click="handleMobileAccount" class="mobile-action-btn">
                <svg class="mobile-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Mein Konto
              </button>
            </div>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

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
  
  // Navigation wird über props nicht mehr konfiguriert - statisch für bessere Builder.io Integration
  
  // Feature Toggles
  showSearch: {
    type: Boolean,
    default: true
  },
  showAccount: {
    type: Boolean,
    default: true
  },
  showCart: {
    type: Boolean,
    default: true
  },
  
  // Cart
  cartCount: {
    type: Number,
    default: 0
  },
  
  // Styling
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#1f2937'
  },
  accentColor: {
    type: String,
    default: '#3b82f6'
  }
})

const emit = defineEmits(['search', 'toggle-cart', 'toggle-account'])

const route = useRoute()

// Static Navigation - einfacher für Builder.io zu verwenden
const navigationItems = [
  {
    title: 'Home',
    url: '/'
  },
  {
    title: 'Shop',
    children: [
      {
        title: 'Kategorien',
        children: [
          { title: 'Elektronik', url: '/shop/electronics' },
          { title: 'Mode', url: '/shop/fashion' },
          { title: 'Haushalt', url: '/shop/home' },
          { title: 'Sport', url: '/shop/sports' }
        ]
      },
      {
        title: 'Marken',
        children: [
          { title: 'Apple', url: '/brands/apple' },
          { title: 'Samsung', url: '/brands/samsung' },
          { title: 'Nike', url: '/brands/nike' },
          { title: 'Adidas', url: '/brands/adidas' }
        ]
      }
    ],
    featured: {
      title: 'Neue Kollektion',
      description: 'Entdecken Sie unsere neuesten Produkte',
      image: 'https://placehold.co/300x200',
      url: '/new-collection',
      buttonText: 'Jetzt shoppen'
    }
  },
  {
    title: 'Über uns',
    url: '/about'
  },
  {
    title: 'Kontakt',
    url: '/contact'
  }
]

// State
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const activeMegaMenu = ref(-1)
const activeMobileDropdown = ref(-1)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)

// Computed
const isActiveRoute = (url) => {
  if (!url) return false
  return route.path === url || route.path.startsWith(url + '/')
}

// Methods
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
  activeMobileDropdown.value = -1
}

const showMegaMenu = (index) => {
  activeMegaMenu.value = index
}

const hideMegaMenu = () => {
  activeMegaMenu.value = -1
}

const toggleMegaMenu = (index) => {
  activeMegaMenu.value = activeMegaMenu.value === index ? -1 : index
}

const toggleMobileDropdown = (index) => {
  activeMobileDropdown.value = activeMobileDropdown.value === index ? -1 : index
}

const toggleSearch = async () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    await nextTick()
    searchInput.value?.focus()
  }
}

const toggleCart = () => {
  emit('toggle-cart')
}

const toggleAccount = () => {
  emit('toggle-account')
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    toggleSearch()
    searchQuery.value = ''
  }
}

const openMobileSearch = () => {
  closeMobileMenu()
  setTimeout(() => {
    toggleSearch()
  }, 300)
}

const handleMobileAccount = () => {
  closeMobileMenu()
  setTimeout(() => {
    toggleAccount()
  }, 300)
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: v-bind(backgroundColor);
  color: v-bind(textColor);
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-scrolled {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

/* Logo */
.header-logo {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
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

/* Desktop Navigation */
.desktop-nav {
  display: none;
  flex: 1;
  justify-content: center;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0;
  text-decoration: none;
  color: v-bind(textColor);
  font-weight: 500;
  transition: color 0.2s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-link:hover,
.nav-link.active {
  color: v-bind(accentColor);
}

.dropdown-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* Mega Menu */
.mega-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
}

.mega-menu-active {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.mega-menu-container {
  padding: 2rem;
  display: flex;
  gap: 2rem;
}

.mega-menu-grid {
  flex: 2;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.mega-menu-category {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  border-bottom: 2px solid v-bind(accentColor);
  padding-bottom: 0.5rem;
}

.category-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.category-link:hover {
  color: v-bind(accentColor);
}

.mega-menu-featured {
  flex: 1;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.featured-image {
  width: 100%;
  border-radius: 6px;
}

.featured-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.featured-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.featured-link {
  display: inline-block;
  background: v-bind(accentColor);
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  text-align: center;
}

.featured-link:hover {
  background: color-mix(in srgb, v-bind(accentColor) 90%, black);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.action-btn {
  position: relative;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: v-bind(textColor);
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 1.25rem;
  text-align: center;
  line-height: 1;
}

.mobile-menu-toggle {
  display: block;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: v-bind(textColor);
}

.hamburger-icon,
.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Search Overlay */
.search-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  z-index: 999;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: v-bind(accentColor);
}

.search-submit,
.search-close {
  padding: 0.75rem;
  background: v-bind(accentColor);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-close {
  background: #6b7280;
}

.search-submit:hover {
  background: color-mix(in srgb, v-bind(accentColor) 90%, black);
}

.search-close:hover {
  background: #4b5563;
}

.search-submit svg,
.search-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Mobile Sidebar */
.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1002;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  max-width: 85vw;
  background: white;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.mobile-logo .logo-image {
  height: 32px;
}

.mobile-logo .logo-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.mobile-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
}

.mobile-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.mobile-nav-content {
  flex: 1;
  padding: 1rem;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  border-bottom: 1px solid #f3f4f6;
}

.mobile-nav-group {
  display: flex;
  flex-direction: column;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  text-decoration: none;
  color: #1f2937;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  text-align: left;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: v-bind(accentColor);
}

.mobile-dropdown-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.mobile-dropdown-icon.rotated {
  transform: rotate(180deg);
}

.mobile-dropdown {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-dropdown-active {
  max-height: 500px;
}

.mobile-category {
  padding: 0.5rem 0;
  border-left: 2px solid v-bind(accentColor);
  padding-left: 1rem;
  margin: 0.5rem 0;
}

.mobile-category-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.mobile-category-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-category-link {
  display: block;
  padding: 0.5rem 0;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.mobile-category-link:hover {
  color: v-bind(accentColor);
}

.mobile-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #1f2937;
  transition: background-color 0.2s ease;
}

.mobile-action-btn:hover {
  background: #f3f4f6;
}

.mobile-action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Transitions */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: all 0.3s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}

.sidebar-enter-active .mobile-sidebar-overlay,
.sidebar-leave-active .mobile-sidebar-overlay {
  transition: opacity 0.3s ease;
}

.sidebar-enter-from .mobile-sidebar-overlay,
.sidebar-leave-to .mobile-sidebar-overlay {
  opacity: 0;
}

/* Responsive */
@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
  
  .mobile-menu-toggle {
    display: none;
  }
}

@media (max-width: 767px) {
  .header-container {
    padding: 0 0.5rem;
  }
  
  .nav-hidden {
    display: none;
  }
}

/* Large Screens */
@media (min-width: 1200px) {
  .mega-menu {
    width: 1000px;
  }
  
  .mega-menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>