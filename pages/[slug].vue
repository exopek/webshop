<template>
  
  <div>
    
    <Content 
    :api-key="apiKey" 
    :model="model" 
    :content="content"
    :customComponents="registeredComponents"
     />
    
      
  
   
  </div>
</template>
<script setup>
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
import  { registeredComponents } from '~/plugins/builder-components';
import { ref } from 'vue';

const route = useRoute();

const config = useRuntimeConfig();
const apiKey = config.public.BUILDER_API_KEY;

const canShowContent = ref(false);
const model = 'page';

const { data: content } = await useAsyncData('builderData', () =>
  fetchOneEntry({
    model,
    apiKey,
    userAttributes: {
      urlPath: route.path,
    },
    methods: {
      ...registeredComponents
    },
  })
);

canShowContent.value = content.value ? true : isPreviewing(route.path);
</script>
