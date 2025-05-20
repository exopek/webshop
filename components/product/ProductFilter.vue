<template>
  <div class="product-filter">
    <h3>Filter Produkte</h3>
    <div class="filter-group">
      <label for="category">Kategorie:</label>
      <select id="category" v-model="selectedCategory" @change="applyFilters">
        <option value="">Alle</option>
        <option value="electronics">Elektronik</option>
        <option value="fashion">Mode</option>
        <option value="home">Haushalt</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="price">Preisbereich:</label>
      <input type="range" id="price" v-model="selectedPrice" min="0" max="1000" @input="applyFilters" />
      <span>{{ selectedPrice }} €</span>
    </div>
    <div class="filter-group">
      <label for="availability">Verfügbarkeit:</label>
      <input type="checkbox" id="availability" v-model="onlyAvailable" @change="applyFilters" />
      <span>Nur verfügbare Produkte</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const selectedCategory = ref('');
const selectedPrice = ref(1000);
const onlyAvailable = ref(false);
const router = useRouter();

function applyFilters() {
  const query: any = {};

  if (selectedCategory.value) {
    query.category = selectedCategory.value;
  }
  if (selectedPrice.value) {
    query.price = selectedPrice.value;
  }
  if (onlyAvailable.value) {
    query.available = onlyAvailable.value;
  }

  router.push({ query });
}
</script>

<style scoped>
.product-filter {
  margin-bottom: 20px;
}
.filter-group {
  margin-bottom: 10px;
}
</style>
