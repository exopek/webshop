<template>
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Cart Header -->
      <h1 class="text-5xl font-bold mb-12">Your cart</h1>
      
      <div v-if="cartData && cartData.items && cartData.items.length > 0" class="flex flex-col lg:flex-row lg:gap-12">
        <!-- Cart Items Section -->
        <div class="flex-grow">
          <!-- Cart Item -->
          <div v-for="(item, index) in cartData.items" :key="index" class="flex items-start py-6 border-b">
            <!-- Product Image -->
            <div class="w-20 h-20 mr-4 bg-gray-100 flex items-center justify-center">
              <img :src="item.image" :alt="item.title" class="max-w-full max-h-full object-contain" />
            </div>
            
            <!-- Product Details -->
            <div class="flex-grow">
              <h3 class="font-medium">{{ item.title }}</h3>
              <p class="text-gray-700">{{ formatMoney(item.price) }}</p>
            </div>
            
            <!-- Quantity Controls -->
            <div class="flex flex-col items-center mr-4">
              <button @click="updateCartItem(item.id, item.quantity + 1)" class="text-gray-500 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <span class="my-1">{{ item.quantity }}</span>
              <button @click="updateCartItem(item.id, Math.max(1, item.quantity - 1))" class="text-gray-500 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
            
            <!-- Item Total & Remove -->
            <div class="text-right">
              <p class="font-medium">{{ formatMoney(item.price * item.quantity) }}</p>
              <button @click="shopifyStore.removeCartItem(item.id)" class="text-sm text-gray-600 hover:underline mt-1">
                Remove
              </button>
            </div>
          </div>
        </div>
        
        <!-- Cart Summary -->
        <div class="lg:w-96 mt-8 lg:mt-0">
          <!-- Free Shipping Progress -->
          <div v-if="cartData.freeShippingThreshold && cartData.totalAmount < cartData.freeShippingThreshold" class="mb-6">
            <p class="mb-2">
              Spend <span class="font-medium">{{ formatMoney(cartData.freeShippingThreshold - cartData.totalAmount) }}</span>
              more to reach free shipping!
            </p>
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-black" 
                :style="`width: ${Math.min(100, (cartData.totalAmount / cartData.freeShippingThreshold) * 100)}%`"
              ></div>
            </div>
          </div>
          
          <!-- Cart Totals -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center text-xl font-medium mb-2">
              <span>Subtotal</span>
              <span>{{ formatMoney(cartData.totalAmount) }}</span>
            </div>
            <p class="text-gray-500 text-sm mb-6">
              Tax included. <nuxt-link to="/shipping" class="underline">Shipping</nuxt-link> calculated at checkout.
            </p>
            
            <!-- Checkout Buttons -->
            <button @click="goToCheckout" class="w-full bg-black text-white py-4 px-4 rounded-md mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Check out
            </button>
            
            <!-- Alternative Payment Methods -->
            <div class="grid grid-cols-2 gap-3">
              <button class="bg-indigo-600 text-white py-3 px-4 rounded-md flex items-center justify-center">
                <span class="font-medium">Shop</span>
                <span class="font-light">Pay</span>
              </button>
              <button class="bg-black text-white py-3 px-4 rounded-md flex items-center justify-center">
                <span class="font-medium">G</span>
                <span class="font-normal">Pay</span>
              </button>
            </div>
            
            <!-- Payment Methods -->
            <!-- <div class="mt-6">
              <p class="text-sm text-gray-500 mb-2 text-center">We accept</p>
              <div class="flex flex-wrap justify-center gap-2">
                <div class="h-6">
                  <img src="/images/payment/amex.svg" alt="American Express" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/applepay.svg" alt="Apple Pay" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/gpay.svg" alt="Google Pay" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/klarna.svg" alt="Klarna" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/mastercard.svg" alt="Mastercard" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/maestro.svg" alt="Maestro" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/shoppay.svg" alt="Shop Pay" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/unionpay.svg" alt="Union Pay" class="h-full object-contain" />
                </div>
                <div class="h-6">
                  <img src="/images/payment/visa.svg" alt="Visa" class="h-full object-contain" />
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </div>
      
      <!-- Empty Cart Message -->
      <div v-else-if="cartData && !loadingError" class="py-8 text-center">
        <p class="text-gray-500">Your cart is empty</p>
        <nuxt-link to="/products" class="mt-4 inline-block text-blue-600 hover:underline">
          Continue shopping
        </nuxt-link>
      </div>
      
      <!-- Loading Error Message -->
      <div v-else-if="loadingError" class="py-8 text-center">
        <p class="text-red-500">There was an error loading your cart. Please try again later.</p>
      </div>
      
      <!-- Loading State -->
      <div v-else class="py-8 text-center">
        <p class="text-gray-500">Loading your cart...</p>
      </div>
      
      <!-- Continue Shopping Button (at top right in larger screens) -->
      <div class="hidden lg:block absolute top-24 right-8">
        <nuxt-link to="/products" class="flex items-center text-gray-800 hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Continue shopping
        </nuxt-link>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref, watch, computed } from "vue";
  import { useShopifyCardStore } from "../../store/shopifyCardStore";
  
  const shopifyStore = useShopifyCardStore();
  const cartData = ref<any>(null);
  const builderContent = ref<any>(null);
  const loadingError = ref(false);
  const apiKey = "b2253c87fe4d4111ad4211f05e4080bb";
  const model = "product-card";
  const quantity = ref(1);
  
  const cartItemCount = computed(() => {
    return cartData.value?.totalQuantity || 0;
  });
  
  async function loadCartData() {
    try {
      cartData.value = await shopifyStore.getCartData();
      console.log("Artikel im Warenkorb:", cartData.value?.items);
      console.log("Gesamtbetrag:", cartData.value?.totalAmount);
    } catch (error) {
      console.error("Fehler beim Laden der Warenkorbdaten:", error);
      loadingError.value = true;
    }
  }
  
  function formatMoney(amount: number) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: cartData.value?.currencyCode || "EUR",
    }).format(amount);
  }
  
  function goToCheckout() {
    if (cartData.value?.checkoutUrl) {
      window.location.href = cartData.value.checkoutUrl;
    }
  }

  function updateCartItem(variantId: string, quantity: number) {
    //shopifyStore.updateCartItem(variantId, quantity);
    console.log("Update Cart Item", variantId, quantity);
  }
  
  onMounted(async () => {
    await loadCartData();
  });
  </script>