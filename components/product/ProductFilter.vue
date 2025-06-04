<template>
  <div class="product-filter">
    <div class="filter-container">
      <!-- Filter Header -->
      <div class="filter-header">
        <h3 class="filter-title">Filter & Sortierung</h3>
        <button @click="clearFilters" class="clear-filters">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Zurücksetzen
        </button>
      </div>

      <div class="filter-content">
        <!-- Sortierung -->
        <div class="filter-section">
          <label class="filter-label">Sortieren nach</label>
          <select v-model="sortBy" @change="applyFilters" class="filter-select">
            <option value="">Standard</option>
            <option value="price_asc">Preis: Niedrig → Hoch</option>
            <option value="price_desc">Preis: Hoch → Niedrig</option>
            <option value="title_asc">Name: A → Z</option>
            <option value="title_desc">Name: Z → A</option>
            <option value="created_desc">Neueste zuerst</option>
          </select>
        </div>

        <!-- Preis Range -->
        <div class="filter-section">
          <label class="filter-label">Preisbereich</label>
          <div class="price-range">
            <div class="price-inputs">
              <input
                v-model.number="minPrice"
                @input="debouncedApplyFilters"
                type="number"
                placeholder="Min"
                class="price-input"
                min="0"
              />
              <span class="price-separator">–</span>
              <input
                v-model.number="maxPrice"
                @input="debouncedApplyFilters"
                type="number"
                placeholder="Max"
                class="price-input"
                min="0"
              />
            </div>
            <div class="price-display">
              {{ formatPrice(minPrice || 0) }} - {{ formatPrice(maxPrice || 1000) }}
            </div>
          </div>
        </div>

        <!-- Kategorie -->
        <div class="filter-section">
          <label class="filter-label">Kategorie</label>
          <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
            <option value="">Alle Kategorien</option>
            <option value="electronics">Elektronik</option>
            <option value="fashion">Mode</option>
            <option value="home">Haushalt</option>
            <option value="sports">Sport</option>
          </select>
        </div>

        <!-- Verfügbarkeit -->
        <div class="filter-section">
          <label class="filter-label">Verfügbarkeit</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input
                v-model="onlyAvailable"
                @change="applyFilters"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-label">Nur verfügbare Artikel</span>
            </label>
            <label class="checkbox-item">
              <input
                v-model="onSale"
                @change="applyFilters"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-label">Nur Sale-Artikel</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Ergebnis Counter -->
      <div v-if="productCount !== undefined" class="result-counter">
        {{ productCount }} {{ productCount === 1 ? 'Produkt' : 'Produkte' }} gefunden
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  productCount: {
    type: Number,
    default: undefined
  }
});

const emit = defineEmits(['filterChange']);

const selectedCategory = ref('');
const sortBy = ref('');
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const onlyAvailable = ref(false);
const onSale = ref(false);
const router = useRouter();

let debounceTimer: any = null;

function debouncedApplyFilters() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    applyFilters();
  }, 500);
}

function applyFilters() {
  const query: any = {};
  const filters: any = {};

  if (selectedCategory.value) {
    query.category = selectedCategory.value;
    filters.category = selectedCategory.value;
  }
  if (sortBy.value) {
    query.sortBy = sortBy.value;
    filters.sortBy = sortBy.value;
  }
  if (minPrice.value) {
    query.minPrice = minPrice.value;
    filters.minPrice = minPrice.value;
  }
  if (maxPrice.value) {
    query.maxPrice = maxPrice.value;
    filters.maxPrice = maxPrice.value;
  }
  if (onlyAvailable.value) {
    query.available = onlyAvailable.value;
    filters.available = onlyAvailable.value;
  }
  if (onSale.value) {
    query.onSale = onSale.value;
    filters.onSale = onSale.value;
  }

  router.push({ query });
  emit('filterChange', filters);
}

function clearFilters() {
  selectedCategory.value = '';
  sortBy.value = '';
  minPrice.value = null;
  maxPrice.value = null;
  onlyAvailable.value = false;
  onSale.value = false;
  
  router.push({ query: {} });
  emit('filterChange', {});
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0
  }).format(price);
}
</script>

<style scoped>
.product-filter {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.filter-container {
  padding: 1.5rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.clear-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.clear-filters:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.filter-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.price-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.price-separator {
  color: #6b7280;
  font-weight: 500;
}

.price-display {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.result-counter {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filter-content {
    grid-template-columns: 1fr;
  }
  
  .filter-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 640px) {
  .filter-container {
    padding: 1rem;
  }
  
  .price-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .price-separator {
    text-align: center;
  }
}
</style>
