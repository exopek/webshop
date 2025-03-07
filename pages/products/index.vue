

<template>
    <Content :api-key="apiKey" :model="model" :content="content" />
</template>

<script setup>
    import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
import { ref } from 'vue';

const route = useRoute();

const apiKey = 'b2253c87fe4d4111ad4211f05e4080bb';
const canShowContent = ref(false);
const model = 'product-card';

const { data: content } = await useAsyncData('builderData', () =>
  fetchOneEntry({
    model,
    apiKey,
    userAttributes: {
      urlPath: route.path,
    },
  })
);

canShowContent.value = content.value ? true : isPreviewing(route.path);
</script>
