<template>
    <div class="cart-container">
      <!-- Warenkorb-Icon in der Navigationsleiste -->
      <!-- <button @click="toggleCart" class="cart-icon">
        🛒 <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
      </button> -->
  
      <!-- Der Warenkorb, der von der Seite hereinfliegt -->
      <Transition name="slide-in">
        <div v-if="props.isOpen" class="cart-sidebar">
          <div class="cart-header">
            <h3>Warenkorb</h3>
            <button class="close-button" @click="closeCart">×</button>
          </div>
          <div v-if="cartData && cartData.items && cartData.items.length > 0" class="cart-items">
            <div v-for="item in cartData.items" :key="item.id" class="cart-item">
              <div class="cart-item-image" v-if="item.featuredImage">
                <img :src="item.featuredImage" :alt="item.title" />
              </div>
              <div class="cart-item-info">
                <h4>{{ item.title }}</h4>
                <p>Menge: {{ item.quantity }}</p>
                <p>Preis: {{ formatMoney(item.price) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="cart-empty">
            <p>Dein Warenkorb ist leer.</p>
          </div>
          <div v-if="cartData && cartData.totalAmount > 0" class="cart-total">
            <p>Gesamtbetrag: {{ formatMoney(cartData.totalAmount) }}</p>
            <button class="checkout-button" @click="goToCheckout">Zur Kasse</button>
          </div>
        </div>
      </Transition>
  
      <!-- Hintergrund-Overlay für den Warenkorb -->
      <Transition name="fade">
        <div v-if="props.isOpen" class="cart-overlay" @click="toggleCart"></div>
      </Transition>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref, watch, computed } from 'vue';
  import { useShopifyCardStore } from '../../store/shopifyCardStore';
  
  const shopifyStore = useShopifyCardStore();
  const cartData = ref<any>(null);
  const isCartOpen = ref(false);

  const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

// Events definieren
const emit = defineEmits(['close', 'update:isOpen']);

function closeCart() {
  emit('close');
  emit('update:isOpen', props.isOpen);
}
  
  const cartItemCount = computed(() => {
    return cartData.value?.totalQuantity || 0;
  });
  
  function toggleCart() {
    isCartOpen.value = !isCartOpen.value;
    
    // Bei Öffnen des Warenkorbs die Daten aktualisieren
    if (isCartOpen.value) {
      loadCartData();
    }
  }


  
  async function loadCartData() {
    try {
      cartData.value = await shopifyStore.getCartData();
      console.log('Artikel im Warenkorb:', cartData.value?.items);
      console.log('Gesamtbetrag:', cartData.value?.totalAmount);
    } catch (error) {
      console.error('Fehler beim Laden der Warenkorbdaten:', error);
    }
  }
  
  function formatMoney(amount: number) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: cartData.value?.currencyCode || 'EUR'
    }).format(amount);
  }
  
  function goToCheckout() {
    if (cartData.value?.checkoutUrl) {
      window.location.href = cartData.value.checkoutUrl;
    }
  }
  
  onMounted(async () => {
    await loadCartData();
  });
  
  
  </script>
  
  <style scoped>
  /* Warenkorb-Icon-Styling */
  .cart-icon {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    position: relative;
    padding: 5px;
  }
  
  .cart-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: red;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    min-width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
  }
  
  /* Warenkorb-Sidebar-Styling */
  .cart-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    background-color: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
  }
  
  /* Hintergrund-Overlay */
  .cart-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  
  /* Warenkorb-Header */
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e1e1e1;
  }
  
  .cart-header h3 {
    margin: 0;
    font-size: 20px;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    color: #666;
    line-height: 1;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-button:hover {
    color: #333;
  }
  
  /* Warenkorb-Inhalte */
  .cart-items {
    margin-bottom: 20px;
  }
  
  .cart-item {
    display: flex;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e1e1e1;
  }
  
  .cart-item-image {
    width: 80px;
    height: 80px;
    margin-right: 15px;
    flex-shrink: 0;
  }
  
  .cart-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .cart-item-info {
    flex-grow: 1;
  }
  
  .cart-item-info h4 {
    margin: 0 0 5px 0;
    font-size: 16px;
  }
  
  .cart-item-info p {
    margin: 0 0 5px 0;
    font-size: 14px;
    color: #666;
  }
  
  .cart-empty {
    text-align: center;
    padding: 20px 0;
    color: #666;
  }
  
  .cart-total {
    margin-top: 20px;
    font-weight: bold;
  }
  
  .checkout-button {
    display: block;
    width: 100%;
    padding: 12px;
    margin-top: 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
  }
  
  .checkout-button:hover {
    background-color: #45a049;
  }
  
  /* Transitions */
  .slide-in-enter-active,
  .slide-in-leave-active {
    transition: transform 0.3s ease;
  }
  
  .slide-in-enter-from,
  .slide-in-leave-to {
    transform: translateX(100%);
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>