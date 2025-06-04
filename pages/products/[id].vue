<template>
  <div class="product-detail-container">
    <div v-if="isLoading" class="loading">Produkt wird geladen...</div>
    <div v-else-if="!product" class="not-found">Produkt nicht gefunden.</div>
    <div v-else>
      <!-- Builder.io Content falls verfügbar -->
      <Content :api-key="apiKey"
      model="page-detail" :data = "builderIoData" :customComponents="registeredComponents" :content="builderContent" :context="{
          addToCart,
          selectOption,
          incrementQuantity,
          decrementQuantity,
          formatPrice,
          isOptionValueAvailable
        }"  />
        
      
      
        
      <Cart :isOpen="isCartOpen"
        @close="isCartOpen = false"/>
    </div>
    
  </div>
  
</template>
  
  <script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useShopifyStore } from "../../store/shopifyStore";
import { useAsyncData, useRuntimeConfig } from "nuxt/app";
import { Content, fetchOneEntry, isPreviewing } from "@builder.io/sdk-vue";
import { useShopifyCardStore } from "../../store/shopifyCardStore";
import  { registeredComponents } from '../../plugins/builder-components';

// Route und Store
const route = useRoute();
const shopifyStore = useShopifyStore();
const shopifyCardStore = useShopifyCardStore();
const config = useRuntimeConfig();

// Produkt-Daten und Status
const product = ref<any>(null);
const builderContent = ref<any>(null);
const loadingError = ref(false);
const isLoading = ref(true);
const quantity = ref(1);
const isCartOpen = ref(false);
const selectedOptions = ref<Record<string, string>>({});

// Produkt-Handle aus der Route
const handle = computed(() => route.params.id as string);

const apiKey = "b2253c87fe4d4111ad4211f05e4080bb";
const model = "page-detail";

// Ausgewählte Variante basierend auf den gewählten Optionen
const selectedVariant = computed(() => {
  if (!product.value || !product.value.variants) return null;

  return product.value.variants.find((variant: any) => {
    return variant.selectedOptions.every((option: any) => {
      return selectedOptions.value[option.name] === option.value;
    });
  });
});

// Verfügbarkeit basierend auf der gewählten Variante
const isAvailable = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.availableForSale;
  }
  return product.value?.available || false;
});

const builderIoData = computed(() => {
  return {
    product: product,
    quantity: quantity,
    formatedPrice: formatPrice(product.value.price),
  };
});

const base64ProductId = computed(() => {
  return btoa(product.value.id);
});

// Produkt laden
async function loadProduct() {
  isLoading.value = true;

  try {
    // Produkt aus API laden
    product.value = await shopifyStore.fetchProduct(handle.value);
    console.log("Product-Details:", product);
    // Standardoptionen auswählen (erste verfügbare Option für jede Option)
    if (product.value && product.value.options) {
      product.value.options.forEach((option: any) => {
        // Erste verfügbare Option auswählen
        for (const value of option.values) {
          if (isOptionValueAvailable(option.name, value)) {
            selectedOptions.value[option.name] = value;
            break;
          }
        }
      });
    }
  } catch (error) {
    console.error("Error loading product:", error);
  } finally {
    isLoading.value = false;
  }
}

async function loadBuilderContent() {
  try {
    console.log("Loading Builder.io content for:", {
      model,
      urlPath: route.path,
      productId: handle.value,
      apiKey
    });

    // Versuche verschiedene Strategien für Builder.io Content
    let content = null;

    // 1. Versuche mit spezifischer URL
    try {
      content = await fetchOneEntry({
        model,
        apiKey,
        userAttributes: {
          urlPath: route.path,
        },
        options: {
          cachebust: true
        }
      });
      console.log("Content with URL targeting:", content);
    } catch (err) {
      console.log("URL targeting failed:", err);
    }

    // 2. Falls kein Content gefunden, versuche ohne URL-Targeting (Standard Template)
    if (!content) {
      try {
        content = await fetchOneEntry({
          model,
          apiKey,
          options: {
            cachebust: true
          }
        });
        console.log("Content without URL targeting:", content);
      } catch (err) {
        console.log("Standard template failed:", err);
      }
    }

    // 3. Falls immer noch kein Content, versuche mit Wildcard Pattern
    if (!content) {
      try {
        content = await fetchOneEntry({
          model,
          apiKey,
          userAttributes: {
            urlPath: '/products/*',
          },
          options: {
            cachebust: true
          }
        });
        console.log("Content with wildcard pattern:", content);
      } catch (err) {
        console.log("Wildcard pattern failed:", err);
      }
    }

    builderContent.value = content;
    console.log("Final builderContent:", builderContent.value);

  } catch (error) {
    console.error("Fehler beim Laden der Builder.io-Produktkarte:", error);
    loadingError.value = true;
  }
}

// Prüfen, ob eine Optionskombination verfügbar ist
function isOptionValueAvailable(optionName: string, optionValue: string) {
  if (!product.value || !product.value.variants) return false;

  // Aktuelle Auswahl kopieren
  const testOptions = { ...selectedOptions.value };
  testOptions[optionName] = optionValue;

  // Prüfen, ob es eine verfügbare Variante mit dieser Optionskombination gibt
  return product.value.variants.some((variant: any) => {
    // Prüfen, ob alle Optionen übereinstimmen
    const optionsMatch = variant.selectedOptions.every((option: any) => {
      return (
        !testOptions[option.name] || testOptions[option.name] === option.value
      );
    });

    return optionsMatch && variant.availableForSale;
  });
}

// Option auswählen
function selectOption(optionName: string, optionValue: string) {
  selectedOptions.value[optionName] = optionValue;
}

// Menge erhöhen
function incrementQuantity() {
  console.log("Menge erhöhen");
  console.log("Menage",quantity.value);
  if (
    selectedVariant.value &&
    quantity.value < selectedVariant.value.quantityAvailable
  ) {
    quantity.value++;
  } else if (!selectedVariant.value) {
    quantity.value++;
  }
}

// Menge verringern
function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

// In den Warenkorb legen
async function addToCart() {
  console.log("In den Warenkorb legen");
  if (!isAvailable.value) return;

  console.log("Produkt zum Warenkorb hinzufügen...", product.value.variant_id);
  const variantId = selectedVariant.value?.id || product.value.variant_id;
  const productToAdd = {
    id: variantId,
    title: product.value.title,
    variantTitle: selectedVariant.value?.title || "",
    price: selectedVariant.value?.price || product.value.price,
    image: selectedVariant.value?.image?.url || product.value.featured_image,
    quantity: quantity.value,
  };

  // Hier Ihre Warenkorb-Logik implementieren
  console.log("Produkt zum Warenkorb hinzugefügt:", productToAdd);
  try {
    // Produkt add to cart
    await shopifyCardStore.addToCart(variantId, 1);

    // Warenkorb öffnen
    console.log("Warenkorb öffnen");
    isCartOpen.value = true;
  } catch (error) {
    console.error("Error adding to  art:", error);
  } finally {
    isLoading.value = false;
  }

}

// Preis formatieren
function formatPrice(price: number) {
  if (!price) return "€0,00";

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

// Produkt bei Seitenaufruf laden
onMounted(() => {
  loadProduct();
  loadBuilderContent();
});

// Bei Änderung der Route (z.B. Navigation zu einem anderen Produkt) neu laden
watch(
  () => route.params.handle,
  () => {
    if (route.params.handle) {
      loadProduct();
      // Zurücksetzen des Zustands
      selectedOptions.value = {};
      quantity.value = 1;
    }
  }
);
</script>
  
  <style scoped>
.loading,
.not-found {
  padding: 3rem;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 2rem 0;
}
</style>
